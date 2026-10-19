import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus, Priority, Prisma, Role } from "@prisma/client";
import {
  Star,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  Inbox,
  User,
  Sparkles,
  Flame,
  Radio,
  FileCheck2,
} from "lucide-react";
import { WorkerAcceptButton } from "@/components/worker-accept-button";
import { WorkerResolveForm } from "@/components/worker-resolve-form";
import { ComplaintLiveTime } from "@/components/complaint-live-time";

export const instant = false;

async function WorkerPortfolioContent() {
  const cookieStore = await cookies();
  const sessionUserId =
    cookieStore.get("hcms_user_id")?.value ||
    cookieStore.get("userId")?.value;

  type WorkerUser = Prisma.UserGetPayload<object>;

  type ComplaintWithRelations = Prisma.ComplaintGetPayload<{
    include: {
      feedback: true;
      attachments: true;
      subCategory: { include: { category: true } };
      student: true;
      worker: true;
    };
  }>;

  let workers: WorkerUser[] = [];
  let allComplaints: ComplaintWithRelations[] = [];
  let availableTickets: ComplaintWithRelations[] = [];

  try {
    workers = (await prisma.user.findMany({
      where: { role: Role.WORKER },
      orderBy: { name: "asc" },
    })) as unknown as WorkerUser[];

    allComplaints = (await prisma.complaint.findMany({
      include: {
        feedback: true,
        attachments: true,
        subCategory: { include: { category: true } },
        student: true,
        worker: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    })) as unknown as ComplaintWithRelations[];

    // Available tickets awaiting a worker (unassigned or logged)
    availableTickets = allComplaints.filter(
      (c) =>
        c.workerId === null &&
        c.status !== ComplaintStatus.RESOLVED &&
        c.status !== ComplaintStatus.CLOSED
    );
  } catch (err) {
    console.warn("Worker portfolio database query warning:", err);
  }

  if (workers.length === 0) {
    workers = [
      {
        id: "cmv48dpg800077k7caoq3b1y6",
        name: "Ramesh Kumar",
        email: "ramesh.electrician@hostel.edu",
        phone: "+91 98111 22233",
        role: Role.WORKER,
        categoryExpertise: "ELECTRICAL",
        blockAssigned: null,
        roomNumber: null,
        passwordHash: null,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // Active logged-in technician
  const currentWorker =
    workers.find((w) => w.id === sessionUserId) || workers[0];

  // Tickets appointed to this worker that are in progress / active
  const myAppointedJobs = allComplaints.filter(
    (c) =>
      c.workerId === currentWorker.id &&
      c.status !== ComplaintStatus.RESOLVED &&
      c.status !== ComplaintStatus.CLOSED
  );

  // Tickets completed by this worker
  const myCompletedJobs = allComplaints.filter(
    (c) =>
      c.workerId === currentWorker.id &&
      (c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED)
  );

  const myRatings = myCompletedJobs
    .map((c) => c.feedback?.starRating)
    .filter((r): r is number => typeof r === "number");

  const myAvgRating =
    myRatings.length > 0
      ? (myRatings.reduce((sum, r) => sum + r, 0) / myRatings.length).toFixed(1)
      : "5.0";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. Header & Active Technician Identity Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Field Maintenance Dispatch Desk
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Staff & Technician Portfolio.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Accept incoming resident problem tickets, claim work orders, and submit verified completion handovers.
          </p>
        </div>

        {/* Current Worker Profile Pill */}
        <div className="relative z-10 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md flex items-center gap-3.5 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-amber-500/20">
            {currentWorker.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{currentWorker.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentWorker.categoryExpertise || "STAFF"}
              </span>
            </div>
            <span className="text-xs text-slate-400 block mt-0.5">
              {currentWorker.phone || "On Campus Dispatch"}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for Work Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111726]/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Tickets Awaiting Staff
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {availableTickets.length}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Ready for acceptance</p>
        </div>

        <div className="bg-white dark:bg-[#111726]/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            My Appointed Jobs
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {myAppointedJobs.length}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">In-progress onsite</p>
        </div>

        <div className="bg-white dark:bg-[#111726]/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Completed Resolutions
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {myCompletedJobs.length}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Verified handovers</p>
        </div>

        <div className="bg-white dark:bg-[#111726]/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Resident Rating Score
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 flex items-center gap-1.5 mt-1">
            <span>{myAvgRating}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">From student reviews</p>
        </div>
      </div>

      {/* 2. SECTION A: Available Problem Tickets for Worker Acceptance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Available Problem Tickets (Awaiting Technician)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review defect complaints lodged by students. Click accept to claim the work order and get appointed.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
            {availableTickets.length} Open
          </span>
        </div>

        {availableTickets.length === 0 ? (
          <div className="bg-white dark:bg-[#111726]/90 rounded-3xl p-10 text-center border border-slate-200/80 dark:border-slate-800 text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">All student tickets are currently claimed!</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">No pending unassigned complaints in the hostel maintenance pool.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTickets.map((ticket) => {
              const isEmergency = ticket.priority === Priority.EMERGENCY || ticket.emergencyFlag;
              const isMatch =
                currentWorker.categoryExpertise &&
                ticket.subCategory?.category?.name
                  ?.toUpperCase()
                  .includes(currentWorker.categoryExpertise.toUpperCase());

              return (
                <div
                  key={ticket.id}
                  className={`bg-white dark:bg-[#111726]/90 rounded-2xl p-5 border transition duration-200 shadow-xs flex flex-col justify-between space-y-4 ${
                    isMatch
                      ? "border-amber-400 ring-2 ring-amber-400/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {ticket.complaintRefId}
                        </span>
                        {isEmergency && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                            <Flame className="w-3 h-3 text-rose-600 fill-rose-500" />
                            2-Hour Hazard
                          </span>
                        )}
                        {isMatch && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            ★ Matches Trade ({currentWorker.categoryExpertise})
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {ticket.subCategory?.category?.name} — {ticket.subCategory?.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {ticket.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {ticket.student?.name || "Student"}
                        </span>
                      </div>
                      <Link
                        href={`/worker/tickets/${ticket.id}`}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Inspect Details &rarr;
                      </Link>
                    </div>

                    <div className="pt-1">
                      <ComplaintLiveTime
                        createdAt={ticket.createdAt}
                        tatDeadline={ticket.tatDeadline}
                        isResolved={false}
                        compact
                      />
                    </div>
                  </div>

                  {/* Accept Work Order Button Form */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <WorkerAcceptButton
                      complaintId={ticket.id}
                      workerId={currentWorker.id}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. SECTION B: My Active Work Orders (Appointed to Me) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>My Appointed Work Orders ({currentWorker.name})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active maintenance tasks claimed by you. Complete repairs and mark resolved to notify the student.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
            {myAppointedJobs.length} In-Progress
          </span>
        </div>

        {myAppointedJobs.length === 0 ? (
          <div className="bg-white dark:bg-[#111726]/90 rounded-3xl p-10 text-center border border-slate-200/80 dark:border-slate-800 text-slate-400 space-y-2">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No active work orders appointed to you right now.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Claim an open ticket from the pool above to start your repair order.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAppointedJobs.map((job) => {
              const isEmergency = job.priority === Priority.EMERGENCY || job.emergencyFlag;

              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-[#111726]/90 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-900/50 ring-2 ring-indigo-500/10 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {job.complaintRefId}
                        </span>
                        {isEmergency && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                            <Flame className="w-3 h-3 text-rose-600 fill-rose-500" />
                            Emergency
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                          Appointed to You
                        </span>
                      </div>

                      <Link
                        href={`/worker/tickets/${job.id}`}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        View Student Ticket &rarr;
                      </Link>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {job.subCategory?.category?.name} — {job.subCategory?.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {job.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <ComplaintLiveTime
                        createdAt={job.createdAt}
                        tatDeadline={job.tatDeadline}
                        isResolved={false}
                        compact
                      />
                    </div>
                  </div>

                  {/* Resolve Work Order Form */}
                  <WorkerResolveForm
                    complaintId={job.id}
                    workerId={currentWorker.id}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. SECTION C: Technician Directory & Proof Portfolio Gallery */}
      <div className="space-y-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Campus Technician Directory & Handover Proofs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified staff accounts, contact directories, and resident handover evidence portfolios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workers.map((worker) => {
            const workerComplaints = allComplaints.filter((c) => c.workerId === worker.id);
            const resolvedComplaints = workerComplaints.filter(
              (c) =>
                c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED
            );
            const activeComplaints = workerComplaints.filter(
              (c) =>
                c.status !== ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.CLOSED
            );

            const feedbackRatings = workerComplaints
              .map((c) => c.feedback?.starRating)
              .filter((r): r is number => typeof r === "number");

            const avgRating =
              feedbackRatings.length > 0
                ? (
                    feedbackRatings.reduce((sum: number, r: number) => sum + r, 0) /
                    feedbackRatings.length
                  ).toFixed(1)
                : null;

            const resolutionProofs = workerComplaints
              .flatMap((c) => c.attachments || [])
              .slice(0, 4);

            return (
              <div
                key={worker.id}
                className="bg-white dark:bg-[#111726]/90 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 hover:shadow-md transition duration-200"
              >
                {/* Worker Top Profile */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold text-base flex items-center justify-center shadow-sm">
                      {worker.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                        {worker.name}
                      </h3>
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-900/50 inline-block mt-1">
                        {worker.categoryExpertise || "General Maintenance"} Specialist
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {avgRating ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-extrabold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{avgRating}</span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                          ({feedbackRatings.length})
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">New Staff</span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Active
                    </span>
                    <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                      {activeComplaints.length}
                    </span>
                  </div>
                  <div className="border-x border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Resolved
                    </span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {resolvedComplaints.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Campus Rating
                    </span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {avgRating || "5.0"}
                    </span>
                  </div>
                </div>

                {/* Phone Contact */}
                {worker.phone && (
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {worker.phone}
                    </span>
                    <a
                      href={`tel:${worker.phone}`}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Call Technician
                    </a>
                  </div>
                )}

                {/* Proof Gallery */}
                {resolutionProofs.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Verified Handover Proof Gallery
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {resolutionProofs.map((att) => (
                        <div
                          key={att.id}
                          className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative group"
                        >
                          <Image
                            src={att.fileUrl}
                            alt="Resolution Evidence"
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default async function WorkerPortfolioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0B0F17] flex items-center justify-center text-sm text-slate-400">
          Loading staff portfolios...
        </div>
      }
    >
      <WorkerPortfolioContent />
    </Suspense>
  );
}