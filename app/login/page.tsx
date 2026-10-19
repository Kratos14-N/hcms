"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Wrench,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  Building2,
  PhoneCall,
  Flame,
  Check,
  CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import PortalLoading from "../(dashboard)/portal/loading";
import AgentLoading from "../(dashboard)/agent/loading";

type RoleType = "STUDENT" | "WARDEN" | "WORKER" | "COORDINATOR";

interface QuickDemoAccount {
  id: string;
  name: string;
  subtext: string;
  roleBadge: string;
  badgeClass: string;
  avatarGrad: string;
  email: string;
  phone?: string;
  role: RoleType;
}

const DEMO_ACCOUNTS: QuickDemoAccount[] = [
  {
    id: "cmv48dmol00007k7czr57hpc2",
    name: "Aarav Sharma",
    subtext: "Room A-204 • Block A",
    roleBadge: "Resident Student",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    avatarGrad: "from-blue-600 to-indigo-600",
    email: "aarav.student@hostel.edu",
    role: "STUDENT",
  },
  {
    id: "cmv48dn1z00017k7ct1ktqlrs",
    name: "Rohan Patel",
    subtext: "Room B-312 • Block B",
    roleBadge: "Resident Student",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    avatarGrad: "from-blue-600 to-indigo-600",
    email: "rohan.student@hostel.edu",
    role: "STUDENT",
  },
  {
    id: "cmv48do8r00047k7cey5r15op",
    name: "Dr. Vikram Singh",
    subtext: "Block A Administration",
    roleBadge: "Hostel Warden",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
    avatarGrad: "from-indigo-600 to-violet-600",
    email: "warden.singh@hostel.edu",
    role: "WARDEN",
  },
  {
    id: "cmv48dpg800077k7caoq3b1y6",
    name: "Ramesh Kumar",
    subtext: "+91 98111 22233 • Electrical",
    roleBadge: "Field Technician",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    avatarGrad: "from-amber-500 to-orange-600",
    email: "ramesh.electrician@hostel.edu",
    phone: "+91 98111 22233",
    role: "WORKER",
  },
  {
    id: "cmv48dr16000b7k7cusilp342",
    name: "Pooja Mehta",
    subtext: "Campus Operations Desk",
    roleBadge: "Coordinator Admin",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
    avatarGrad: "from-purple-600 to-pink-600",
    email: "admin.hcms@hostel.edu",
    role: "COORDINATOR",
  },
];

