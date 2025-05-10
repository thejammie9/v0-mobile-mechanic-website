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

  // Check if logged in - use getAll() and find instead of has()
  const cookies = request.cookies.getAll()
  const isLoggedIn = cookies.some((cookie) => cookie.name === "admin_logged_in")

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  // User is logged in, allow access
  return NextResponse.next()
}

// Configure the middleware to run only on admin paths
export const config = {
  matcher: ["/admin/:path*"],
}
