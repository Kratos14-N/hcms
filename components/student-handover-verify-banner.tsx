"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  Star,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wrench,
} from "lucide-react";

interface UnverifiedComplaint {
  id: string;
  complaintRefId: string;
  description: string;
  location: string;
  resolutionNotes?: string | null;
  resolvedAt?: Date | string | null;
  subCategory?: {
    name: string;
    category?: { name: string };
  } | null;
  worker?: {
    name: string;
    categoryExpertise?: string | null;
    phone?: string | null;
  } | null;
}

interface StudentHandoverVerifyBannerProps {
  complaints: UnverifiedComplaint[];
}

export function StudentHandoverVerifyBanner({
  complaints,
}: StudentHandoverVerifyBannerProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    complaints[0]?.id || ""
  );
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [isFixed, setIsFixed] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !complaints || complaints.length === 0) return null;

  const currentComplaint =
    complaints.find((c) => c.id === selectedTicketId) || complaints[0];

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !currentComplaint) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/complaints/${currentComplaint.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          feedbackText: comments.trim() || null,
          isFixed,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to verify handover");
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-2 animate-in zoom-in-95 duration-200">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Work Completion Verified!
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Thank you for confirming the repair. Ticket{" "}
          <span className="font-mono font-bold text-emerald-600">
            {currentComplaint.complaintRefId}
          </span>{" "}
          is officially closed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-white to-indigo-500/10 dark:from-amber-950/30 dark:via-slate-900 dark:to-indigo-950/30 border-2 border-amber-500/40 dark:border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-lg shadow-amber-500/5 space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-xs font-extrabold border border-amber-300 dark:border-amber-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Action Required: Verify Work Completion</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Technician Completed Your Repair Order
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Please verify that the technician resolved your complaint satisfactorily before the ticket is archived.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-start sm:self-center inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl hover:bg-amber-200/80 transition"
        >
          <span>{isExpanded ? "Collapse" : "Verify Handover"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-5 pt-2 border-t border-amber-200/60 dark:border-slate-800">
          {/* Multiple complaints selector if more than 1 */}
          {complaints.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-500 shrink-0">
                Select Ticket:
              </span>
              {complaints.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedTicketId(c.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                    c.id === selectedTicketId
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {c.complaintRefId}
                </button>
              ))}
            </div>
          )}

          {/* Ticket context preview */}
          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Repair Item
              </span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {currentComplaint.subCategory?.category?.name} — {currentComplaint.subCategory?.name}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Room {currentComplaint.location} • {currentComplaint.description}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Field Technician Statement
              </span>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                {currentComplaint.worker?.name || "Assigned Technician"} ({currentComplaint.worker?.categoryExpertise || "Staff"})
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 italic">
                &ldquo;{currentComplaint.resolutionNotes || "Defect inspected and repair completed onsite."}&rdquo;
              </p>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            {/* Satisfaction Rating Stars */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                Rate Service & Repair Quality
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 transition ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                  {rating === 5 && "★★★★★ 5 - Excellent (Completely Restored)"}
                  {rating === 4 && "★★★★☆ 4 - Good (Prompt & Fixed)"}
                  {rating === 3 && "★★★☆☆ 3 - Average (Satisfactory)"}
                  {rating === 2 && "★★☆☆☆ 2 - Subpar (Delayed)"}
                  {rating === 1 && "★☆☆☆☆ 1 - Unresolved"}
                </span>
              </div>
            </div>

            {/* Checkbox: verified fix */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFixed}
                  onChange={(e) => setIsFixed(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Yes, I have personally verified that the issue is resolved and working.
                </span>
              </label>
              {!isFixed && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 pl-6 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Marking &quot;No&quot; will alert the warden and return the ticket to technician queue.
                </p>
              )}
            </div>

            {/* Comments input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Verification Remarks (Optional)
              </label>
              <input
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="e.g. Technician was polite, tested the switch in front of me, all good."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Handover Sign-Off...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Work Completion & Close Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
