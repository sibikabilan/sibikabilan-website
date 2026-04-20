import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Skip the login page itself
    if (request.nextUrl.pathname === "/admin") {
      return NextResponse.next();
    }

    const token = request.cookies.get("admin_token")?.value;
    if (token !== "authenticated") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
