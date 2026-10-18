import { Suspense } from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus, Prisma, Role } from "@prisma/client";
import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { RadarTriageControl } from "@/components/radar-triage-control";

export const instant = false;

async function SurveillanceContent() {
  const targetRoles = [Role.WORKER];

  const [complaints, technicians] = await Promise.all([
    prisma.complaint.findMany({
      where: {
        status: {
          notIn: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED],
        },
      },
      include: {
        subCategory: {
          include: { category: true },
        },
        student: true,
        attachments: true,
      },
      orderBy: [
        { emergencyFlag: "desc" },
        { tatDeadline: "asc" },
      ],
    }),
    prisma.user.findMany({
      where: {
        role: {
          in: targetRoles,
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);


  const now = new Date();
  const emergencyCount = complaints.filter((c) => c.emergencyFlag).length;
  const breachedCount = complaints.filter(
    (c) => new Date(c.tatDeadline) < now
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            Live Incident Radar
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
            Triage & Surveillance.
          </h1>
          <p className="text-sm sm:text-base text-[#86868b] tracking-tight">
            Prioritize active incidents, mitigate SLA breaches, and dispatch field specialists.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white border border-[#e5e5ea] shadow-sm text-center">
            <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              Urgent Hazards
            </div>
            <div className="text-xl font-semibold text-[#1d1d1f]">{emergencyCount}</div>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-white border border-[#e5e5ea] shadow-sm text-center">
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
              SLA Breached
            </div>
            <div className="text-xl font-semibold text-[#1d1d1f]">{breachedCount}</div>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-white border border-[#e5e5ea] shadow-sm text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Queue Load
            </div>
            <div className="text-xl font-semibold text-[#1d1d1f]">{complaints.length}</div>
          </div>
        </div>
      </div>

      {/* Main Surveillance Table */}
      {complaints.length === 0 ? (
        <div className="bg-white rounded-[28px] p-16 text-center border border-[#e5e5ea] space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-semibold text-[#1d1d1f]">Zero Pending Hazards</h3>
          <p className="text-xs text-[#86868b]">All hostel complaint queues are clear and within SLA.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[28px] border border-[#e5e5ea] shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="divide-y divide-[#f2f2f7]">
            {complaints.map((item) => {
              const deadline = new Date(item.tatDeadline);
              const isBreached = now > deadline;
              const hoursDiff = Math.round(
                (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
              );

              return (
                <div
                  key={item.id}
                  className={`p-5 sm:p-6 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    item.emergencyFlag ? "bg-rose-50/30" : "hover:bg-[#fbfbfd]"
                  }`}
                >
                  {/* Left Column: Identifiers & Issue */}
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.complaintRefId}
                      </span>
                      {item.emergencyFlag && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> 2-HR URGENT
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isBreached
                            ? "bg-rose-100 text-rose-700 font-bold"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isBreached
                          ? "SLA BREACHED"
                          : `${hoursDiff}h Remaining`}
                      </span>
                      <span className="text-xs text-[#86868b]">
                        • Room {item.location}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold tracking-tight text-[#1d1d1f]">
                        {item.subCategory?.category?.name} — {item.subCategory?.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#86868b] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#86868b] pt-1">
                      <span className="flex items-center gap-1" suppressHydrationWarning>
                        <Clock className="w-3.5 h-3.5 text-[#0071e3]" />
                        Target: {deadline.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span>
                        Student: <strong className="text-[#1d1d1f]">{item.student?.name || "Resident"}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Inline Dispatch Control Component */}
                  <RadarTriageControl
                    complaintId={item.id}
                    initialWorkerId={item.workerId}
                    initialStatus={item.status}
                    technicians={technicians}
                    ticketDetailHref={`/coordinator/tickets/${item.id}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SurveillanceFallback() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center text-sm text-[#86868b]">
      Syncing live incident queues...
    </div>
  );
}

export default function SurveillancePage() {
  return (
    <Suspense fallback={<SurveillanceFallback />}>
      <SurveillanceContent />
    </Suspense>
  );
}