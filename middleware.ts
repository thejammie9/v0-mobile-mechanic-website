import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply to admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  // Allow access to login page
  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  // Check for the cookie directly from the request headers
  // This avoids using the cookies() API that requires await
  const cookieHeader = request.headers.get("cookie") || ""
  const hasAdminCookie = cookieHeader.includes("admin_logged_in=true")

  // If not logged in, redirect to login
  if (!hasAdminCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  // User is logged in, allow access
  return NextResponse.next()
}

// Configure the middleware to run only on admin paths
export const config = {
  matcher: ["/admin/:path*"],
}
