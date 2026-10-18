import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Canonical Roles matching Prisma schema
export type Role = "STUDENT" | "WORKER" | "WARDEN" | "COORDINATOR";

const ROLE_HOMES: Record<Role, string> = {
  STUDENT: "/student",
  WORKER: "/worker",
  WARDEN: "/warden",
  COORDINATOR: "/coordinator",
};

const VALID_ROLES: Role[] = ["STUDENT", "WORKER", "WARDEN", "COORDINATOR"];

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Bypass public assets, static files, and authentication endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/cron") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Read session cookies
  const roleCookie = (
    request.cookies.get("hcms_role")?.value ||
    request.cookies.get("dev_role")?.value
  )?.toUpperCase() as Role | undefined;

  const userIdCookie =
    request.cookies.get("hcms_user_id")?.value ||
    request.cookies.get("userId")?.value;

  const isAuthenticated = Boolean(
    userIdCookie && roleCookie && VALID_ROLES.includes(roleCookie)
  );

  // 3. Handle Root Route ("/")
  if (pathname === "/") {
    if (!isAuthenticated) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
    }
    return applySecurityHeaders(NextResponse.redirect(new URL(ROLE_HOMES[roleCookie!], request.url)));
  }

  // 4. Handle "/login" access for already-authenticated users
  if (pathname === "/login") {
    if (isAuthenticated) {
      return applySecurityHeaders(NextResponse.redirect(new URL(ROLE_HOMES[roleCookie!], request.url)));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // 5. Block Unauthenticated Requests to Protected Routes
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Sanitize destination path to prevent open redirect vulnerabilities
    if (pathname.startsWith("/") && !pathname.startsWith("//")) {
      loginUrl.searchParams.set("from", pathname);
    }
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  const role = roleCookie!;

  // 6. Seamless Legacy Route Aliases & Redirects (/portal -> /student, /agent -> /warden or /coordinator)
  if (pathname.startsWith("/portal")) {
    const newPath = pathname.replace(/^\/portal/, "/student");
    return applySecurityHeaders(NextResponse.redirect(new URL(`${newPath}${search}`, request.url)));
  }

  if (pathname.startsWith("/agent/worker")) {
    return applySecurityHeaders(NextResponse.redirect(new URL(`/worker${search}`, request.url)));
  }

  if (pathname.startsWith("/agent")) {
    const baseTarget = role === "COORDINATOR" ? "/coordinator" : "/warden";
    const newPath = pathname.replace(/^\/agent/, baseTarget);
    return applySecurityHeaders(NextResponse.redirect(new URL(`${newPath}${search}`, request.url)));
  }

  // 7. Role-Based Access Control (RBAC) Boundary Enforcements

  // Boundary A: Student Dashboard (/student/*)
  if (pathname.startsWith("/student")) {
    if (role !== "STUDENT") {
      return applySecurityHeaders(NextResponse.redirect(new URL(ROLE_HOMES[role], request.url)));
    }
  }

  // Boundary B: Field Technician / Worker Dashboard (/worker/*)
  else if (pathname.startsWith("/worker")) {
    if (role !== "WORKER") {
      return applySecurityHeaders(NextResponse.redirect(new URL(ROLE_HOMES[role], request.url)));
    }
  }

  // Boundary C: Warden Dashboard (/warden/*)
  else if (pathname.startsWith("/warden")) {
    if (role !== "WARDEN" && role !== "COORDINATOR") {
      return applySecurityHeaders(NextResponse.redirect(new URL(ROLE_HOMES[role], request.url)));
    }
  }

  // Boundary D: Coordinator Dashboard (/coordinator/*)
  else if (pathname.startsWith("/coordinator")) {
    if (role !== "COORDINATOR") {
      return applySecurityHeaders(NextResponse.redirect(new URL(ROLE_HOMES[role], request.url)));
    }
  }

  // 8. Inject Security Headers on regular responses
  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/student/:path*",
    "/worker/:path*",
    "/warden/:path*",
    "/coordinator/:path*",
    "/portal/:path*",
    "/agent/:path*",
  ],
};
