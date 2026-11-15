import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("crm_access_token")?.value;
  const userCookie = request.cookies.get("crm_user_profile")?.value;
  const pathname = request.nextUrl.pathname;

  // Public paths that do not require authentication
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    if (pathname.startsWith("/login") && token) {
      // Check user role to redirect appropriately
      if (userCookie) {
        try {
          const user = JSON.parse(userCookie);
          if (user.role === "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/super-admin/organizations", request.url));
          }
        } catch {
          // ignore
        }
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // If no auth token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route guard for /super-admin
  if (pathname.startsWith("/super-admin")) {
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        if (user.role !== "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  // Guard for tenant-only routes when Super Admin navigates
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/leads") ||
    pathname.startsWith("/deals") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/team")
  ) {
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        if (user.role === "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/super-admin/organizations", request.url));
        }
      } catch {
        // ignore
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
