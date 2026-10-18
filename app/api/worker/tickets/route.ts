import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, complaintId, workerId, resolutionNotes } = body;

    if (!complaintId || !workerId) {
      return NextResponse.json(
        { success: false, error: "Missing complaintId or workerId" },
        { status: 400 }
      );
    }

    const worker = await prisma.user.findUnique({
      where: { id: workerId },
    });

    if (action === "ACCEPT") {
      const updated = await prisma.complaint.update({
        where: { id: complaintId },
        data: {
          workerId: workerId,
          status: ComplaintStatus.IN_PROGRESS,
        },
      });

      await prisma.auditLog.create({
        data: {
          complaintId,
          userId: workerId,
          actionTaken: `TICKET_ACCEPTED_BY_WORKER: Technician ${worker?.name || "Staff"} (${worker?.categoryExpertise || "Maintenance"}) accepted problem ticket and is appointed to onsite task.`,
        },
      });

      revalidatePath("/worker");
      revalidatePath(`/student/requests/${complaintId}`);
      revalidatePath("/student");
      revalidatePath("/warden");
      revalidatePath("/coordinator");

      return NextResponse.json({ success: true, complaint: updated });
    }

    if (action === "RESOLVE") {
      const notes =
        resolutionNotes?.trim() || "Defect inspected and repair completed onsite.";

      const updated = await prisma.complaint.update({
        where: { id: complaintId },
        data: {
          status: ComplaintStatus.RESOLVED,
          resolvedAt: new Date(),
          resolutionNotes: notes,
        },
      });

      await prisma.auditLog.create({
        data: {
          complaintId,
          userId: workerId,
          actionTaken: `WORKER_RESOLVED: Technician ${worker?.name || "Staff"} completed repair. Statement: "${notes}"`,
        },
      });

      revalidatePath("/worker");
      revalidatePath(`/student/requests/${complaintId}`);
      revalidatePath("/student");
      revalidatePath("/warden");
      revalidatePath("/coordinator");

      return NextResponse.json({ success: true, complaint: updated });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Worker ticket action error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process worker action";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
