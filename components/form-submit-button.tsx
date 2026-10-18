"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface FormSubmitButtonProps {
  label: string;
  pendingLabel?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function FormSubmitButton({
  label,
  pendingLabel = "Submitting...",
  className,
  icon,
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ||
        "w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:opacity-95 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-indigo-600/25 transition cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      }
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
