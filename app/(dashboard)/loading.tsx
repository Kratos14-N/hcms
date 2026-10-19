// app/(dashboard)/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardRootLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-violet-600/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <Skeleton className="h-6 w-48 rounded-full bg-white/20" />
          <Skeleton className="h-9 sm:h-11 w-72 sm:w-96 rounded-xl bg-white/25" />
          <Skeleton className="h-4 w-full sm:w-[480px] rounded-lg bg-white/15" />
        </div>
        <Skeleton className="h-12 w-56 rounded-2xl bg-white/30 shrink-0" />
      </div>

      {/* KPI Stats Row (3 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#111726]/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-8 w-14 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
            <Skeleton className="w-12 h-12 rounded-2xl" />
          </div>
        ))}
      </div>

      {/* Filter Tabs Bar Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#111726]/90 border border-slate-200/80 dark:border-slate-800 shadow-xs gap-1.5">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-36 rounded-xl hidden sm:block" />
      </div>

      {/* Ticket List Skeleton (5 Rows / Cards) */}
      <div className="space-y-3.5">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="bg-white dark:bg-[#111726]/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-16 rounded hidden md:inline-block" />
              </div>
              <Skeleton className="h-6 w-3/4 sm:w-1/2 rounded-md" />
              <div className="flex items-center gap-4 pt-1">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-3.5 w-36 rounded hidden sm:inline-block" />
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <Skeleton className="h-8 w-24 rounded-xl" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
