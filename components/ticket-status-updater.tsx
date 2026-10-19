"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ComplaintStatus } from "@prisma/client";
import { CheckCircle2, Loader2, Wrench } from "lucide-react";

interface Technician {
  id: string;
  name: string;
  categoryExpertise?: string | null;
}

interface TicketStatusUpdaterProps {
  complaintId: string;
  initialStatus: ComplaintStatus;
  initialWorkerId?: string | null;
  initialResolutionNotes?: string | null;
  technicians?: Technician[];
}

export function TicketStatusUpdater({
  complaintId,
  initialStatus,
  initialWorkerId,
  initialResolutionNotes,
  technicians = [],
}: TicketStatusUpdaterProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ComplaintStatus>(initialStatus);
  const [workerId, setWorkerId] = useState<string>(initialWorkerId || "");
  const [resolutionNotes, setResolutionNotes] = useState(
    initialResolutionNotes || ""
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/complaints/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId,
          status,
          assignedWorkerId: workerId,
          resolutionNotes: resolutionNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }

      setSuccess(true);
      router.refresh();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error updating ticket";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  const isResolved = status === ComplaintStatus.RESOLVED;

  return (
    <div className="bg-white dark:bg-[#111726]/90 rounded-2xl border-2 border-teal-500/40 dark:border-teal-500/30 shadow-md p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <Wrench className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Technician Action Panel
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
            Assigned Field Technician
          </label>
          <select
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            disabled={loading}
            className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50"
          >
            <option value="" className="text-slate-900 dark:text-white dark:bg-slate-800">Select Technician...</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id} className="text-slate-900 dark:text-white dark:bg-slate-800">
                {t.name} ({t.categoryExpertise || "Staff"})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
            Update Ticket Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
            disabled={loading}
            className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50"
          >
            <option value={ComplaintStatus.ASSIGNED} className="text-slate-900 dark:text-white dark:bg-slate-800">ASSIGNED (In Queue)</option>
            <option value={ComplaintStatus.IN_PROGRESS} className="text-slate-900 dark:text-white dark:bg-slate-800">IN_PROGRESS (Working on site)</option>
            <option value={ComplaintStatus.RESOLVED} className="text-slate-900 dark:text-white dark:bg-slate-800">RESOLVED (Ready for Student Check)</option>
            <option value={ComplaintStatus.CLOSED} className="text-slate-900 dark:text-white dark:bg-slate-800">CLOSED (Completed & Verified)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
            Diagnosis & Resolution Log
          </label>
          <textarea
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            disabled={loading}
            rows={3}
            placeholder="e.g. Tightened terminal wiring, replaced 16A socket and verified earthing voltage."
            className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:cursor-not-allowed ${
            success
              ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              : "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Applying Update...</span>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status Updated & Resident Notified!</span>
            </>
          ) : (
            <span>Submit Update & Notify Resident</span>
          )}
        </button>

        {errorMsg && (
          <p className="text-[11px] text-rose-600 dark:text-rose-400 text-center font-medium">
            {errorMsg}
          </p>
        )}
      </form>

      {isResolved && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Awaiting Student Verification
          </span>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
            Marked resolved. Handover feedback gate is active in resident portal.
          </p>
        </div>
      )}
    </div>
  );
}
