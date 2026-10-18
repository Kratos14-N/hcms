"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Clear any leftover client cookies
      const clearCookie = (name: string) => {
        document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      };
      clearCookie("hcms_role");
      clearCookie("hcms_user_id");
      clearCookie("dev_role");
      clearCookie("userId");
      clearCookie("session");

      window.location.assign("/login");
    } catch {
      window.location.assign("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoggingOut}
      title="Sign Out of HCMS"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition duration-200 cursor-pointer disabled:opacity-50"
    >
      {isLoggingOut ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  );
}
