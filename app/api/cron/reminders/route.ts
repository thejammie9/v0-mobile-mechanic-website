import { NextRequest, NextResponse } from "next/server"
import { getBookingsForReminder, markBookingReminderSent } from "@/lib/db"
import { sendAppointmentReminderEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret")
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const bookings = getBookingsForReminder()
  let sent = 0
  const errors: string[] = []

  for (const booking of bookings) {
    if (!booking.confirmed_date || !booking.confirmed_time) continue
    try {
      await sendAppointmentReminderEmail({
        name: booking.name,
        email: booking.email,
        confirmed_date: booking.confirmed_date,
        confirmed_time: booking.confirmed_time,
        vehicle: booking.vehicle,
        issue: booking.issue,
        address: booking.address,
      })
      markBookingReminderSent(booking.id)
      sent++
    } catch (err) {
      errors.push(`Booking ${booking.id}: ${String(err)}`)
      console.error(`Reminder failed for booking ${booking.id}:`, err)
    }
  }

  return NextResponse.json({ success: true, sent, total: bookings.length, errors })
}
