"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { Suspense } from "react";

function TopProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      const currentOrigin = window.location.origin;
      if (!target.href.startsWith(currentOrigin)) return;
      if (target.target === "_blank") return;

      const url = new URL(target.href);
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      setIsNavigating(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress(65), 150);
      const t2 = setTimeout(() => setProgress(85), 450);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    };

    const handleCustomTrigger = () => {
      setIsNavigating(true);
      setProgress(30);
      setTimeout(() => setProgress(75), 200);
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsNavigating(false);
          setProgress(0);
        }, 300);
      }, 600);
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("hcms:navigation-start", handleCustomTrigger);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("hcms:navigation-start", handleCustomTrigger);
    };
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <TopProgressBarInner />
    </Suspense>
  );
}
