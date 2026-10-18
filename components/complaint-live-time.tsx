"use client";

import { useEffect, useState } from "react";
import { Clock, Timer } from "lucide-react";

interface ComplaintLiveTimeProps {
  createdAt: Date | string;
  tatDeadline?: Date | string | null;
  isResolved?: boolean;
  compact?: boolean;
}

export function ComplaintLiveTime({
  createdAt,
  tatDeadline,
  isResolved = false,
  compact = false,
}: ComplaintLiveTimeProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const createdDate = new Date(createdAt);

  if (!mounted || !now) {
    return (
      <div
        suppressHydrationWarning
        className={
          compact
            ? "inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500"
            : "flex items-center gap-2 text-xs text-slate-400"
        }
      >
        <Clock className={compact ? "w-3 h-3 text-indigo-400" : "w-3.5 h-3.5 text-indigo-400"} />
        <span suppressHydrationWarning>Active ticket</span>
      </div>
    );
  }

  const diffMs = Math.max(0, now.getTime() - createdDate.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const elapsedText =
    hours > 0 ? `${hours}h ${minutes}m active` : `${minutes}m active`;

  const deadline = tatDeadline ? new Date(tatDeadline) : null;
  const isBreached = deadline && !isResolved && now.getTime() > deadline.getTime();

  if (compact) {
    return (
      <div suppressHydrationWarning className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
        <span suppressHydrationWarning className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-indigo-500" />
          <span suppressHydrationWarning>
            Lodged: {createdDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </span>
        {!isResolved && (
          <>
            <span>•</span>
            <span suppressHydrationWarning className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {elapsedText}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs">
      <div suppressHydrationWarning className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span suppressHydrationWarning>
          Lodged: {createdDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {!isResolved && (
        <div suppressHydrationWarning className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold">
          <Timer className="w-3 h-3 text-amber-600 animate-pulse" />
          <span suppressHydrationWarning>{elapsedText} (Live)</span>
        </div>
      )}

      {deadline && (
        <div
          suppressHydrationWarning
          className={`inline-flex items-center gap-1 font-semibold ${
            isBreached ? "text-rose-600 font-bold" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <span suppressHydrationWarning>
            Target: {deadline.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isBreached && (
            <span suppressHydrationWarning className="text-[10px] text-rose-600 font-extrabold uppercase">
              (SLA Breached)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
