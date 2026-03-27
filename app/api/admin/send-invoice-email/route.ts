import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { sendInvoiceEmail } from "@/app/actions/invoices"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { invoiceId } = await req.json()
    if (!invoiceId || typeof invoiceId !== "number") {
      return NextResponse.json({ error: "Invalid invoiceId" }, { status: 400 })
    }

    const result = await sendInvoiceEmail(invoiceId)
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
