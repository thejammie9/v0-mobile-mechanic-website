import { NextResponse } from "next/server"
import { getBookingAvailability, getSiteSetting } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const config = getBookingAvailability()
  const advanceDays = parseInt(getSiteSetting("booking_advance_days") || "1", 10) || 1
  return NextResponse.json({
    available_days: config.available_days,
    closed_dates: config.closed_dates,
    advance_days: advanceDays,
    enabled: config.enabled,
    day_slots: config.day_slots,
  })
}
