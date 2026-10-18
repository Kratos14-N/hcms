import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { note, role } = body;

    if (!note || typeof note !== "string" || !note.trim()) {
      return NextResponse.json(
        { success: false, error: "Note content cannot be empty" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found" },
        { status: 404 }
      );
    }

    const roleTag = role ? role.toUpperCase() : "OPERATIONS";

    const audit = await prisma.auditLog.create({
      data: {
        complaintId: id,
        actionTaken: `INTERNAL_${roleTag}_NOTE: ${note.trim()}`,
      },
    });

    revalidatePath(`/coordinator/tickets/${id}`);
    revalidatePath(`/warden/tickets/${id}`);
    revalidatePath("/coordinator");
    revalidatePath("/warden");

    return NextResponse.json({
      success: true,
      audit,
      message: "Internal note logged successfully",
    });
  } catch (error: unknown) {
    console.error("Internal note error:", error);
    const message = error instanceof Error ? error.message : "Failed to record note";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
