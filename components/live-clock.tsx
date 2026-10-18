"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function LiveClock() {
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const update = () => {
      setTimeStr(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !timeStr) return null;

  return (
    <div
      suppressHydrationWarning
      title="Live Operations Real-Time Clock"
      className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-200"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <Clock className="w-3 h-3 text-indigo-500" />
      <span suppressHydrationWarning>{timeStr}</span>
    </div>
  );
}
