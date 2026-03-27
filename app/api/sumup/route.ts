import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/app/admin/actions"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const authed = await isAdminAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const apiKey = process.env.SUMUP_API_KEY
  if (!apiKey) return NextResponse.json({ error: "SUMUP_API_KEY not configured" }, { status: 503 })

  const limit = req.nextUrl.searchParams.get("limit") || "20"

  try {
    const res = await fetch(
      `https://api.sumup.com/v0.1/me/transactions/history?limit=${limit}&order=descending`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    )

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: "SumUp API error", detail: text }, { status: res.status })
    }

    const data = await res.json()

    // Normalise to just what we need
    const transactions = (data.items ?? [])
      .filter((t: any) => t.status === "SUCCESSFUL")
      .map((t: any) => ({
        id: t.id,
        transaction_code: t.transaction_code,
        amount: t.amount,
        currency: t.currency ?? "GBP",
        timestamp: t.timestamp,
        card_last4: t.card?.last_4_digits ?? null,
        card_type: t.card?.type ?? null,
        product_summary: t.product_summary ?? null,
      }))

    return NextResponse.json({ transactions })
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 500 })
  }
}
