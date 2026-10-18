import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus, Role } from "@prisma/client";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  Users,
  Layers,
} from "lucide-react";

export const instant = false;

async function AnalyticsContent() {
  const targetRoles = [Role.WORKER];

  const [complaints, feedbacks, categories, workers] = await Promise.all([
    prisma.complaint.findMany({
      include: {
        subCategory: {
          include: { category: true },
        },
      },
    }),
    prisma.feedback.findMany(),
    prisma.category.findMany({
      include: { subCategories: true },
    }),
    prisma.user.findMany({
      where: {
        role: {
          in: targetRoles,
        },
      },
    }),
  ]);

  const totalTickets = complaints.length;
  const resolvedTickets = complaints.filter(
    (c) =>
      c.status === ComplaintStatus.RESOLVED ||
      c.status === ComplaintStatus.CLOSED
  );

  const resolutionRate =
    totalTickets > 0
      ? Math.round((resolvedTickets.length / totalTickets) * 100)
      : 100;

  // Compute average resident star score
  const avgSatisfaction =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((acc, f) => acc + f.starRating, 0) / feedbacks.length
        ).toFixed(1)
      : "5.0";

  // Category load distribution
  const categoryStats = categories
    .map((cat) => {
      const count = complaints.filter(
        (c) => c.subCategory?.category?.id === cat.id
      ).length;
      const percentage =
        totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
      return {
        id: cat.id,
        name: cat.name,
        count,
        percentage,
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0071e3] text-xs font-semibold mb-1">
          <TrendingUp className="w-3.5 h-3.5" />
          Executive Operations Telemetry
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
          Campus Facility Analytics.
        </h1>
        <p className="text-sm sm:text-base text-[#86868b] tracking-tight max-w-2xl">
          Aggregated SLA compliance ratios, category problem frequencies, and resident feedback benchmarks.
        </p>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-[24px] p-6 border border-[#e5e5ea] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#86868b]">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            {resolutionRate}%
          </div>
          <p className="text-[11px] text-[#86868b]">
            {resolvedTickets.length} of {totalTickets} total incidents resolved
          </p>
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-[#e5e5ea] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#86868b]">
            <span>Resident CSAT</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            {avgSatisfaction} <span className="text-lg text-[#86868b] font-normal">/ 5.0</span>
          </div>
          <p className="text-[11px] text-[#86868b]">
            Based on {feedbacks.length} verified resident reviews
          </p>
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-[#e5e5ea] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#86868b]">
            <span>Field Workforce</span>
            <Users className="w-4 h-4 text-[#0071e3]" />
          </div>
          <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            {workers.length}
          </div>
          <p className="text-[11px] text-[#86868b]">
            Active maintenance & trade specialists
          </p>
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-[#e5e5ea] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#86868b]">
            <span>Pending Tickets</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
            {totalTickets - resolvedTickets.length}
          </div>
          <p className="text-[11px] text-[#86868b]">
            Currently active or in technician dispatch
          </p>
        </div>
      </div>

      {/* Category Load Breakdown */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-[#e5e5ea] shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
              Hostel Issue Volume by Category
            </h2>
            <p className="text-xs text-[#86868b]">
              Distribution of maintenance overhead across facility systems
            </p>
          </div>
          <Layers className="w-5 h-5 text-[#86868b]" />
        </div>

        <div className="space-y-4 pt-2">
          {categoryStats.map((item) => (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1d1d1f]">{item.name}</span>
                <span className="text-[#86868b]">
                  {item.count} tickets ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#f2f2f7] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0071e3] transition-all duration-500"
                  style={{ width: `${Math.max(item.percentage, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsFallback() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center text-sm text-[#86868b]">
      Compiling facility telemetry...
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsFallback />}>
      <AnalyticsContent />
    </Suspense>
  );
}