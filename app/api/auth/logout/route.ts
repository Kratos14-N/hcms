import { NextResponse } from "next/server";

export const instant = false;


export async function POST() {
  const response = NextResponse.json({
    success: true,
    redirectUrl: "/login",
  });

  const clearOptions = {
    path: "/",
    maxAge: 0,
    sameSite: "lax" as const,
  };

  response.cookies.set("hcms_role", "", clearOptions);
  response.cookies.set("hcms_user_id", "", clearOptions);
  response.cookies.set("dev_role", "", clearOptions);
  response.cookies.set("userId", "", clearOptions);
  response.cookies.set("session", "", clearOptions);
  response.cookies.set("next-auth.session-token", "", clearOptions);

  return response;
}

export async function GET(request: Request) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);

  const clearOptions = {
    path: "/",
    maxAge: 0,
    sameSite: "lax" as const,
  };

  response.cookies.set("hcms_role", "", clearOptions);
  response.cookies.set("hcms_user_id", "", clearOptions);
  response.cookies.set("dev_role", "", clearOptions);
  response.cookies.set("userId", "", clearOptions);
  response.cookies.set("session", "", clearOptions);
  response.cookies.set("next-auth.session-token", "", clearOptions);

  return response;
}
