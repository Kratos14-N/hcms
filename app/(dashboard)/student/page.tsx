import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus, Role } from "@prisma/client";
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Zap,
  Droplets,
  Wifi,
  Wrench,
  Sparkles,
  Inbox,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { StudentHandoverVerifyBanner } from "@/components/student-handover-verify-banner";
import { ComplaintLiveTime } from "@/components/complaint-live-time";
import PortalLoading from "../portal/loading";

export const instant = false;

interface PortalProps {
  searchParams?: Promise<{
    status?: string;
  }>;
}

function getCategoryIcon(name?: string) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("electric") || lower.includes("fan") || lower.includes("light")) {
    return Zap;
  }
  if (lower.includes("plumb") || lower.includes("water") || lower.includes("leak") || lower.includes("geyser")) {
    return Droplets;
  }
  if (lower.includes("wi-fi") || lower.includes("wifi") || lower.includes("net")) {
    return Wifi;
  }
  return Wrench;
}

async function PortalComplaintsContent({ searchParams }: PortalProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const statusFilter = resolvedSearchParams?.status;

  const cookieStore = await cookies();
  const sessionUserId =
    cookieStore.get("hcms_user_id")?.value ||
    cookieStore.get("userId")?.value;

  // Retrieve current student user safely
  let studentUser: {
    id: string;
    name: string;
    email: string;
    role: Role;
    roomNumber: string | null;
    blockAssigned: string | null;
  } | null = null;

  type ComplaintWithRelations = Awaited<ReturnType<typeof prisma.complaint.findMany>>[number] & {
    subCategory?: { name: string; category?: { name: string } } | null;
    worker?: { name: string; phone?: string | null } | null;
    feedback?: unknown;
    attachments?: unknown[];
  };

  let allUserComplaints: ComplaintWithRelations[] = [];

  try {
    if (sessionUserId) {
      const [userRecord, complaintsRecord] = await Promise.all([
        prisma.user.findUnique({
          where: { id: sessionUserId },
        }),
        prisma.complaint.findMany({
          where: { studentId: sessionUserId },
          include: {
            subCategory: {
              include: { category: true },
            },
            worker: true,
            feedback: true,
            attachments: true,
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);
      studentUser = userRecord;
      allUserComplaints = (complaintsRecord || []) as unknown as ComplaintWithRelations[];
    }

    if (!studentUser) {
      studentUser = await prisma.user.findFirst({
        where: { role: Role.STUDENT },
      });
      if (studentUser) {
        allUserComplaints = (await prisma.complaint.findMany({
          where: { studentId: studentUser.id },
          include: {
            subCategory: {
              include: { category: true },
            },
            worker: true,
            feedback: true,
            attachments: true,
          },
          orderBy: { createdAt: "desc" },
        })) as unknown as ComplaintWithRelations[];
      }
    }
  } catch (dbErr) {
    console.warn("Portal database query warning:", dbErr);
  }

  if (!studentUser) {
    const STUDENT_DIRECTORY: Record<
      string,
      { name: string; email: string; roomNumber: string; blockAssigned: string }
    > = {
      "cmv48dmol00007k7czr57hpc2": {
        name: "Aarav Sharma",
        email: "aarav.student@hostel.edu",
        roomNumber: "A-204",
        blockAssigned: "Block A",
      },
      "cmv48dn1z00017k7ct1ktqlrs": {
        name: "Rohan Patel",
        email: "rohan.student@hostel.edu",
        roomNumber: "B-312",
        blockAssigned: "Block B",
      },
      "cmv48dngl00027k7ci4608hgf": {
        name: "Priya Iyer",
        email: "priya.student@hostel.edu",
        roomNumber: "C-105",
        blockAssigned: "Block C",
      },
      "cmv48dnuj00037k7c80qgkxor": {
        name: "Ananya Das",
        email: "ananya.student@hostel.edu",
        roomNumber: "A-108",
        blockAssigned: "Block A",
      },
    };

    const match =
      (sessionUserId && STUDENT_DIRECTORY[sessionUserId]) ||
      STUDENT_DIRECTORY["cmv48dmol00007k7czr57hpc2"];

    studentUser = {
      id: sessionUserId || "cmv48dmol00007k7czr57hpc2",
      name: match.name,
      email: match.email,
      role: Role.STUDENT,
      roomNumber: match.roomNumber,
      blockAssigned: match.blockAssigned,
    };
  }

  // Compute status aggregates
  const totalCount = allUserComplaints.length;
  const activeCount = allUserComplaints.filter(
    (c) =>
      c.status !== ComplaintStatus.RESOLVED &&
      c.status !== ComplaintStatus.CLOSED
  ).length;
  const resolvedCount = totalCount - activeCount;

  // Unverified complaints awaiting student handover verification
  const unverifiedComplaints = allUserComplaints.filter(
    (c) => c.status === ComplaintStatus.RESOLVED && !c.feedback
  );

  // Filter complaints based on URL query
  const complaints = allUserComplaints.filter((item) => {
    if (statusFilter === "ACTIVE") {
      return (
        item.status !== ComplaintStatus.RESOLVED &&
        item.status !== ComplaintStatus.CLOSED
      );
    }
    if (statusFilter === "RESOLVED") {
      return (
        item.status === ComplaintStatus.RESOLVED ||
        item.status === ComplaintStatus.CLOSED
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Welcome & Quick Actions Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 -bottom-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white/95">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>
              {studentUser
                ? `${studentUser.name} • ${
                    studentUser.roomNumber
                      ? `Room ${studentUser.roomNumber}`
                      : studentUser.blockAssigned || "Resident"
                  }${
                    studentUser.blockAssigned && studentUser.roomNumber
                      ? ` (${studentUser.blockAssigned})`
                      : ""
                  }`
                : "Resident Student Portal"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Hostel Maintenance Desk.
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Report room defects, track live technician SLA turnarounds, and confirm verified handovers with direct feedback.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link
            href="/student/requests/new"
            prefetch={false}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-blue-50 text-xs sm:text-sm font-bold shadow-lg shadow-black/10 hover:shadow-xl transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 text-indigo-700 stroke-[3]" />
            <span>Lodge Maintenance Request</span>
          </Link>
        </div>
      </div>

      {/* Unverified Handover Verification Gate (User Request) */}
      {unverifiedComplaints.length > 0 && (
        <StudentHandoverVerifyBanner complaints={unverifiedComplaints as any} />
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111726]/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Logged
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalCount}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Lifetime room tickets</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111726]/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              In Progress
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {activeCount}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Turnaround in countdown</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111726]/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolved & Verified
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {resolvedCount}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Handover accepted</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-semibold">
          <Link
            href="/student"
            prefetch={false}
            className={`px-3.5 py-1.5 rounded-full transition ${
              !statusFilter
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            All Requests ({totalCount})
          </Link>
          <Link
            href="/student?status=ACTIVE"
            prefetch={false}
            className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
              statusFilter === "ACTIVE"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>In Progress ({activeCount})</span>
          </Link>
          <Link
            href="/student?status=RESOLVED"
            prefetch={false}
            className={`px-3.5 py-1.5 rounded-full transition ${
              statusFilter === "RESOLVED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            Resolved ({resolvedCount})
          </Link>
        </div>

        {/* Complaints List Cards */}
        {complaints.length === 0 ? (
          <div className="bg-white dark:bg-[#111726]/90 rounded-3xl p-16 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Tickets Under This Filter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your room has no maintenance items matching this category. Click &ldquo;Lodge Maintenance Request&rdquo; to register an issue anytime.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((item) => {
              const isResolved =
                item.status === ComplaintStatus.RESOLVED ||
                item.status === ComplaintStatus.CLOSED;

              const isEmergency = item.emergencyFlag;
              const CategoryIcon = getCategoryIcon(item.subCategory?.category?.name);
              const needsStudentVerification = item.status === ComplaintStatus.RESOLVED && !item.feedback;

              return (
                <Link
                  key={item.id}
                  href={`/student/requests/${item.id}`}
                  prefetch={false}
                  className="bg-white dark:bg-[#111726]/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition duration-200 group block"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <CategoryIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.complaintRefId}
                        </span>

                        {isEmergency && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Urgent Hazard
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            isResolved
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {item.status.replace("_", " ")}
                        </span>

                        {needsStudentVerification && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 animate-pulse">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Verification Required
                          </span>
                        )}

                        {item.worker && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            Technician: {item.worker.name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {item.subCategory?.category?.name} — {item.subCategory?.name}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="dark:text-slate-400">Room {item.location}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 dark:text-slate-400" suppressHydrationWarning>
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <ComplaintLiveTime
                          createdAt={item.createdAt}
                          tatDeadline={item.tatDeadline}
                          isResolved={isResolved}
                          compact
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      View Details
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalPage(props: PortalProps) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <PortalComplaintsContent {...props} />
    </Suspense>
  );
}