function setClientCookies(role: string, userId: string) {
  if (typeof document === "undefined") return;
  const cookieOpts = "path=/; max-age=604800; SameSite=Lax";
  document.cookie = `hcms_role=${role}; ${cookieOpts}`;
  document.cookie = `hcms_user_id=${userId}; ${cookieOpts}`;
  document.cookie = `dev_role=${role}; ${cookieOpts}`;
  document.cookie = `userId=${userId}; ${cookieOpts}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  // Sign In credentials
  const [email, setEmail] = useState<string>("rohan.student@hostel.edu");
  const [password, setPassword] = useState<string>("admin@hostel2026");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Registration credentials
  const [regName, setRegName] = useState<string>("");
  const [regRole, setRegRole] = useState<RoleType>("STUDENT");
  const [regRoomNumber, setRegRoomNumber] = useState<string>("B-402");
  const [regBlockAssigned, setRegBlockAssigned] = useState<string>("Block B");
  const [regTrade, setRegTrade] = useState<string>("ELECTRICAL");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transitionRole, setTransitionRole] = useState<RoleType>("STUDENT");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedDemo = DEMO_ACCOUNTS.find(
    (acc) =>
      acc.email.toLowerCase() === email.trim().toLowerCase() ||
      (acc.phone && acc.phone === email.trim())
  );

  const handleSelectDemo = (demo: QuickDemoAccount) => {
    setEmail(demo.email);
    setPassword("admin@hostel2026");
    setErrorMessage(null);
  };

  const handleSignIn = async (
    e?: React.FormEvent,
    directRole?: RoleType,
    directEmail?: string,
    directUserId?: string
  ) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const activeEmail = (directEmail || email).trim().toLowerCase();
    const demoMatch = DEMO_ACCOUNTS.find(
      (d) =>
        d.email.toLowerCase() === activeEmail ||
        (d.phone && d.phone.replace(/[^0-9]/g, "") === activeEmail.replace(/[^0-9]/g, ""))
    );

    // Determine target role estimation
    const isWardenEmail =
      activeEmail.includes("warden") ||
      activeEmail.includes("singh") ||
      activeEmail.includes("gupta") ||
      activeEmail.includes("rao");
    const isPhoneLogin =
      !activeEmail.includes("@") && /[0-9]{6,}/.test(activeEmail);
    const isWorkerEmail =
      activeEmail.includes("worker") ||
      activeEmail.includes("electrician") ||
      activeEmail.includes("plumber") ||
      activeEmail.includes("carpenter") ||
      activeEmail.includes("network") ||
      activeEmail.includes("tech") ||
      isPhoneLogin;
    const isCoordEmail =
      activeEmail.includes("admin") ||
      activeEmail.includes("ops") ||
      activeEmail.includes("coord") ||
      activeEmail.includes("mehta") ||
      activeEmail.includes("nambiar");

    const estimatedRole: RoleType = directRole
      ? directRole
      : demoMatch?.role
      ? demoMatch.role
      : isWardenEmail
      ? "WARDEN"
      : isWorkerEmail
      ? "WORKER"
      : isCoordEmail
      ? "COORDINATOR"
      : "STUDENT";

    setTransitionRole(estimatedRole);

    const defaultRedirect =
      estimatedRole === "STUDENT"
        ? "/student"
        : estimatedRole === "WORKER"
        ? "/worker"
        : estimatedRole === "COORDINATOR"
        ? "/coordinator"
        : "/warden";

    const effectiveUserId =
      directUserId || demoMatch?.id || `usr_${activeEmail.replace(/[^a-z0-9]/g, "")}`;

    // Immediate optimistic cookie stamping
    setClientCookies(estimatedRole, effectiveUserId);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const payload =
        authMode === "register"
          ? {
              email: regRole === "WORKER" && isPhoneLogin ? undefined : activeEmail,
              phone: isPhoneLogin ? activeEmail : undefined,
              identifier: activeEmail,
              name: regName.trim(),
              role: regRole,
              roomNumber: regRole === "STUDENT" ? regRoomNumber.trim() : undefined,
              blockAssigned:
                regRole === "STUDENT" || regRole === "WARDEN"
                  ? regBlockAssigned.trim()
                  : undefined,
              categoryExpertise: regRole === "WORKER" ? regTrade.trim() : undefined,
            }
          : {
              email: activeEmail,
              phone: isPhoneLogin ? activeEmail : demoMatch?.phone || undefined,
              identifier: activeEmail,
              role: estimatedRole,
              userId: effectiveUserId,
            };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      let targetUrl = defaultRedirect;
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.redirectUrl) {
          targetUrl = data.redirectUrl;
        }
        if (data?.user) {
          setClientCookies(data.user.role, data.user.id);
        }
      }

      router.push(targetUrl);
      router.refresh();
    } catch (err: unknown) {
      console.warn("Authentication warning:", err);
      router.push(defaultRedirect);
      router.refresh();
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  if (isLoading) {
    const isWarden = transitionRole === "WARDEN";
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#111726]/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">HCMS</span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase -mt-0.5">
                  Loading Dashboard...
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Authenticating Session</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isWarden ? <AgentLoading /> : <PortalLoading />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#111726]/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                HCMS
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase -mt-0.5">
                Hostel Operations Desk
              </span>
            </div>
          </div>

          {/* Quick Help, Theme Toggle & Status */}
          <div className="flex items-center gap-3 text-xs">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Facility Desk • Blocks A, B, C & D</span>
            </div>
            <a
              href="tel:+91800123456"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold transition shadow-2xs"
              title="24/7 Hostel Duty Office"
            >
              <PhoneCall className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Duty Help: +91 800-4267</span>
              <span className="sm:hidden">Helpdesk</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Human Context & Campus Facilities Showcase */}
          <div className="lg:col-span-6 space-y-6 lg:pr-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Campus Facility & Residence Portal</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Hostel maintenance, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  handled with care.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                The centralized portal for residents, hostel wardens, and maintenance crews. 
                Report room issues in 30 seconds, track electrician and plumber visits in real time, 
                and verify repairs with photo sign-offs.
              </p>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white dark:bg-[#111726]/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">2-Hr Emergency SLA</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Immediate dispatch for geyser leaks, water outages, and electrical hazards.
                </p>
              </div>

              <div className="bg-white dark:bg-[#111726]/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dedicated Technicians</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Assigned staff for electrical, plumbing, carpentry, and Wi-Fi networks.
                </p>
              </div>

              <div className="bg-white dark:bg-[#111726]/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Warden Oversight</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Transparent supervision and resolution sign-offs across all hostel blocks.
                </p>
              </div>
            </div>

            {/* Realistic Campus Live Activity Card */}
            <div className="bg-white dark:bg-[#111726]/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Resolved • Room B-312 Geyser Thermostat
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800 shrink-0">
                    Just now
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  Assigned to Suresh Verma (Plumbing) • Verified by Dr. Vikram Singh
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Polished, Human-Centered Auth Card */}
          <div className="lg:col-span-6 w-full max-w-xl mx-auto">
            <div className="bg-white dark:bg-[#111726] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 space-y-6 transition-colors">
              
              {/* Card Header & Tab Switcher */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {authMode === "signin" ? "Sign In to Portal" : "New Resident Registration"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {authMode === "signin"
                      ? "Enter your credentials or pick a demo campus profile below."
                      : "Register your hostel room and block to start lodging requests."}
                  </p>
                </div>

                {/* Segmented Mode Selector */}
                <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex gap-1 border border-slate-200/60 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                      authMode === "signin"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setErrorMessage(null);
                      if (!regName) setRegName("Devika Sen");
                      if (!email || email.includes("rohan") || email.includes("aarav") || email.includes("singh") || email.includes("electrician")) {
                        setEmail("devika.student@hostel.edu");
                      }
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                      authMode === "register"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Register New Resident
                  </button>
                </div>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={(e) => handleSignIn(e)} className="space-y-4">
                {/* Registration Fields */}
                {authMode === "register" && (
                  <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                    {/* Legal Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Full Legal Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required
                          placeholder="e.g. Devika Sen"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                        />
                      </div>
                    </div>

                    {/* Role Picker */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Account Role
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "STUDENT" as RoleType, label: "Student", icon: Building2 },
                          { id: "WARDEN" as RoleType, label: "Warden", icon: Shield },
                          { id: "WORKER" as RoleType, label: "Staff", icon: Wrench },
                        ].map((item) => {
                          const isSelected = regRole === item.id;
                          const ItemIcon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setRegRole(item.id)}
                              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                                  : "bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                              }`}
                            >
                              <ItemIcon className="w-3.5 h-3.5" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Student Room & Block */}
                    {regRole === "STUDENT" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            Room Number
                          </label>
                          <input
                            type="text"
                            value={regRoomNumber}
                            onChange={(e) => setRegRoomNumber(e.target.value)}
                            required
                            placeholder="e.g. B-402"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                            Hostel Block
                          </label>
                          <select
                            value={regBlockAssigned}
                            onChange={(e) => setRegBlockAssigned(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer"
                          >
                            <option value="Block A">Block A</option>
                            <option value="Block B">Block B</option>
                            <option value="Block C">Block C</option>
                            <option value="Block D">Block D</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Warden Block */}
                    {regRole === "WARDEN" && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Assigned Block Jurisdiction
                        </label>
                        <select
                          value={regBlockAssigned}
                          onChange={(e) => setRegBlockAssigned(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer"
                        >
                          <option value="Block A">Block A Administration</option>
                          <option value="Block B">Block B Administration</option>
                          <option value="Block C">Block C Administration</option>
                          <option value="Block D">Block D Administration</option>
                        </select>
                      </div>
                    )}

                    {/* Worker Specialization */}
                    {regRole === "WORKER" && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Trade Specialization
                        </label>
                        <select
                          value={regTrade}
                          onChange={(e) => setRegTrade(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer"
                        >
                          <option value="ELECTRICAL">Electrical & Lighting</option>
                          <option value="PLUMBING">Plumbing & Sanitation</option>
                          <option value="CARPENTRY">Carpentry & Furniture</option>
                          <option value="NETWORKING">Wi-Fi & Network Infrastructure</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Email or Staff Phone Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    {authMode === "register" && regRole === "WORKER"
                      ? "Staff Mobile Phone"
                      : "Institutional Email or Staff Mobile Phone"}
                  </label>
                  <div className="relative">
                    {regRole === "WORKER" || (!email.includes("@") && /[0-9]/.test(email)) ? (
                      <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={
                        authMode === "register" && regRole === "WORKER"
                          ? "+91 98111 22233"
                          : "student@hostel.edu or +91 98111 22233"
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Default: <code className="text-slate-600 dark:text-slate-300 font-mono">admin@hostel2026</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Help */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Keep me signed in</span>
                  </label>
                  <span
                    onClick={() => {
                      alert("Demo accounts use default password: admin@hostel2026. For forgotten keys, contact your Block Warden.");
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                  >
                    Need password help?
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 transition duration-150 cursor-pointer disabled:opacity-60 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {authMode === "signin"
                          ? selectedDemo
                            ? `Sign In as ${selectedDemo.name}`
                            : "Sign In to Portal"
                          : "Complete Resident Registration"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Select Campus Profiles - Refined Humanized List */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Quick Demo Profiles
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    1-click instant login
                  </span>
                </div>

                <div className="space-y-2">
                  {DEMO_ACCOUNTS.map((demo) => {
                    const isCurrent =
                      email.trim().toLowerCase() === demo.email.toLowerCase() ||
                      (demo.phone && email.trim() === demo.phone);

                    return (
                      <div
                        key={demo.email}
                        onClick={() => handleSelectDemo(demo)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isCurrent
                            ? "bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/10 shadow-2xs"
                            : "bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full bg-gradient-to-tr ${demo.avatarGrad} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            {demo.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
                              {demo.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate -mt-0.5">
                              {demo.subtext}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${demo.badgeClass}`}
                          >
                            {demo.roleBadge}
                          </span>
                          {isCurrent ? (
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSignIn(undefined, demo.role, demo.email, demo.id);
                              }}
                              className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-1.5 py-0.5 rounded hover:bg-white dark:hover:bg-slate-700 transition"
                              title={`Instant entrance as ${demo.name}`}
                            >
                              Fast Enter →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer - Clean, Institutional & Cohesive */}
      <footer className="w-full border-t border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-[#111726]/60 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">HCMS</span>
            <span>•</span>
            <span>Campus Hostel Complaint & Maintenance Operations</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Block A • Block B • Block C • Block D</span>
            <span>•</span>
            <span>24/7 Facility Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}