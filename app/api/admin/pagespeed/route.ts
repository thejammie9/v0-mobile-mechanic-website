import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/app/admin/actions"

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const url = req.nextUrl.searchParams.get("url")
  const strategy = req.nextUrl.searchParams.get("strategy") || "mobile"

  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 })

  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=seo`
    const res = await fetch(apiUrl, { next: { revalidate: 0 } })
    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err?.error?.message || "PageSpeed API error" }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Failed to reach PageSpeed API" }, { status: 500 })
  }
}
