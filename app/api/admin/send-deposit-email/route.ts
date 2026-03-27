import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { sendAdHocDepositEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  const authed = await isAdminAuthenticated()
  if (!authed) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { name, email, amount, description, paymentLink } = await req.json()
  if (!name || !email || !amount || !description || !paymentLink) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const result = await sendAdHocDepositEmail({ name, email, amount, description, paymentLink })
  if (!result.success) {
    return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
