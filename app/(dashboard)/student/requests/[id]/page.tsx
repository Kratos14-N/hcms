import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus, Priority } from "@prisma/client";
import {
  ArrowLeft,
  Clock,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  Sparkles,
  Calendar,
  Wrench,
  Phone,
  Mail,
  Radio,
  Check,
} from "lucide-react";
import FeedbackHandover from "@/app/(dashboard)/student/components/FeedbackHandover";
import { ComplaintLiveTime } from "@/components/complaint-live-time";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

async function TicketDetailContent({ id }: { id: string }) {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      subCategory: {
        include: { category: true },
      },
      attachments: true,
      auditLogs: {
        orderBy: { timestamp: "desc" },
      },
      feedback: true,
      student: true,
      worker: true,
    },
  });

  if (!complaint) {
    notFound();
  }


  const isEmergency = complaint.priority === Priority.EMERGENCY || complaint.emergencyFlag;
  const isResolved =
    complaint.status === ComplaintStatus.RESOLVED ||
    complaint.status === ComplaintStatus.CLOSED;
  const isAssigned = Boolean(complaint.workerId || complaint.worker);
  const isInProgress = complaint.status === ComplaintStatus.IN_PROGRESS;

  const now = new Date();
  const deadline = new Date(complaint.tatDeadline);
  const createdDate = new Date(complaint.createdAt);
  const isBreached = !isResolved && now > deadline;

  // SLA Percentage
  const totalDurationMs = Math.max(1, deadline.getTime() - createdDate.getTime());
  const elapsedMs = Math.max(0, now.getTime() - createdDate.getTime());
  const slaPercent = isResolved
    ? 100
    : Math.min(100, Math.round((elapsedMs / totalDurationMs) * 100));

  const hoursRemaining = Math.max(
    0,
    Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
  );

  const initialEvidence = complaint.attachments.filter((a) => !a.isResolutionProof);
  const resolutionProofs = complaint.attachments.filter((a) => a.isResolutionProof);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Back Button */}
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Complaints
      </Link>

      {/* 1. Ticket Header Card */}
      <div className="bg-white dark:bg-[#111726]/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {complaint.complaintRefId}
              </span>

              {isEmergency && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> 2-Hour Hazard Priority
                </span>
              )}

              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${
                  isResolved
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50"
                    : isBreached
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50"
                }`}
              >
                {complaint.status.replace("_", " ")}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {complaint.subCategory?.category?.name} — {complaint.subCategory?.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> {complaint.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1" suppressHydrationWarning>
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Reported {createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span>•</span>
              <ComplaintLiveTime
                createdAt={complaint.createdAt}
                tatDeadline={complaint.tatDeadline}
                isResolved={isResolved}
                compact
              />
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Complaint Status
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {isResolved
                ? "Resolved & Verified"
                : isInProgress
                ? "Technician In-Progress"
                : isAssigned
                ? "Technician Appointed"
                : "Awaiting Worker"}
            </span>
          </div>
        </div>

        {/* 2. Visual Progress Stepper */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>1. Lodged</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ticket submitted
              </p>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3 rounded-2xl border space-y-1 ${
                isAssigned
                  ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40"
                  : "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 animate-pulse"
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  isAssigned ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {isAssigned ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
                <span>2. Appointed</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                {complaint.worker ? `${complaint.worker.name}` : "Awaiting technician"}
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3 rounded-2xl border space-y-1 ${
                isResolved || isInProgress
                  ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/40"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  isResolved || isInProgress ? "text-indigo-700 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {isResolved || isInProgress ? (
                  <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
                <span>3. In-Progress</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isResolved || isInProgress ? "Diagnosis onsite" : "Pending start"}
              </p>
            </div>

            {/* Step 4 */}
            <div
              className={`p-3 rounded-2xl border space-y-1 ${
                isResolved
                  ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  isResolved ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>4. Resolved</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isResolved ? "Handover complete" : "Awaiting repair"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. SLA Turnaround Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>
                Turnaround SLA Target:{" "}
                <strong className="text-slate-900 dark:text-white" suppressHydrationWarning>
                  {deadline.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </strong>
              </span>
            </div>

            <div>
              {isResolved ? (
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Restored Within Turnaround Time
                </span>
              ) : isBreached ? (
                <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> SLA Overdue — Warden Escalated
                </span>
              ) : (
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  {hoursRemaining} Hours Remaining in SLA Target
                </span>
              )}
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isResolved
                  ? "bg-emerald-500"
                  : isBreached
                  ? "bg-rose-500"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
              }`}
              style={{ width: `${slaPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Appointed Technician Contact Card (HIGH DETAIL) */}
      {complaint.worker ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-50/30 dark:via-indigo-950/20 to-blue-50/20 dark:to-blue-950/20 rounded-3xl p-6 sm:p-7 border border-amber-200/80 dark:border-amber-900/50 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                {complaint.worker.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800/60">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Appointed Technician Dispatched
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  {complaint.worker.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {complaint.worker.categoryExpertise || "Facility Support"} Maintenance Specialist
                </p>
              </div>
            </div>

            {/* Direct Contact Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              {complaint.worker.phone && (
                <a
                  href={`tel:${complaint.worker.phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {complaint.worker.phone}</span>
                </a>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 flex-wrap gap-2">
            <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Technician has accepted ticket and is assigned to your room
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-mono">
              Campus ID: {complaint.worker.id.slice(-8).toUpperCase()}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-3xl p-6 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Awaiting Technician Acceptance
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ticket is broadcasted to hostel maintenance personnel. You will get instant technician appointment details as soon as claimed.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 shrink-0">
            Broadcasting
          </span>
        </div>
      )}

      {/* 5. Defect Description Card */}
      <div className="bg-white dark:bg-[#111726]/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Resident Fault Description
        </h2>
        <div className="bg-slate-50/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {complaint.description}
          </p>
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>Location: <strong className="text-slate-700 dark:text-slate-300">{complaint.location}</strong></span>
            <span>Reported by: <strong className="text-slate-700 dark:text-slate-300">{complaint.student?.name}</strong></span>
          </div>
        </div>
      </div>

      {/* 6. Technician Resolution Notes (If Completed) */}
      {complaint.resolutionNotes && (
        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-3xl p-6 sm:p-7 border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Technician Official Resolution Statement</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111726]/90 border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              &ldquo;{complaint.resolutionNotes}&rdquo;
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2" suppressHydrationWarning>
              Resolved by {complaint.worker?.name || "Technician"} • {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleString() : "Recently"}
            </p>
          </div>
        </div>
      )}

      {/* 7. Photographic Evidences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lodged Photo */}
        <div className="bg-white dark:bg-[#111726]/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Initial Resident Photo
            </h2>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Lodged Evidence</span>
          </div>
          {initialEvidence.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 italic">
              No initial photo attached to this ticket.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {initialEvidence.map((att) => (
                <a
                  key={att.id}
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 block hover:opacity-95 transition"
                >
                  <Image
                    src={att.fileUrl}
                    alt="Initial Evidence"
                    width={400}
                    height={250}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Resolution Proof */}
        <div className="bg-white dark:bg-[#111726]/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Technician Handover Proof
            </h2>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Work Verified</span>
          </div>
          {resolutionProofs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 italic">
              {isResolved
                ? "Work was verified onsite by technician."
                : "Technician will upload handover verification upon repair."}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {resolutionProofs.map((att) => (
                <a
                  key={att.id}
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 block hover:opacity-95 transition"
                >
                  <Image
                    src={att.fileUrl}
                    alt="Resolution Proof"
                    width={400}
                    height={250}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 8. Resident Feedback & Rating Form */}
      {isResolved && (
        <FeedbackHandover
          complaintId={complaint.id}
          technicianName={complaint.worker?.name || "Campus Maintenance Staff"}
        />
      )}

      {/* 9. Incident Audit Log Timeline */}
      <div className="bg-white dark:bg-[#111726]/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Incident Audit Timeline & Communication
        </h2>
        <div className="space-y-2.5 pt-1">
          {complaint.auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-slate-800 dark:text-slate-200 font-medium tracking-tight">
                  {log.actionTaken}
                </span>
              </div>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] shrink-0 font-mono" suppressHydrationWarning>
                {new Date(log.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { TicketDetailSkeleton } from "@/components/ui/skeleton";

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<TicketDetailSkeleton />}>
      <TicketDetailContent id={id} />
    </Suspense>
  );
}