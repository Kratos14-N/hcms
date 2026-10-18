import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { complaintId, assignedWorkerId, status, resolutionNotes } = body;

    if (!complaintId) {
      return NextResponse.json(
        { success: false, error: "Complaint ID is required" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        worker: true,
        subCategory: { include: { category: true } },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found" },
        { status: 404 }
      );
    }

    const updateData: Prisma.ComplaintUpdateInput = {
      updatedAt: new Date(),
    };

    let targetStatus = complaint.status;
    if (status && Object.values(ComplaintStatus).includes(status as ComplaintStatus)) {
      targetStatus = status as ComplaintStatus;
      updateData.status = targetStatus;

      if (targetStatus === ComplaintStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
      } else if (targetStatus === ComplaintStatus.CLOSED) {
        updateData.closedAt = new Date();
      } else if (targetStatus === ComplaintStatus.IN_PROGRESS || targetStatus === ComplaintStatus.ASSIGNED) {
        updateData.resolvedAt = null;
        updateData.closedAt = null;
      }
    }

    let workerName = complaint.worker?.name || "Unassigned";

    if (assignedWorkerId && assignedWorkerId.trim() !== "") {
      const worker = await prisma.user.findUnique({
        where: { id: assignedWorkerId },
      });
      if (worker) {
        updateData.worker = { connect: { id: assignedWorkerId } };
        workerName = worker.name;
        // If status was still LOGGED, automatically advance to ASSIGNED
        if (!status && complaint.status === ComplaintStatus.LOGGED) {
          updateData.status = ComplaintStatus.ASSIGNED;
        }
      }
    } else {
      // If no new worker was explicitly passed:
      if (complaint.workerId) {
        // RETAIN existing worker - NEVER disconnect an assigned worker!
        workerName = complaint.worker?.name || workerName;
      } else if (
        targetStatus === ComplaintStatus.ASSIGNED ||
        targetStatus === ComplaintStatus.IN_PROGRESS ||
        targetStatus === ComplaintStatus.RESOLVED
      ) {
        // Auto-assign appropriate specialist matching the category so tickets are NEVER unassigned!
        const allWorkers = await prisma.user.findMany({ where: { role: "WORKER" } });
        if (allWorkers.length > 0) {
          const catText = `${complaint.subCategory?.category?.name || ""} ${complaint.subCategory?.name || ""}`.toUpperCase();
          let matched = allWorkers[0];
          if (catText.includes("ELEC")) {
            matched = allWorkers.find((w) => w.categoryExpertise === "ELECTRICAL") || matched;
          } else if (catText.includes("PLUMB") || catText.includes("WATER")) {
            matched = allWorkers.find((w) => w.categoryExpertise === "PLUMBING") || matched;
          } else if (
            catText.includes("CARPENT") ||
            catText.includes("FURNIT") ||
            catText.includes("DOOR") ||
            catText.includes("LOCK")
          ) {
            matched = allWorkers.find((w) => w.categoryExpertise === "CARPENTRY") || matched;
          } else if (catText.includes("NET") || catText.includes("WIFI") || catText.includes("INTERNET")) {
            matched = allWorkers.find((w) => w.categoryExpertise === "NETWORKING") || matched;
          }
          updateData.worker = { connect: { id: matched.id } };
          workerName = matched.name;
        }
      }
    }

    if (resolutionNotes && typeof resolutionNotes === "string" && resolutionNotes.trim() !== "") {
      updateData.resolutionNotes = resolutionNotes.trim();
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: updateData,
      include: {
        worker: true,
        subCategory: { include: { category: true } },
      },
    });

    // Record audit trail
    await prisma.auditLog.create({
      data: {
        complaintId,
        actionTaken: `TRIAGE_UPDATE: Status=${updated.status}, AssignedWorker=${
          updated.worker?.name || "Unassigned"
        } by Operations Desk.`,
      },
    });

    // Revalidate all affected routes
    revalidatePath("/coordinator/surveillance");
    revalidatePath("/coordinator");
    revalidatePath(`/coordinator/tickets/${complaintId}`);
    revalidatePath("/warden/surveillance");
    revalidatePath("/warden");
    revalidatePath(`/warden/tickets/${complaintId}`);
    revalidatePath("/student");
    revalidatePath(`/student/requests/${complaintId}`);
    revalidatePath("/worker");

    return NextResponse.json({
      success: true,
      complaint: updated,
      message: `Updated status to ${updated.status} (Worker: ${workerName})`,
    });
  } catch (error: unknown) {
    console.error("Triage update error:", error);
    const message = error instanceof Error ? error.message : "Failed to update complaint";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
