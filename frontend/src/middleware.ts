import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/candidate", "/employer", "/admin"];
const AUTH_ONLY = ["/login", "/register", "/forgot-password", "/verify-email", "/reset-password"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Use presence of refreshToken cookie as auth indicator
  const hasSession = req.cookies.has("refreshToken");

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
