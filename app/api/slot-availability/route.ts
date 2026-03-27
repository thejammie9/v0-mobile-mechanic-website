import { NextRequest, NextResponse } from "next/server"
import { getSlotBookingCounts, getBookingAvailability } from "@/lib/db"

export const dynamic = "force-dynamic"

const MAX_PER_SLOT = 1

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date")
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 })

  const config = getBookingAvailability()

  // Bookings turned off entirely
  if (!config.enabled) {
    return NextResponse.json({ availability: [], disabled: true })
  }

  // Check if the requested date's day-of-week is available
  const dayOfWeek = new Date(date + "T12:00:00").getDay() // 0=Sun ... 6=Sat
  if (!config.available_days.includes(dayOfWeek)) {
    return NextResponse.json({ availability: [], dayUnavailable: true })
  }

  // Check blackout dates
  if (config.closed_dates.includes(date)) {
    return NextResponse.json({ availability: [], dayUnavailable: true })
  }

  // Use day-specific slot override if one exists, otherwise use default slots
  const slotsForDay = config.day_slots?.[String(dayOfWeek)] ?? config.slots

  const counts = getSlotBookingCounts(date)

  const availability = slotsForDay.map(slot => ({
    time: slot,
    available: (counts[slot] || 0) < MAX_PER_SLOT,
    count: counts[slot] || 0,
  }))

  return NextResponse.json({ availability })
}
