import * as React from "react"
import { cn } from "cn"

interface SkeletonProps extends React.ComponentProps<"div"> {
  shimmer?: boolean
}

function Skeleton({
  className,
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md bg-slate-200/90 dark:bg-slate-800/90 animate-pulse",
        shimmer && "animate-shimmer",
        className
      )}
      {...props}
    />
  )
}

function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#111726]/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between",
        className
      )}
    >
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-24 rounded" />
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-3 w-32 rounded" />
      </div>
      <Skeleton className="w-12 h-12 rounded-2xl" />
    </div>
  )
}

function StatsRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={cn("grid gap-4", count === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3")}>
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  )
}

function TicketCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#111726]/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        className
      )}
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
  )
}

function TicketListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </div>
  )
}

function DashboardHeaderSkeleton() {
  return (
    <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-violet-600/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-3 max-w-xl">
        <Skeleton className="h-6 w-44 rounded-full bg-white/20" />
        <Skeleton className="h-10 sm:h-12 w-72 sm:w-96 rounded-xl bg-white/25" />
        <Skeleton className="h-4 w-full sm:w-[460px] rounded-lg bg-white/15" />
      </div>
      <Skeleton className="h-12 w-52 rounded-2xl bg-white/30 shrink-0" />
    </div>
  )
}

function TicketDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top back navigation and status pill */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-[#111726]/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <Skeleton className="h-8 sm:h-10 w-3/4 rounded-xl" />
          <div className="flex items-center gap-4 pt-1">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>
        </div>

        {/* Description box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 space-y-3">
            <Skeleton className="h-4 w-28 rounded" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 space-y-3">
            <Skeleton className="h-4 w-28 rounded" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Skeleton className="h-5 w-36 rounded" />
          <div className="space-y-2.5">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TicketFormSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      <Skeleton className="h-9 w-32 rounded-xl" />
      <div className="bg-white dark:bg-[#111726]/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-[#111726]/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-4">
      {/* Table header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 px-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20 rounded" />
        ))}
      </div>
      {/* Table rows */}
      <div className="space-y-3 px-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/40">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 w-24 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Analytics Header */}
      <div className="bg-gradient-to-r from-blue-700/90 via-indigo-700/90 to-violet-700/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <Skeleton className="h-6 w-40 rounded-full bg-white/20" />
          <Skeleton className="h-9 sm:h-11 w-72 sm:w-96 rounded-xl bg-white/25" />
          <Skeleton className="h-4 w-full sm:w-[420px] rounded-lg bg-white/15" />
        </div>
        <Skeleton className="h-10 w-44 rounded-2xl bg-white/30 shrink-0" />
      </div>

      {/* KPI Cards Row */}
      <StatsRowSkeleton count={4} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111726]/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="bg-white dark:bg-[#111726]/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

function SurveillanceSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Surveillance Header */}
      <div className="bg-gradient-to-r from-rose-700/90 via-red-700/90 to-orange-700/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-red-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <Skeleton className="h-6 w-44 rounded-full bg-white/20" />
          <Skeleton className="h-9 sm:h-11 w-72 sm:w-96 rounded-xl bg-white/25" />
          <Skeleton className="h-4 w-full sm:w-[460px] rounded-lg bg-white/15" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36 rounded-2xl bg-white/30 shrink-0" />
        </div>
      </div>

      {/* Camera / Feed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-[#111726]/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export {
  Skeleton,
  StatsCardSkeleton,
  StatsRowSkeleton,
  TicketCardSkeleton,
  TicketListSkeleton,
  DashboardHeaderSkeleton,
  TicketDetailSkeleton,
  TicketFormSkeleton,
  TableSkeleton,
  AnalyticsSkeleton,
  SurveillanceSkeleton,
}
