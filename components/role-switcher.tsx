"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

function setDevRoleCookie(role: string) {
  if (typeof document !== "undefined") {
    document.cookie = `dev_role=${role}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

export function RoleSwitcher({ currentRole }: { currentRole: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (nextRole: string) => {
    setDevRoleCookie(nextRole);

    startTransition(() => {
      if (nextRole === "STUDENT") {
        router.push("/student");
      } else if (nextRole === "WORKER") {
        router.push("/worker");
      } else if (nextRole === "COORDINATOR") {
        router.push("/coordinator");
      } else {
        router.push("/warden");
      }
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1.5 mr-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] hidden sm:inline">
        View as:
      </span>
      <select
        value={currentRole}
        disabled={isPending}
        onChange={(e) => handleRoleChange(e.target.value)}
        className="text-[11px] font-bold bg-[#f2f2f7] hover:bg-[#e5e5ea] border border-[#d2d2d7] text-[#1d1d1f] rounded-lg px-2.5 py-1 outline-none cursor-pointer transition disabled:opacity-50"
      >
        <option value="STUDENT">STUDENT</option>
        <option value="WORKER">WORKER</option>
        <option value="WARDEN">WARDEN</option>
        <option value="COORDINATOR">COORDINATOR</option>
      </select>
    </div>
  );
}