import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/app/admin/actions"

export async function POST(req: NextRequest) {
  const authed = await isAdminAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const apiKey = process.env.SUMUP_API_KEY
  if (!apiKey) return NextResponse.json({ error: "SumUp not configured" }, { status: 500 })

  const { name, phone: _phone, amount, description } = await req.json()
  if (!name || !amount || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Get merchant code
    const meRes = await fetch("https://api.sumup.com/v0.1/me", {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!meRes.ok) return NextResponse.json({ error: "Failed to reach SumUp" }, { status: 502 })
    const me = await meRes.json()
    const merchantCode: string = me.merchant_profile?.merchant_code
    if (!merchantCode) return NextResponse.json({ error: "SumUp merchant_code not found" }, { status: 502 })

    const ref = `DEP-${Date.now()}`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jamiesautocare.com"

    const checkoutRes = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        checkout_reference: ref,
        amount: Math.round(amount * 100) / 100,
        currency: "GBP",
        description: `${description} — ${name}`,
        merchant_code: merchantCode,
        redirect_url: `${siteUrl}/payment-thanks`,
      }),
    })

    if (!checkoutRes.ok) {
      const text = await checkoutRes.text()
      return NextResponse.json({ error: `SumUp error: ${text}` }, { status: 502 })
    }

    const data = await checkoutRes.json()
    const paymentLink = `${siteUrl}/pay/${data.id}`

    return NextResponse.json({ paymentLink, checkoutId: data.id })
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 500 })
  }
}
