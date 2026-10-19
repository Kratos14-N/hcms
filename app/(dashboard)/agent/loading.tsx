// app/(dashboard)/agent/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function AgentLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Top Warden Command Header Skeleton */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <Skeleton className="h-6 w-52 rounded-full bg-indigo-500/20" />
          <Skeleton className="h-9 sm:h-11 w-64 sm:w-80 rounded-xl bg-slate-700/60" />
          <Skeleton className="h-4 w-full sm:w-[500px] rounded-lg bg-slate-700/40" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-10 w-32 rounded-2xl bg-slate-800" />
          <Skeleton className="h-10 w-36 rounded-2xl bg-indigo-600/40" />
        </div>
      </div>

      {/* Segmented Triage Filter Tabs Skeleton */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#111726]/90 border border-slate-200/90 dark:border-slate-800 shadow-xs gap-1.5">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-32 rounded-xl" />
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      {/* SLA & Triage Metrics Summary Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#111726]/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2"
          >
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-7 w-12 rounded-lg" />
            <Skeleton className="h-2.5 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Triage Ticket Feed / Table Skeleton (5 Items) */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="bg-white dark:bg-[#111726]/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-32 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4 sm:w-2/3 rounded-md" />
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
