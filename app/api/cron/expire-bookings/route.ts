import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { sendAutoExpiredEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const provided = req.nextUrl.searchParams.get("secret")
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const db = getDb()

  // Find pending, unconfirmed slot bookings created more than 30 minutes ago
  // Excludes callback requests (they don't hold a slot)
  const expired = db.prepare(`
    SELECT id, name, email, vehicle, preferred_date, preferred_time
    FROM bookings
    WHERE status = 'pending'
      AND customer_confirmed = 0
      AND preferred_date IS NOT NULL
      AND preferred_time IS NOT NULL
      AND issue NOT LIKE '[CALLBACK REQUESTED]%'
      AND issue NOT LIKE '[QUOTE REQUESTED]%'
      AND created_at <= datetime('now', '-30 minutes')
  `).all() as { id: number; name: string; email: string; vehicle: string; preferred_date: string; preferred_time: string }[]

  if (expired.length === 0) {
    return NextResponse.json({ cancelled: 0 })
  }

  const cancel = db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?")

  for (const booking of expired) {
    cancel.run(booking.id)
    console.log(`Auto-cancelled expired booking #${booking.id} (${booking.name} — ${booking.preferred_date} ${booking.preferred_time})`)
    // Notify customer their slot was released
    sendAutoExpiredEmail({
      name: booking.name,
      email: booking.email,
      vehicle: booking.vehicle,
      preferred_date: booking.preferred_date,
      preferred_time: booking.preferred_time,
    }).catch(err => console.error(`Failed to send auto-expired email for booking #${booking.id}:`, err))
  }

  return NextResponse.json({ cancelled: expired.length })
}
