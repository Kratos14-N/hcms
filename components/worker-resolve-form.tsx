"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

interface WorkerResolveFormProps {
  complaintId: string;
  workerId: string;
}

export function WorkerResolveForm({ complaintId, workerId }: WorkerResolveFormProps) {
  const router = useRouter();
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    if (loading || success) return;

    const trimmed = resolutionNotes.trim();
    if (!trimmed) {
      setErrorMsg("Please enter a completion statement.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/worker/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESOLVE",
          complaintId,
          workerId,
          resolutionNotes: trimmed,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to mark resolved");
      }

      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error resolving ticket";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full py-3 px-4 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Work Order Completed! Student Notified for Handover</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleResolve} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
          Technician Completion Statement:
        </label>
        <input
          type="text"
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          required
          placeholder="e.g. Replaced capacitor and verified fan working properly."
          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      <button
        id={`resolve-btn-${complaintId}`}
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Notifying Resident & Closing Order...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Work Order & Notify Student</span>
          </>
        )}
      </button>

      {errorMsg && (
        <p className="text-[11px] text-rose-600 dark:text-rose-400 text-center font-medium">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
