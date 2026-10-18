"use client";

import React, { useState } from "react";
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
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type RoleType = "STUDENT" | "WARDEN" | "WORKER" | "COORDINATOR";

interface QuickDemoAccount {
  name: string;
  subtext: string;
  roleBadge: string;
  badgeClass: string;
  avatarGrad: string;
  email: string;
  role: RoleType;
}

const DEMO_ACCOUNTS: QuickDemoAccount[] = [
  {
    name: "Aarav Sharma",
    subtext: "Room A-204 • Block A",
    roleBadge: "Resident Student",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    avatarGrad: "from-blue-600 to-indigo-600",
    email: "aarav.student@hostel.edu",
    role: "STUDENT",
  },
  {
    name: "Rohan Patel",
    subtext: "Room B-312 • Block B",
    roleBadge: "Resident Student",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    avatarGrad: "from-blue-600 to-indigo-600",
    email: "rohan.student@hostel.edu",
    role: "STUDENT",
  },
  {
    name: "Dr. Vikram Singh",
    subtext: "Block A Administration",
    roleBadge: "Hostel Warden",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    avatarGrad: "from-indigo-600 to-violet-600",
    email: "warden.singh@hostel.edu",
    role: "WARDEN",
  },
  {
    name: "Ramesh Kumar",
    subtext: "+91 98111 22233 • Electrical",
    roleBadge: "Field Technician",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    avatarGrad: "from-amber-500 to-orange-600",
    email: "+91 98111 22233",
    role: "WORKER",
  },
  {
    name: "Pooja Mehta",
    subtext: "Campus Operations Desk",
    roleBadge: "Coordinator Admin",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedDemo = DEMO_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
  );

  const handleSelectDemo = (demo: QuickDemoAccount) => {
    setEmail(demo.email);
    setPassword("admin@hostel2026");
    setErrorMessage(null);
  };

  const handleSignIn = async (
    e?: React.FormEvent,
    directRole?: RoleType,
    directEmail?: string
  ) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const activeEmail = (directEmail || email).trim().toLowerCase();

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
      : isWardenEmail
      ? "WARDEN"
      : isWorkerEmail
      ? "WORKER"
      : isCoordEmail
      ? "COORDINATOR"
      : "STUDENT";

    const defaultRedirect =
      estimatedRole === "STUDENT"
        ? "/student"
        : estimatedRole === "WORKER"
        ? "/worker"
        : estimatedRole === "COORDINATOR"
        ? "/coordinator"
        : "/warden";

    // Immediate optimistic cookie stamping
    setClientCookies(estimatedRole, `usr_${activeEmail.replace(/[^a-z0-9]/g, "")}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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
              phone: isPhoneLogin ? activeEmail : undefined,
              identifier: activeEmail,
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

      window.location.assign(targetUrl);
    } catch (err: unknown) {
      console.warn("Authentication warning:", err);
      window.location.assign(defaultRedirect);
    } finally {
      setTimeout(() => setIsLoading(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header - Matches the actual dashboard layout */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-slate-900">
                HCMS
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-0.5">
                Hostel Operations Desk
              </span>
            </div>
          </div>

          {/* Quick Help, Theme Toggle & Status */}
          <div className="flex items-center gap-3 text-xs">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Facility Desk • Blocks A, B, C & D</span>
            </div>
            <a
              href="tel:+91800123456"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 font-semibold transition shadow-2xs"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Campus Facility & Residence Portal</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Hostel maintenance, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent">
                  handled with care.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                The centralized portal for residents, hostel wardens, and maintenance crews. 
                Report room issues in 30 seconds, track electrician and plumber visits in real time, 
                and verify repairs with photo sign-offs.
              </p>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4 text-rose-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">2-Hr Emergency SLA</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Immediate dispatch for geyser leaks, water outages, and electrical hazards.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4 text-amber-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Dedicated Technicians</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Assigned staff for electrical, plumbing, carpentry, and Wi-Fi networks.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Warden Oversight</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Transparent supervision and resolution sign-offs across all hostel blocks.
                </p>
              </div>
            </div>

            {/* Realistic Campus Live Activity Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    Resolved • Room B-312 Geyser Thermostat
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                    Just now
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Assigned to Suresh Verma (Plumbing) • Verified by Dr. Vikram Singh
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Polished, Human-Centered Auth Card */}
          <div className="lg:col-span-6 w-full max-w-xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm shadow-slate-200/50 p-6 sm:p-8 space-y-6">
              
              {/* Card Header & Tab Switcher */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {authMode === "signin" ? "Sign In to Portal" : "New Resident Registration"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {authMode === "signin"
                      ? "Enter your credentials or pick a demo campus profile below."
                      : "Register your hostel room and block to start lodging requests."}
                  </p>
                </div>

                {/* Segmented Mode Selector */}
                <div className="p-1 bg-slate-100 rounded-2xl flex gap-1 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                      authMode === "signin"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
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
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Register New Resident
                  </button>
                </div>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5">
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
                      <label className="block text-xs font-bold text-slate-700">
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
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                        />
                      </div>
                    </div>

                    {/* Role Picker */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
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
                                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs"
                                  : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100"
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
                          <label className="block text-xs font-bold text-slate-700">
                            Room Number
                          </label>
                          <input
                            type="text"
                            value={regRoomNumber}
                            onChange={(e) => setRegRoomNumber(e.target.value)}
                            required
                            placeholder="e.g. B-402"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            Hostel Block
                          </label>
                          <select
                            value={regBlockAssigned}
                            onChange={(e) => setRegBlockAssigned(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer"
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
                        <label className="block text-xs font-bold text-slate-700">
                          Assigned Block Jurisdiction
                        </label>
                        <select
                          value={regBlockAssigned}
                          onChange={(e) => setRegBlockAssigned(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer"
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
                        <label className="block text-xs font-bold text-slate-700">
                          Trade Specialization
                        </label>
                        <select
                          value={regTrade}
                          onChange={(e) => setRegTrade(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer"
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
                    <label className="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Default: <code className="text-slate-600 font-mono">admin@hostel2026</code>
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition p-1"
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
                    <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
                  </label>
                  <span
                    onClick={() => {
                      alert("Demo accounts use default password: admin@hostel2026. For forgotten keys, contact your Block Warden.");
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer font-medium"
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
              <div className="pt-4 border-t border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Quick Demo Profiles
                  </span>
                  <span className="text-[11px] text-slate-500">
                    1-click autofill by role
                  </span>
                </div>

                <div className="space-y-2">
                  {DEMO_ACCOUNTS.map((demo) => {
                    const isCurrent =
                      email.trim().toLowerCase() === demo.email.toLowerCase();

                    return (
                      <div
                        key={demo.email}
                        onClick={() => handleSelectDemo(demo)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isCurrent
                            ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/10 shadow-2xs"
                            : "bg-slate-50/60 hover:bg-slate-100/80 border-slate-200"
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
                            <span className="text-xs font-bold text-slate-800 block truncate">
                              {demo.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium block truncate -mt-0.5">
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
                                handleSignIn(undefined, demo.role, demo.email);
                              }}
                              className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-white transition"
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
      <footer className="w-full border-t border-slate-200/70 bg-white/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">HCMS</span>
            <span>•</span>
            <span>Campus Hostel Complaint & Maintenance Operations</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>Block A • Block B • Block C • Block D</span>
            <span>•</span>
            <span>24/7 Facility Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}