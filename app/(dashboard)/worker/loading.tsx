import { Skeleton, StatsRowSkeleton } from "@/components/ui/skeleton";

export default function WorkerLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="bg-gradient-to-r from-amber-500/90 via-orange-600/90 to-amber-600/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <Skeleton className="h-6 w-44 rounded-full bg-white/20" />
          <Skeleton className="h-9 sm:h-11 w-72 sm:w-80 rounded-xl bg-white/25" />
          <Skeleton className="h-4 w-full sm:w-[420px] rounded-lg bg-white/15" />
        </div>
        <Skeleton className="h-12 w-48 rounded-2xl bg-white/30 shrink-0" />
      </div>

      {/* Stats row (4 cards: Assigned, In Progress, Resolved, Rating) */}
      <StatsRowSkeleton count={4} />

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Task cards list */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#111726]/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <Skeleton className="h-6 w-28 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-3/5 rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
