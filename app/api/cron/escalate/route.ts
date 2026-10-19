import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus, Priority } from "@prisma/client";

export const instant = false;


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceTest = searchParams.get("forceTest") === "true";

  const now = new Date();

  // Find tickets that are active and have breached (or simulated breach via forceTest)
  const breachedTickets = await prisma.complaint.findMany({
    where: {
      status: {
        in: [
          ComplaintStatus.LOGGED,
          ComplaintStatus.ASSIGNED,
          ComplaintStatus.IN_PROGRESS,
        ],
      },
      ...(forceTest ? {} : { tatDeadline: { lte: now } }),
    },
    take: 10,
  });

  const escalatedIds: string[] = [];

  for (const ticket of breachedTickets) {
    await prisma.$transaction(async (tx) => {
      // Escalate ticket priority to EMERGENCY
      await tx.complaint.update({
        where: { id: ticket.id },
        data: {
          priority: Priority.EMERGENCY,
          emergencyFlag: true,
        },
      });

      // Append immutable audit log
      await tx.auditLog.create({
        data: {
          complaintId: ticket.id,
          actionTaken: `AUTOMATED_SLA_BREACH: Priority escalated to EMERGENCY. Warden dispatch notified at ${now.toISOString()}`,
        },
      });
    });

    escalatedIds.push(ticket.complaintRefId);
  }

  return NextResponse.json({
    status: "success",
    timestamp: now.toISOString(),
    mode: forceTest ? "MANUAL_SIMULATION" : "SCHEDULED_CRON",
    totalScanned: breachedTickets.length,
    escalatedTickets: escalatedIds,
    message:
      escalatedIds.length > 0
        ? `Successfully escalated ${escalatedIds.length} tickets to EMERGENCY.`
        : "All active tickets are within valid SLA limits.",
  });
}