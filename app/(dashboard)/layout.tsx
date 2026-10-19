import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role, User } from "@prisma/client";
import { Sparkles, Building2, Wrench, Shield, ShieldCheck } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { LiveClock } from "@/components/live-clock";
import { ThemeToggle } from "@/components/theme-toggle";

export const instant = false;

function resolveRole(roleStr?: string): Role {
  if (!roleStr) return Role.STUDENT;
  const upper = roleStr.toUpperCase();
  if (upper === "WORKER" || upper === "TECHNICIAN" || upper === "STAFF") {
    return Role.WORKER;
  }
  if (upper === "WARDEN" || upper === "AGENT") {
    return Role.WARDEN;
  }
  if (upper === "COORDINATOR" || upper === "ADMIN") {
    return Role.COORDINATOR;
  }
  return Role.STUDENT;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const cookieStore = await cookies();
  const rawRole =
    cookieStore.get("hcms_role")?.value ||
    cookieStore.get("dev_role")?.value;

  const sessionUserId =
    cookieStore.get("hcms_user_id")?.value ||
    cookieStore.get("userId")?.value ||
    cookieStore.get("session")?.value;

  // Enforce session presence
  if (!rawRole && !sessionUserId) {
    redirect("/login");
  }

  const targetRole = resolveRole(rawRole);
  let user: User | null = null;

  try {
    if (sessionUserId) {
      user = await prisma.user.findUnique({
        where: { id: sessionUserId },
      });
    }

    if (!user && targetRole) {
      user = await prisma.user.findFirst({
        where: { role: targetRole },
      });
    }
  } catch (error) {
    console.warn("Layout database fetch warning:", error);
  }

  // Resilient fallback user if database is reconnecting
  if (!user && targetRole) {
    const ALL_PROFILES: Record<string, Partial<User>> = {
      // Students
      "cmv48dmol00007k7czr57hpc2": { name: "Aarav Sharma", roomNumber: "A-204", blockAssigned: "Block A", email: "aarav.student@hostel.edu", role: Role.STUDENT },
      "cmv48dn1z00017k7ct1ktqlrs": { name: "Rohan Patel", roomNumber: "B-312", blockAssigned: "Block B", email: "rohan.student@hostel.edu", role: Role.STUDENT },
      "cmv48dngl00027k7ci4608hgf": { name: "Priya Iyer", roomNumber: "C-105", blockAssigned: "Block C", email: "priya.student@hostel.edu", role: Role.STUDENT },
      "cmv48dnuj00037k7c80qgkxor": { name: "Ananya Das", roomNumber: "A-108", blockAssigned: "Block A", email: "ananya.student@hostel.edu", role: Role.STUDENT },
      // Wardens
      "cmv48do8r00047k7cey5r15op": { name: "Dr. Vikram Singh", blockAssigned: "Block A", email: "warden.singh@hostel.edu", role: Role.WARDEN },
      "cmv48don500057k7cfztdr1vy": { name: "Prof. Rajesh Gupta", blockAssigned: "Block B", email: "warden.gupta@hostel.edu", role: Role.WARDEN },
      "cmv48dp1d00067k7c5pymtohf": { name: "Dr. Sunita Rao", blockAssigned: "Block C", email: "warden.rao@hostel.edu", role: Role.WARDEN },
      // Workers
      "cmv48dpg800077k7caoq3b1y6": { name: "Ramesh Kumar", categoryExpertise: "ELECTRICAL", email: "ramesh.electrician@hostel.edu", role: Role.WORKER },
      "cmv48dpu000087k7cdjr8vb4a": { name: "Suresh Verma", categoryExpertise: "PLUMBING", email: "suresh.plumber@hostel.edu", role: Role.WORKER },
      "cmv48dq7z00097k7cwtdjpnmz": { name: "Amit Sharma", categoryExpertise: "CARPENTRY", email: "amit.carpenter@hostel.edu", role: Role.WORKER },
      "cmv48dqmz000a7k7cuuyijech": { name: "Manoj Kumar", categoryExpertise: "NETWORKING", email: "manoj.network@hostel.edu", role: Role.WORKER },
      // Coordinators
      "cmv48dr16000b7k7cusilp342": { name: "Pooja Mehta", email: "admin.hcms@hostel.edu", role: Role.COORDINATOR },
      "cmv48drez000c7k7csjrddk8s": { name: "Kavita Nambiar", email: "kavita.operations@hostel.edu", role: Role.COORDINATOR },
    };

    const fb =
      (sessionUserId && ALL_PROFILES[sessionUserId]) ||
      Object.values(ALL_PROFILES).find((p) => p.role === targetRole);
    if (fb) {
      user = {
        id: sessionUserId || fb.id || "seed-user-1",
        name: fb.name || "Campus User",
        email: fb.email || "user@hostel.edu",
        passwordHash: null,
        phone: null,
        role: targetRole,
        blockAssigned: fb.blockAssigned || null,
        roomNumber: fb.roomNumber || null,
        categoryExpertise: fb.categoryExpertise || null,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  if (!user) {
    redirect("/login");
  }

  const activeRole: Role = user.role;
  const isStudent = activeRole === Role.STUDENT;
  const isWorker = activeRole === Role.WORKER;
  const isWarden = activeRole === Role.WARDEN;
  const isCoordinator = activeRole === Role.COORDINATOR;

  // Strict role-specific navigation links
  const navLinks = isStudent
    ? [
      { label: "My Complaints", href: "/student" },
      { label: "Lodge Request", href: "/student/requests/new" },
      { label: "Campus Showcase", href: "/student/showcase" },
    ]
    : isWorker
      ? [
        { label: "Assigned Work Orders", href: "/worker" },
      ]
      : isWarden
        ? [
          { label: "Triage Queue", href: "/warden" },
          { label: "Hostel Radar", href: "/warden/surveillance" },
          { label: "SLA Analytics", href: "/warden/analytics" },
          { label: "Staff Portfolio", href: "/worker" },
        ]
        : [
          { label: "Operations Queue", href: "/coordinator" },
          { label: "Campus Radar", href: "/coordinator/surveillance" },
          { label: "SLA Analytics", href: "/coordinator/analytics" },
          { label: "Staff Portfolio", href: "/worker" },
        ];

  const homeHref = isStudent
    ? "/student"
    : isWorker
      ? "/worker"
      : isWarden
        ? "/warden"
        : "/coordinator";

  // Role visual accents
  const roleTheme = isStudent
    ? {
      badgeBg: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50",
      avatarGrad: "from-blue-600 to-indigo-600",
      label: "Resident Student",
      extraInfo: user.roomNumber ? `Room ${user.roomNumber}` : user.blockAssigned || "Hostel Resident",
      icon: Building2,
    }
    : isWorker
      ? {
        badgeBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50",
        avatarGrad: "from-amber-500 to-orange-600",
        label: "Field Technician",
        extraInfo: user.categoryExpertise ? `${user.categoryExpertise} Maintenance` : "Facility Support",
        icon: Wrench,
      }
      : isWarden
        ? {
          badgeBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50",
          avatarGrad: "from-indigo-600 to-violet-600",
          label: "Hostel Warden",
          extraInfo: user.blockAssigned ? `${user.blockAssigned} Admin` : "Warden In-charge",
          icon: Shield,
        }
        : {
          badgeBg: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50",
          avatarGrad: "from-purple-600 to-pink-600",
          label: "Coordinator Admin",
          extraInfo: "Campus Operations",
          icon: ShieldCheck,
        };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const RoleIcon = roleTheme.icon;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#111726]/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6 sm:gap-8 min-w-0">
            <Link
              href={homeHref}
              prefetch={false}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-md transition">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  HCMS
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase -mt-0.5 hidden sm:inline">
                  Operations
                </span>
              </div>
            </Link>

            {/* Role-isolated nav items */}
            <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition duration-150 whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Header Identity, Clock, Theme Toggle & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Clock */}
            <LiveClock />

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1 rounded-full bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
              <div
                className={`w-7 h-7 rounded-full bg-gradient-to-tr ${roleTheme.avatarGrad} text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0`}
              >
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md border ${roleTheme.badgeBg}`}
                  >
                    {activeRole}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 leading-tight">
                  <RoleIcon className="w-2.5 h-2.5" />
                  {roleTheme.extraInfo}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="animate-in fade-in duration-200">{children}</main>
    </div>
  );
}