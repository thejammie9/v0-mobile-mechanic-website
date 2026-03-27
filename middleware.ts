import { type NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter for the login page
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS  = 10
const WINDOW_MS     = 15 * 60 * 1000 // 15 minutes

function isRateLimited(ip: string): boolean {
  const now   = Date.now()
  const entry = loginAttempts.get(ip)

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  entry.count++
  if (entry.count > MAX_ATTEMPTS) return true
  return false
}

// Routes that require admin role (not just any authenticated user)
// Note: HMAC verification happens in server actions (requireAdmin). The middleware
// just does a fast role-based redirect for UX — not the primary security layer.
const ADMIN_ONLY_PREFIXES = [
  '/admin/settings',
  '/admin/users',
  '/admin/finance',
  '/admin/invoices',
  '/admin/quotes',
  '/admin/reports',
  '/admin/expenses',
  '/admin/mileage',
  '/admin/availability',
  '/admin/analytics',
  '/admin/seo',
  '/admin/emails',
  '/admin/blog',
  '/admin/pricing',
  '/admin/portfolio',
]

// Extract role from v2 session token without HMAC verification.
// Token format: {userId}:{role}:{expiresAt}:{hmac}
// Full HMAC verification runs in the Node.js server-action layer (requireAdmin).
function getRoleFromCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null
  try {
    const parts = cookieValue.split(':')
    // v2 token has at least 4 parts; v1 (legacy) has exactly 2 — reject v1
    if (parts.length < 4) return null
    const role      = parts[1]
    const expiresAt = parseInt(parts[2], 10)
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null
    return role
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Rate-limit POST to admin login
  if (pathname === '/admin/login' && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
              || request.headers.get('x-real-ip')
              || 'unknown'

    if (isRateLimited(ip)) {
      return new NextResponse('Too many login attempts. Please try again in 15 minutes.', {
        status: 429,
        headers: { 'Retry-After': '900', 'Content-Type': 'text/plain' },
      })
    }
  }

  // Block direct access to the database directory
  if (pathname.startsWith('/data/')) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Enforce admin-only routes: redirect staff users to dashboard
  if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
    const cookie = request.cookies.get('admin_session')?.value
    const role   = getRoleFromCookie(cookie)
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)',
  ],
}
