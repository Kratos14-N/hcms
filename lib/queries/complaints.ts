import "server-only";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus, Priority, Role } from "@prisma/client";
import { requireRole } from "@/lib/dal";

// =========================================================================
// 1. STUDENT TENANT ISOLATION
// =========================================================================

/**
 * Fetches all complaints strictly owned by the calling student.
 * Never allows client-supplied studentId to override session identity.
 */
export async function getStudentComplaints(statusFilter?: string) {
  const session = await requireRole([Role.STUDENT]);

  return prisma.complaint.findMany({
    where: {
      studentId: session.userId, // Hard isolation: Filtered directly by verified session ID
      ...(statusFilter === "ACTIVE"
        ? { status: { notIn: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED] } }
        : statusFilter === "RESOLVED"
        ? { status: { in: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED] } }
        : {}),
    },
    include: {
      subCategory: { include: { category: true } },
      worker: { select: { name: true, phone: true } },
      feedback: true,
      attachments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Fetches a single complaint for a student.
 * Uses a compound unique constraint (id + studentId) to prevent IDOR vulnerabilities.
 */
export async function getStudentComplaintById(complaintId: string) {
  const session = await requireRole([Role.STUDENT]);

  const ticket = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      studentId: session.userId, // Guarantees student cannot view another resident's ticket
    },
    include: {
      subCategory: { include: { category: true } },
      worker: { select: { name: true, phone: true } },
      feedback: true,
      attachments: true,
      auditLogs: { orderBy: { timestamp: "desc" } },
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found or unauthorized");
  }

  return ticket;
}

// =========================================================================
// 2. WARDEN BLOCK-LEVEL TENANT ISOLATION
// =========================================================================

/**
 * Fetches triage queue strictly limited to the Warden's assigned jurisdiction.
 * If Warden is assigned "Block A", they CANNOT see complaints from "Block B" or "Block C".
 */
export async function getWardenTriageQueue(filter?: string) {
  const session = await requireRole([Role.WARDEN, Role.COORDINATOR]);

  // Coordinators have campus-wide authority; Wardens have single-block authority
  const isCoordinator = session.role === Role.COORDINATOR;
  const wardenBlock = session.user.blockAssigned;

  if (!isCoordinator && !wardenBlock) {
    throw new Error("Warden has no residential block assigned. Access restricted.");
  }

  // Construct strict block-boundary filter
  const blockJurisdictionFilter = isCoordinator
    ? {} // Coordinator monitors all campus blocks
    : {
        OR: [
          // Case 1: Location field contains the block identifier
          { location: { contains: wardenBlock! } },
          // Case 2: The student who lodged the ticket resides in the Warden's block
          { student: { blockAssigned: wardenBlock! } },
        ],
      };

  return prisma.complaint.findMany({
    where: {
      ...blockJurisdictionFilter,
      ...(filter === "EMERGENCY"
        ? {
            priority: Priority.EMERGENCY,
            status: { notIn: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED] },
          }
        : filter === "IN_PROGRESS"
        ? { status: ComplaintStatus.IN_PROGRESS }
        : filter === "RESOLVED"
        ? { status: { in: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED] } }
        : { status: { notIn: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED] } }),
    },
    include: {
      subCategory: { include: { category: true } },
      student: { select: { id: true, name: true, roomNumber: true, blockAssigned: true } },
      worker: { select: { id: true, name: true, phone: true } },
    },
    orderBy: [{ emergencyFlag: "desc" }, { tatDeadline: "asc" }],
  });
}

/**
 * Verifies that a Warden has block-level jurisdiction over a complaint before
 * assigning a worker or updating ticket status.
 */
export async function authorizeWardenAction(complaintId: string) {
  const session = await requireRole([Role.WARDEN, Role.COORDINATOR]);

  if (session.role === Role.COORDINATOR) {
    return session;
  }

  const wardenBlock = session.user.blockAssigned;
  if (!wardenBlock) {
    throw new Error("403 Forbidden: No assigned block jurisdiction");
  }

  // Verify complaint falls under the Warden's block
  const ticket = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      OR: [
        { location: { contains: wardenBlock } },
        { student: { blockAssigned: wardenBlock } },
      ],
    },
    select: { id: true },
  });

  if (!ticket) {
    throw new Error("403 Forbidden: You do not have jurisdiction over this block");
  }

  return session;
}
