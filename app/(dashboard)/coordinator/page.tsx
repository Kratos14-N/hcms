import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus, Priority, Prisma } from "@prisma/client";
import {
  Flame,
  ChevronRight,
  Inbox,
  User,
  MapPin,
  Clock,
  Radio,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export const instant = false;

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

async function AgentQueueContent({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  const cookieStore = await cookies();
  const sessionUserId =
    cookieStore.get("hcms_user_id")?.value ||
    cookieStore.get("userId")?.value;

  let currentWarden = null;
  try {
    if (sessionUserId) {
      currentWarden = await prisma.user.findUnique({
        where: { id: sessionUserId },
      });
    }
  } catch (err) {
    console.warn("Warden query warning:", err);
  }

  type AgentTicket = Prisma.ComplaintGetPayload<{
    include: {
      subCategory: { include: { category: true } };
      worker: true;
      student: true;
    };
  }>;

  let statusGroups: Array<{ priority: Priority; status: ComplaintStatus; _count: { _all: number } }> = [];
  let tickets: AgentTicket[] = [];

  const whereClause: Prisma.ComplaintWhereInput = {};
  if (filter === "EMERGENCY") {
    whereClause.priority = Priority.EMERGENCY;
    whereClause.status = {
      notIn: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED],
    };
  } else if (filter === "IN_PROGRESS") {
    whereClause.status = ComplaintStatus.IN_PROGRESS;
  } else if (filter === "RESOLVED") {
    whereClause.status = {
      in: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED],
    };
  } else {
    whereClause.status = {
      notIn: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED],
    };
  }

  try {
    statusGroups = (await prisma.complaint.groupBy({
      by: ["status", "priority"],
      _count: { _all: true },
    })) as unknown as typeof statusGroups;

    tickets = (await prisma.complaint.findMany({
      where: whereClause,
      include: {
        subCategory: { include: { category: true } },
        worker: true,
        student: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    })) as unknown as typeof tickets;
  } catch (err) {
    console.warn("Agent queue database query warning:", err);
  }

  let allOpenCount = 0;
  let emergenciesCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;

  for (const group of statusGroups) {
    const count = group._count._all;
    if (
      group.priority === Priority.EMERGENCY &&
      group.status !== ComplaintStatus.RESOLVED &&
      group.status !== ComplaintStatus.CLOSED
    ) {
      emergenciesCount += count;
    }
    if (group.status === ComplaintStatus.IN_PROGRESS) {
      inProgressCount += count;
    }
    if (
      group.status === ComplaintStatus.RESOLVED ||
      group.status === ComplaintStatus.CLOSED
    ) {
      resolvedCount += count;
    }
    if (
      group.status !== ComplaintStatus.RESOLVED &&
      group.status !== ComplaintStatus.CLOSED
    ) {
      allOpenCount += count;
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Warden Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            {currentWarden
              ? `${currentWarden.name} • ${currentWarden.blockAssigned ? `${currentWarden.blockAssigned} In-Charge` : "Campus Operations"}`
              : "Hostel Operations Command Center"}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Coordinator Operations Queue.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Campus-wide command center: monitor resident complaints across all hostel wings, allocate staff, and track SLA performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/coordinator/surveillance"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>Hostel Radar</span>
          </Link>
          <Link
            href="/coordinator/analytics"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>SLA Analytics</span>
          </Link>
        </div>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#111726]/90 border border-slate-200/90 dark:border-slate-800 shadow-xs text-xs font-semibold gap-1">
          <Link
            href="/coordinator"
            className={`px-4 py-2 rounded-xl transition ${
              !filter
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            All Open ({allOpenCount})
          </Link>
          <Link
            href="/coordinator?filter=EMERGENCY"
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              filter === "EMERGENCY"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Emergencies ({emergenciesCount})
          </Link>
          <Link
            href="/coordinator?filter=IN_PROGRESS"
            className={`px-4 py-2 rounded-xl transition ${
              filter === "IN_PROGRESS"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            }`}
          >
            In Progress ({inProgressCount})
          </Link>
          <Link
            href="/coordinator?filter=RESOLVED"
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              filter === "RESOLVED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved ({resolvedCount})
          </Link>
        </div>
      </div>

      {/* Ticket Cards */}
      {tickets.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#111726]/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-sm text-slate-500 dark:text-slate-400 space-y-2">
          <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-white">No Tickets in this Queue</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">All hostel requests under this filter have been handled.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const isEmergency =
              ticket.priority === Priority.EMERGENCY || ticket.emergencyFlag;
            const isResolved =
              ticket.status === ComplaintStatus.RESOLVED ||
              ticket.status === ComplaintStatus.CLOSED;

            const now = new Date();
            const deadline = new Date(ticket.tatDeadline);
            const isBreached = !isResolved && now > deadline;

            return (
              <Link
                key={ticket.id}
                href={`/coordinator/tickets/${ticket.id}`}
                className="bg-white dark:bg-[#111726]/90 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group block"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
                      {ticket.complaintRefId}
                    </span>

                    {isEmergency && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <Flame className="w-3 h-3 text-rose-600 fill-rose-500" />
                        2-Hour Emergency
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        isResolved
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : isBreached
                          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                    {ticket.subCategory?.category?.name} — {ticket.subCategory?.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                    {ticket.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                      <MapPin className="w-3 h-3 text-indigo-500" /> {ticket.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 dark:text-slate-400">
                      <User className="w-3 h-3 text-slate-400" />
                      {ticket.student?.name || "Resident"}
                    </span>
                    <span>•</span>
                    <span
                      suppressHydrationWarning
                      className={`flex items-center gap-1 font-semibold ${isBreached ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-300"}`}
                    >
                      <Clock className="w-3 h-3" />
                      Target: {new Date(ticket.tatDeadline).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Worker Allocation & Action CTA */}
                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <div className="text-right hidden sm:block">
                    {ticket.worker ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {ticket.worker.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                        Unassigned Staff
                      </span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

import CoordinatorLoading from "./loading";

export default async function AgentPage(props: PageProps) {
  return (
    <Suspense fallback={<CoordinatorLoading />}>
      <AgentQueueContent searchParams={props.searchParams} />
    </Suspense>
  );
}