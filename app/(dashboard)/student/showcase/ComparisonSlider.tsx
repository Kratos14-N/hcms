"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Sparkles, Camera } from "lucide-react";

interface ComparisonSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeIsVideo?: boolean;
  afterIsVideo?: boolean;
  aspectRatio?: string;
}

export default function ComparisonSlider({
  beforeUrl,
  afterUrl,
  beforeIsVideo,
  afterIsVideo,
  aspectRatio = "aspect-4/3",
}: ComparisonSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const calculatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(rect.width, x));
    setSliderPos((clamped / rect.width) * 100);
  }, []);

  // Universal Touch Handlers (iOS / Android)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsInteracting(true);
    if (e.touches[0]) {
      calculatePosition(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isInteracting) return;
    if (e.touches[0]) {
      calculatePosition(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsInteracting(false);
  };

  // Universal Mouse & Pointer Handlers (Mac / Windows / Trackpad)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsInteracting(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if pointer capture is not supported
    }
    calculatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteracting) return;
    calculatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsInteracting(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Auto-released
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative ${aspectRatio} w-full rounded-2xl overflow-hidden bg-black select-none cursor-ew-resize touch-none shadow-inner`}
      style={{ WebkitUserSelect: "none" }}
    >
      {/* After Layer (Base Layer) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {afterIsVideo ? (
          <video
            src={afterUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={afterUrl}
            alt="Restored repair"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
            className="object-cover"
            draggable={false}
          />
        )}
        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-semibold backdrop-blur-md flex items-center gap-1 z-10">
          <Sparkles className="w-3 h-3" />
          Restored
        </span>
      </div>

      {/* Before Layer (Top Overlay Layer clipped by slider) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        {beforeIsVideo ? (
          <video
            src={beforeUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={beforeUrl}
            alt="Initial incident"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
            className="object-cover"
            draggable={false}
          />
        )}
        <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/75 text-white text-[10px] font-semibold backdrop-blur-md flex items-center gap-1 z-10">
          <Camera className="w-3 h-3" />
          Reported Hazard
        </span>
      </div>

      {/* Divider Bar & Centered Handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-800 text-[11px] font-bold transition-transform ${
            isInteracting ? "scale-115 ring-4 ring-[#0071e3]/40" : "hover:scale-105"
          }`}
        >
          ⇄
        </div>
      </div>
    </div>
  );
}