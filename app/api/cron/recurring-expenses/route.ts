import { NextRequest, NextResponse } from "next/server"
import { applyRecurringExpenses } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const provided = req.nextUrl.searchParams.get("secret")

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const created = applyRecurringExpenses(today)

  return NextResponse.json({ date: today, created: created.length, expenses: created })
}
