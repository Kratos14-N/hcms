"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

interface WorkerAcceptButtonProps {
  complaintId: string;
  workerId: string;
}

export function WorkerAcceptButton({ complaintId, workerId }: WorkerAcceptButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleAccept() {
    if (loading || success) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/worker/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ACCEPT",
          complaintId,
          workerId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to accept ticket");
      }

      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error accepting ticket";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>Ticket Accepted! Appointed to You</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 w-full">
      <button
        id={`accept-btn-${complaintId}`}
        type="button"
        onClick={handleAccept}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Appointing You to Work Order...</span>
          </>
        ) : (
          <>
            <Wrench className="w-3.5 h-3.5" />
            <span>Accept Ticket & Appoint Myself</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      {errorMsg && (
        <p className="text-[11px] text-rose-600 text-center font-medium">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
