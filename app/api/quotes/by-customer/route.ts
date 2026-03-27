import { NextRequest, NextResponse } from "next/server"
import { getQuotesByCustomerEmail } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || ""
  if (!email) return NextResponse.json([])
  const quotes = getQuotesByCustomerEmail(email)
  return NextResponse.json(quotes)
}
