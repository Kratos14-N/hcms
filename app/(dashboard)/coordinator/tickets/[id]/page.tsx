import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ComplaintStatus, Priority, Role } from "@prisma/client";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Flame,
  User,
  Calendar,
  CheckCircle2,
  Wrench,
  Lock,
  Star,
} from "lucide-react";
import { TicketStatusUpdater } from "@/components/ticket-status-updater";
import { TicketNoteForm } from "@/components/ticket-note-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function AgentTicketDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [ticket, technicians] = await Promise.all([
    prisma.complaint.findUnique({
      where: { id },
      include: {
        subCategory: { include: { category: true } },
        worker: true,
        feedback: true,
        auditLogs: {
          orderBy: { timestamp: "asc" },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: Role.WORKER },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!ticket) {
    notFound();
  }


  const isEmergency = ticket.priority === Priority.EMERGENCY || ticket.emergencyFlag;
  const isResolved = ticket.status === ComplaintStatus.RESOLVED;
  const isClosed = ticket.status === ComplaintStatus.CLOSED;
  const isInProgress = ticket.status === ComplaintStatus.IN_PROGRESS;

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          href="/coordinator"
          className="text-xs text-teal-700 hover:underline inline-flex items-center gap-1 font-semibold mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Master Queue
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-teal-400">
                {ticket.complaintRefId}
              </span>

              {isEmergency && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
                  <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  Priority Hazard
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ring-1 ring-inset ${
                  isClosed
                    ? "bg-slate-100 text-slate-700 ring-slate-300"
                    : isResolved
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                    : isInProgress
                    ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                    : "bg-amber-50 text-amber-700 ring-amber-600/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isClosed
                      ? "bg-slate-500"
                      : isResolved
                      ? "bg-emerald-500"
                      : isInProgress
                      ? "bg-blue-500 animate-pulse"
                      : "bg-amber-500"
                  }`}
                />
                {ticket.status.replace("_", " ")}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 pt-1">
              {ticket.subCategory.name} — Room {ticket.location}
            </h1>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div className="flex items-center gap-1.5 justify-end">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span suppressHydrationWarning>
                Reported {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 justify-end text-rose-600 font-semibold mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span suppressHydrationWarning>SLA Target: {new Date(ticket.tatDeadline).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </div>
      </div>

      {ticket.feedback && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Student Feedback Received
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <Star className="w-4 h-4 fill-amber-400" />
              {ticket.feedback.starRating} / 5 Stars
            </div>
          </div>
          {ticket.feedback.comments && (
            <p className="text-xs text-emerald-800 italic">
              &ldquo;{ticket.feedback.comments}&rdquo;
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Student Incident Report
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              {ticket.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block text-[11px]">System Category</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {ticket.subCategory.category.name} • {ticket.subCategory.name}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block text-[11px]">Location Node</span>
                <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  {ticket.location}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dispatch Logs & Handover History
            </h3>

            <div className="divide-y divide-slate-100">
              {ticket.auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No activity logs recorded yet.</p>
              ) : (
                ticket.auditLogs.map((log) => (
                  <div key={log.id} className="py-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {log.actionTaken.split(":")[0]}
                      </span>
                      <span className="text-[10px] text-slate-400" suppressHydrationWarning>
                        {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-mono">
                      {log.actionTaken}
                    </p>
                  </div>
                ))
              )}
            </div>

            <TicketNoteForm complaintId={id} role="COORDINATOR" />
          </div>
        </div>

        <div className="space-y-4">
          <TicketStatusUpdater
            complaintId={id}
            initialStatus={ticket.status}
            initialWorkerId={ticket.workerId}
            initialResolutionNotes={ticket.resolutionNotes}
            technicians={technicians}
          />

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assigned Field Staff
            </h3>

            {ticket.worker ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {ticket.worker.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {ticket.worker.categoryExpertise || "Maintenance"} Specialist
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Unassigned
                  </h4>
                  <p className="text-[11px] text-amber-600 font-medium">
                    Select a technician in the action panel above.
                  </p>
                </div>
              </div>
            )}

            {ticket.worker && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <span className="font-semibold text-slate-800">{ticket.worker.phone || "+91 98111 22233"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duty Status:</span>
                  <span className="font-bold text-emerald-600">On Active Call</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketLoadingFallback() {
  return (
    <div className="p-8 text-center text-xs text-slate-400">
      Loading ticket details...
    </div>
  );
}

export default function AgentTicketDetailPage(props: PageProps) {
  return (
    <Suspense fallback={<TicketLoadingFallback />}>
      <AgentTicketDetailContent params={props.params} />
    </Suspense>
  );
}