import { Skeleton, StatsRowSkeleton, TicketListSkeleton } from "@/components/ui/skeleton";

export default function CoordinatorLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Master Operations Command Header */}
      <div className="bg-gradient-to-r from-purple-700/90 via-indigo-700/90 to-blue-700/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <Skeleton className="h-6 w-48 rounded-full bg-white/20" />
          <Skeleton className="h-9 sm:h-11 w-72 sm:w-96 rounded-xl bg-white/25" />
          <Skeleton className="h-4 w-full sm:w-[480px] rounded-lg bg-white/15" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-11 w-36 rounded-2xl bg-white/30" />
          <Skeleton className="h-11 w-36 rounded-2xl bg-white/30" />
        </div>
      </div>

      {/* KPI Stats Row (4 stats cards) */}
      <StatsRowSkeleton count={4} />

      {/* Filter Tabs & Quick Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-40 rounded-xl hidden sm:block" />
      </div>

      {/* Incident List */}
      <TicketListSkeleton count={6} />
    </div>
  );
}
