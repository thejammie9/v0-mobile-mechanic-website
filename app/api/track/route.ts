import { NextRequest, NextResponse } from "next/server"
import { recordPageView } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json()
    if (!path || typeof path !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Don't track admin pages
    if (path.startsWith("/admin")) {
      return NextResponse.json({ ok: true })
    }

    const referrer = req.headers.get("referer") || null
    const userAgent = req.headers.get("user-agent") || null
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || null

    const cleanPath = path.slice(0, 200)

    recordPageView(cleanPath, referrer, userAgent, ip)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
