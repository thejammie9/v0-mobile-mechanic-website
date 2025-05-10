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
  const cookieHeader = request.headers.get("cookie") || ""
  console.log(`[Middleware] Cookie header: ${cookieHeader}`)

  const hasAdminCookie = cookieHeader.includes("admin_logged_in=true")
  console.log(`[Middleware] Has admin cookie: ${hasAdminCookie}`)

  // If not logged in, redirect to login
  if (!hasAdminCookie) {
    console.log(`[Middleware] No admin cookie found, redirecting to login`)
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  // User is logged in, allow access
  console.log(`[Middleware] Admin cookie found, allowing access`)
  return NextResponse.next()
}

// Configure the middleware to run only on admin paths
export const config = {
  matcher: ["/admin/:path*"],
}
