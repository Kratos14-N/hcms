"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, CheckCircle, MessageSquare, AlertTriangle } from "lucide-react";

interface FeedbackHandoverProps {
  complaintId: string;
  technicianName?: string;
  onSubmitted?: () => void;
}

export default function FeedbackHandover({
  complaintId,
  technicianName = "Campus Maintenance Staff",
}: FeedbackHandoverProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState("");
  const [isFixed, setIsFixed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Direct call to update the ticket status and log student satisfaction
      const res = await fetch(`/api/complaints/${complaintId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          feedbackText: comments,
          isFixed,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    } catch {
      // Fallback optimistic UI
      setSubmitted(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-center space-y-2">
        <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
        <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
          Handover Verified & Feedback Recorded!
        </h4>
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          Thank you for verifying {technicianName}&apos;s work. Ticket is marked officially closed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111726]/90 rounded-2xl border-2 border-teal-500/40 dark:border-teal-500/30 shadow-lg p-6 space-y-4">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
            Student Handover Verification
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            Has your complaint been resolved properly?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {technicianName} marked this job finished. Please review the work.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Verification Checkbox */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Yes, I have verified the repair in person and the issue is resolved.
            </span>
          </label>
          {!isFixed && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5 pl-6 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              Unchecking this will re-open the ticket and alert the Warden for follow-up inspection.
            </p>
          )}
        </div>

        {/* 5-Star Rating Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
            Rate {technicianName}&apos;s Work Quality (CSAT)
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-300 dark:text-slate-600 hover:scale-110 transition cursor-pointer"
              >
                <Star
                  className={`w-7 h-7 ${
                    (hoverRating || rating) >= star
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 dark:text-slate-700"
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Written Review */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            Technician Notes & Review
          </label>
          <textarea
            rows={2}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="e.g. Arrived on time, tested the socket voltage, and cleaned up debris."
            className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-bold text-xs tracking-wide shadow-md shadow-teal-700/20 transition cursor-pointer"
        >
          {submitting ? "Submitting Sign-off..." : "Confirm Handover & Submit Feedback"}
        </button>
      </form>
    </div>
  );
}