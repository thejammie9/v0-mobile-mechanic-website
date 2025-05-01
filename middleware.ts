import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define paths that require authentication
const PROTECTED_PATHS = ["/admin/bookings", "/admin/settings"]

// Define paths that are excluded from authentication
const PUBLIC_PATHS = ["/admin/login"]

// Default auth token for testing - REMOVE BEFORE PRODUCTION
const DEFAULT_AUTH_TOKEN = "testing_token_123456789"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  // If it's not a protected path, allow the request
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // If it's a public path within the admin section, allow the request
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check for the auth cookie
  const authCookie = request.cookies.get("admin_auth")?.value

  // If there's no auth cookie, redirect to login
  if (!authCookie) {
    const url = new URL("/admin/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // Verify the auth cookie (accept both the environment variable token and the default token)
  const validToken = process.env.ADMIN_AUTH_TOKEN || "default_token"
  const isValidToken = authCookie === validToken || authCookie === DEFAULT_AUTH_TOKEN

  // If the token is invalid, redirect to login
  if (!isValidToken) {
    const url = new URL("/admin/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // Allow the request
  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ["/admin/:path*"],
}
