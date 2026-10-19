"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  label: string;
  href: string;
}

export function DashboardNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {links.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/student" &&
            item.href !== "/warden" &&
            item.href !== "/worker" &&
            item.href !== "/coordinator" &&
            pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3.5 py-1.5 rounded-full text-xs transition duration-150 whitespace-nowrap ${
              isActive
                ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xs"
                : "text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
