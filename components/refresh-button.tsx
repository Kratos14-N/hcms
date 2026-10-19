"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Check } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleRefresh = () => {
    // Fire top progress bar
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("hcms:navigation-start"));
    }

    startTransition(() => {
      router.refresh();
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 1500);
    });
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isPending}
      title="Refresh live tickets and data"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 disabled:opacity-70 cursor-pointer shadow-2xs"
    >
      {justRefreshed ? (
        <Check className="w-3.5 h-3.5 text-emerald-500" />
      ) : (
        <RefreshCw
          className={`w-3.5 h-3.5 ${isPending ? "animate-spin text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}
        />
      )}
      <span className="hidden md:inline text-[11px]">
        {isPending ? "Refreshing..." : justRefreshed ? "Updated" : "Sync"}
      </span>
    </button>
  );
}
