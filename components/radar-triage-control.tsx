"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ComplaintStatus } from "@prisma/client";
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react";

interface Technician {
  id: string;
  name: string;
  categoryExpertise?: string | null;
}

interface RadarTriageControlProps {
  complaintId: string;
  initialWorkerId?: string | null;
  initialStatus: ComplaintStatus;
  technicians: Technician[];
  ticketDetailHref: string;
}

export function RadarTriageControl({
  complaintId,
  initialWorkerId,
  initialStatus,
  technicians,
  ticketDetailHref,
}: RadarTriageControlProps) {
  const router = useRouter();
  const [workerId, setWorkerId] = useState<string>(initialWorkerId || "");
  const [status, setStatus] = useState<ComplaintStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
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
          assignedWorkerId: workerId,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update complaint");
      }

      if (data.complaint?.workerId) {
        setWorkerId(data.complaint.workerId);
      }

      setSuccess(true);
      router.refresh();

      setTimeout(() => {
        setSuccess(false);
      }, 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error updating ticket";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  function handleStatusChange(newStatus: ComplaintStatus) {
    setStatus(newStatus);
    // If advancing to an active state and no worker is selected, pre-select the first technician
    if (
      (newStatus === ComplaintStatus.ASSIGNED ||
        newStatus === ComplaintStatus.IN_PROGRESS ||
        newStatus === ComplaintStatus.RESOLVED) &&
      !workerId &&
      technicians.length > 0
    ) {
      setWorkerId(technicians[0].id);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
      <form
        onSubmit={handleUpdate}
        className="flex flex-wrap items-center gap-2 w-full sm:w-auto"
      >
        {/* Quick Assign Worker Dropdown */}
        <select
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          disabled={loading}
          aria-label="Dispatch Technician"
          className="text-xs font-medium px-3 py-2 rounded-xl border border-[#d2d2d7] dark:border-slate-700 bg-[#fbfbfd] dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition disabled:opacity-50"
        >
          <option value="" className="dark:bg-slate-800 dark:text-white">Dispatch Technician...</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id} className="dark:bg-slate-800 dark:text-white">
              {t.name} ({t.categoryExpertise || "Staff"})
            </option>
          ))}
        </select>

        {/* Quick Status Shift */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus)}
          disabled={loading}
          aria-label="Update Complaint Status"
          className="text-xs font-medium px-3 py-2 rounded-xl border border-[#d2d2d7] dark:border-slate-700 bg-[#fbfbfd] dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition disabled:opacity-50"
        >
          <option value={ComplaintStatus.LOGGED} className="dark:bg-slate-800 dark:text-white">LOGGED</option>
          <option value={ComplaintStatus.ASSIGNED} className="dark:bg-slate-800 dark:text-white">ASSIGNED</option>
          <option value={ComplaintStatus.IN_PROGRESS} className="dark:bg-slate-800 dark:text-white">IN PROGRESS</option>
          <option value={ComplaintStatus.RESOLVED} className="dark:bg-slate-800 dark:text-white">RESOLVED</option>
          <option value={ComplaintStatus.CLOSED} className="dark:bg-slate-800 dark:text-white">CLOSED</option>
        </select>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:cursor-not-allowed ${success
            ? "bg-emerald-600 text-white"
            : "bg-[#0071e3] hover:bg-[#0077ed] text-white"
            }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Updating...</span>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </>
          ) : (
            <span>Update</span>
          )}
        </button>
      </form>

      {/* Inspect full ticket link */}
      <Link
        href={ticketDetailHref}
        className="p-2 rounded-xl text-[#86868b] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#f5f5f7] dark:hover:bg-slate-800 transition"
        title="Inspect full ticket"
      >
        <ExternalLink className="w-4 h-4" />
      </Link>

      {errorMsg && (
        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
