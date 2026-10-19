"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";

interface TicketNoteFormProps {
  complaintId: string;
  role: "WARDEN" | "COORDINATOR";
}

export function TicketNoteForm({ complaintId, role }: TicketNoteFormProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = note.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/complaints/${complaintId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: trimmed,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to log note");
      }

      setNote("");
      setSuccess(true);
      router.refresh();

      setTimeout(() => {
        setSuccess(false);
      }, 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error logging note";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pt-2 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={loading}
          required
          placeholder={`Add internal ${role.toLowerCase()} inspection note...`}
          className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 active:scale-95 disabled:cursor-not-allowed ${
            success
              ? "bg-emerald-700 dark:bg-emerald-600 text-white"
              : "bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Logging...</span>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Logged!</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-teal-400 dark:text-teal-300" />
              <span>Log Note</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
