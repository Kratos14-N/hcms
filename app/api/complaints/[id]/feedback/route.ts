import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { rating, feedbackText, isFixed } = body;

    const newStatus: ComplaintStatus = isFixed
      ? ComplaintStatus.CLOSED
      : ComplaintStatus.IN_PROGRESS;

    const updated = await prisma.$transaction([
      prisma.complaint.update({
        where: { id },
        data: {
          status: newStatus,
          ...(isFixed ? { closedAt: new Date() } : {}),
        },
      }),
      prisma.feedback.upsert({
        where: { complaintId: id },
        create: {
          complaintId: id,
          starRating: Number(rating) || 5,
          comments: feedbackText || null,
          issuePersists: !isFixed,
        },
        update: {
          starRating: Number(rating) || 5,
          comments: feedbackText || null,
          issuePersists: !isFixed,
        },
      }),
      prisma.auditLog.create({
        data: {
          complaintId: id,
          actionTaken: `STUDENT_HANDOVER_REVIEW: Rating ${rating}/5, Verified: ${
            isFixed ? "YES" : "NO"
          }`,
        },
      }),
    ]);

    revalidatePath(`/student/requests/${id}`);
    revalidatePath("/student");
    revalidatePath("/warden");
    revalidatePath(`/warden/tickets/${id}`);
    revalidatePath("/coordinator");
    revalidatePath(`/coordinator/tickets/${id}`);
    revalidatePath("/worker");

    return NextResponse.json({
      success: true,
      complaint: updated[0],
    });
  } catch (error: unknown) {
    console.error("Feedback submission error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit feedback";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}