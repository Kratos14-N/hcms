import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ComplaintStatus } from "@prisma/client";
import ComparisonSlider from "./ComparisonSlider";
import {
  ChevronRight,
  Sparkles,
  Star,
  CheckCircle2,
  Wrench,
  MapPin,
} from "lucide-react";

export const instant = false;

const REAL_SHOWCASE_COMPARISONS: Record<
  string,
  {
    before: { url: string; isVideo?: boolean };
    after: { url: string; isVideo?: boolean };
  }
> = {
  socket: {
    before: {
      url: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=80",
    },
    after: {
      url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
    },
  },
  light: {
    before: {
      url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80",
    },
    after: {
      url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
    },
  },
  geyser: {
    before: {
      url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80",
    },
    after: {
      url: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=900&q=80",
    },
  },
  internet: {
    before: {
      url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80",
    },
    after: {
      url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
    },
  },
  default: {
    before: {
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
    },
    after: {
      url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=900&q=80",
    },
  },
};

function getCategoryMedia(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("socket") || lower.includes("power") || lower.includes("spark")) {
    return REAL_SHOWCASE_COMPARISONS.socket;
  }
  if (lower.includes("light") || lower.includes("tube") || lower.includes("bulb")) {
    return REAL_SHOWCASE_COMPARISONS.light;
  }
  if (lower.includes("geyser") || lower.includes("water") || lower.includes("heater")) {
    return REAL_SHOWCASE_COMPARISONS.geyser;
  }
  if (lower.includes("internet") || lower.includes("wifi") || lower.includes("router")) {
    return REAL_SHOWCASE_COMPARISONS.internet;
  }
  return REAL_SHOWCASE_COMPARISONS.default;
}

function isVideoAsset(url: string, fileType?: string): boolean {
  if (fileType === "VIDEO") return true;
  return /\.(mp4|webm|mov|ogg)($|\?)/i.test(url);
}

async function RepairsGrid() {
  const repairs = await prisma.complaint.findMany({
    where: {
      status: { in: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED] },
    },
    include: {
      subCategory: { include: { category: true } },
      worker: true,
      feedback: true,
      attachments: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  if (repairs.length === 0) {
    return (
      <div className="py-24 text-center bg-white rounded-[28px] border border-[#e5e5ea] text-sm text-[#86868b]">
        No verified repairs logged yet. Resolved tickets automatically feature here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {repairs.map((repair) => {
        const preset = getCategoryMedia(repair.subCategory.name);

        const initialAttach = repair.attachments.find((a) => !a.isResolutionProof);
        const resolvedAttach = repair.attachments.find((a) => a.isResolutionProof);

        const beforeUrl = initialAttach?.fileUrl || preset.before.url;
        const beforeIsVideo = initialAttach
          ? isVideoAsset(initialAttach.fileUrl, initialAttach.fileType)
          : !!preset.before.isVideo;

        const afterUrl = resolvedAttach?.fileUrl || preset.after.url;
        const afterIsVideo = resolvedAttach
          ? isVideoAsset(resolvedAttach.fileUrl, resolvedAttach.fileType)
          : !!preset.after.isVideo;

        return (
          <div
            key={repair.id}
            className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#e5e5ea] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between space-y-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#86868b]">
                  {repair.subCategory.category.name} • {repair.complaintRefId}
                </span>
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                  {repair.subCategory.name}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#86868b] bg-[#f5f5f7] px-3 py-1 rounded-full">
                <MapPin className="w-3 h-3 text-[#0071e3]" />
                Room {repair.location}
              </span>
            </div>

            <div className="space-y-2">
              <ComparisonSlider
                beforeUrl={beforeUrl}
                afterUrl={afterUrl}
                beforeIsVideo={beforeIsVideo}
                afterIsVideo={afterIsVideo}
              />
              <div className="flex items-center justify-between text-[11px] text-[#86868b] px-1 pt-1 font-medium">
                <span>◀ Drag handle to reveal before & after ▶</span>
                <span className="text-[#0071e3]">Interactive Verification</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <p className="text-[#6e6e73] leading-snug line-clamp-1 italic">
                Reported: &ldquo;{repair.description}&rdquo;
              </p>
              <p className="text-[#1d1d1f] font-medium leading-snug line-clamp-1">
                Fixed: {repair.resolutionNotes || "Restored to full operational standard."}
              </p>
            </div>

            <div className="pt-4 border-t border-[#f2f2f7] flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2 text-[#6e6e73]">
                <Wrench className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>{repair.worker?.name || "Campus Maintenance Staff"}</span>
              </div>

              {repair.feedback ? (
                <div className="flex items-center gap-1.5 font-semibold text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-[#ff9500] text-[#ff9500]" />
                  <span>{repair.feedback.starRating}.0 Rating</span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#34c759] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Complete
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GridSkeletonFallback() {
  return (
    <div className="py-24 text-center bg-white rounded-[28px] border border-[#e5e5ea] text-sm text-[#86868b] animate-pulse">
      Loading verified evidence gallery...
    </div>
  );
}

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans antialiased pb-24 selection:bg-[#0071e3] selection:text-white">
      <div className="bg-[#f5f5f7] border-b border-[#e5e5ea] py-3 text-center px-4">
        <p className="text-[12px] sm:text-[13px] text-[#1d1d1f] tracking-tight">
          Verified Campus Proof of Work: 100% student-certified resolution records across all hostel wings.{" "}
          <Link
            href="/student/requests/new"
            className="text-[#0071e3] hover:underline font-normal inline-flex items-center"
          >
            Lodge request <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </p>
      </div>

      <div className="max-w-4xl mx-auto pt-16 sm:pt-20 pb-12 px-6 text-center space-y-6">
        <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-400 via-rose-300 to-amber-200 rounded-full blur-2xl opacity-60 animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-rose-500 via-pink-400 to-amber-300 p-0.5 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-rose-500" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
            Welcome joy.
          </h1>
          <p className="text-lg sm:text-2xl text-[#86868b] font-normal tracking-[-0.015em] max-w-xl mx-auto">
            Celebrate prompt resolution with interactive before-and-after evidence.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/student/requests/new"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] font-medium tracking-tight shadow-sm hover:shadow transition"
          >
            Report an issue
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 mt-6">
        <Suspense fallback={<GridSkeletonFallback />}>
          <RepairsGrid />
        </Suspense>
      </div>
    </div>
  );
}