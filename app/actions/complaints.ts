"use server";

import { requireRole } from "@/lib/dal";
import { Role, Priority } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { complaintInputSchema, type ComplaintInput } from "@/lib/validations/complaint";
import { revalidatePath } from "next/cache";

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitComplaintAction(
  rawInput: ComplaintInput
): Promise<ActionResponse<{ complaintRefId: string; id: string }>> {
  try {
    // 1. DAL Role Authorization Check: Only verified STUDENTS can lodge complaints
    const session = await requireRole([Role.STUDENT]);

    // 2. Strict Zod Schema Parsing & Sanitization
    const validationResult = complaintInputSchema.safeParse(rawInput);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validData = validationResult.data;

    // 3. Verify subcategory exists
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: validData.subCategoryId },
    });

    if (!subCategory) {
      return { success: false, error: "Invalid maintenance category selected" };
    }

    // 4. Compute SLA deadlines
    const isEmergency = validData.priority === Priority.EMERGENCY || validData.emergencyFlag;
    const slaHours = isEmergency ? 2 : subCategory.defaultTATHours || 24;
    const tatDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    // Generate unique reference
    const count = await prisma.complaint.count();
    const complaintRefId = `HCMS-${String(count + 1).padStart(5, "0")}`;

    // 5. Database Execution with enforced session student ID (prevents IDOR)
    const newComplaint = await prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          complaintRefId,
          studentId: session.userId, // Hard-pinned from verified DAL session
          subCategoryId: validData.subCategoryId,
          location: validData.location,
          description: validData.description,
          priority: isEmergency ? Priority.EMERGENCY : validData.priority,
          emergencyFlag: isEmergency,
          tatDeadline,
        },
      });

      // Audit Log insertion for compliance tracking
      await tx.auditLog.create({
        data: {
          complaintId: complaint.id,
          userId: session.userId,
          actionTaken: "COMPLAINT_LOGGED",
          metadata: { isEmergency, location: validData.location },
        },
      });

      return complaint;
    });

    revalidatePath("/student");
    revalidatePath("/warden");
    revalidatePath("/coordinator");
    return {
      success: true,
      data: { complaintRefId: newComplaint.complaintRefId, id: newComplaint.id },
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AuthorizationError") {
      return { success: false, error: "Forbidden: Only enrolled students can submit tickets" };
    }
    return { success: false, error: "Internal server error occurred while lodging ticket" };
  }
}
