import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus, Priority } from "@prisma/client";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Flame,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  Camera,
} from "lucide-react";
import { WorkerResolveForm } from "@/components/worker-resolve-form";
import { ComplaintLiveTime } from "@/components/complaint-live-time";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function WorkerTicketDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.complaint.findUnique({
    where: { id },
    include: {
      subCategory: { include: { category: true } },
      worker: true,
      student: true,
      attachments: true,
      feedback: true,
      auditLogs: {
        orderBy: { timestamp: "asc" },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  const isEmergency = ticket.priority === Priority.EMERGENCY || ticket.emergencyFlag;
  const isResolved =
    ticket.status === ComplaintStatus.RESOLVED ||
    ticket.status === ComplaintStatus.CLOSED;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          href="/worker"
          className="text-xs text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Work Orders
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400">
                {ticket.complaintRefId}
              </span>

              {isEmergency && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 ring-1 ring-rose-600/20">
                  <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  2-Hour Emergency Hazard
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ring-1 ${
                  isResolved
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-emerald-300"
                    : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 ring-amber-300"
                }`}
              >
                {isResolved ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
                {ticket.status.replace("_", " ")}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {ticket.subCategory?.category?.name} — {ticket.subCategory?.name}
            </h1>
          </div>

          {/* Real-time complaint active duration */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <ComplaintLiveTime
              createdAt={ticket.createdAt}
              tatDeadline={ticket.tatDeadline}
              isResolved={isResolved}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Attachments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Defect Description */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Student Reported Defect
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              {ticket.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                <MapPin className="w-4 h-4 text-indigo-500" /> Location: {ticket.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1" suppressHydrationWarning>
                <Calendar className="w-3.5 h-3.5" />
                Lodged: {new Date(ticket.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* Resident Contact Information */}
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl p-5 border border-blue-200/60 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Resident: {ticket.student?.name || "Student"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Room {ticket.location} • {ticket.student?.blockAssigned || "Hostel Resident"}
                </p>
              </div>
            </div>

            {ticket.student?.phone && (
              <a
                href={`tel:${ticket.student.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Resident ({ticket.student.phone})</span>
              </a>
            )}
          </div>

          {/* Photo / Video Evidence */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-500" /> Attached Photo Evidence
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {ticket.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative block hover:opacity-95 transition"
                  >
                    <Image
                      src={att.fileUrl}
                      alt="Defect Evidence"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Audit Logs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" /> Work Order Timeline
            </h2>
            <div className="space-y-2 pt-1 text-xs">
              {ticket.auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                >
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{log.actionTaken}</span>
                  <span className="text-[11px] text-slate-400 shrink-0" suppressHydrationWarning>
                    {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Work Order Action Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-500/40 shadow-md p-5 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Technician Action Panel
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                Onsite Repair Resolution
              </h3>
              <p className="text-xs text-slate-500">
                Complete repairs and submit your diagnosis statement to notify the resident for handover.
              </p>
            </div>

            {ticket.workerId && (
              <WorkerResolveForm
                complaintId={ticket.id}
                workerId={ticket.workerId}
              />
            )}

            {isResolved && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Work Order Completed
                </span>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  {ticket.resolutionNotes || "Repair completed onsite."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkerTicketDetailPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Loading ticket details...
        </div>
      }
    >
      <WorkerTicketDetailContent params={props.params} />
    </Suspense>
  );
}
