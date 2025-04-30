import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if the request is for the admin area
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Skip authentication for the login page
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next()
    }

    // Check if the user is authenticated
    const authToken = request.cookies.get("admin_auth")?.value

    // If not authenticated, redirect to login
    if (!authToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Simple token validation (in production, use a proper JWT validation)
    const expectedToken = process.env.ADMIN_AUTH_TOKEN

    if (authToken !== expectedToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
