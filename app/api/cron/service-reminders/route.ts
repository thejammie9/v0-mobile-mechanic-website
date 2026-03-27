import { NextRequest, NextResponse } from "next/server"
import { getCustomersDueReminder, markReminderSent, getCustomerVehicles, getBookingsDueReminder } from "@/lib/db"
import { sendServiceReminderEmail, sendAppointmentReminderEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // Require a secret token to prevent unauthorised triggering
  const secret = process.env.CRON_SECRET
  const provided = req.nextUrl.searchParams.get("secret")

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const customers = getCustomersDueReminder()
  const results: { name: string; email: string; sent: boolean }[] = []

  for (const customer of customers) {
    // Get their most recent vehicle for the email
    const vehicles = getCustomerVehicles(customer.id)
    const vehicle  = vehicles[vehicles.length - 1]?.make_model ?? null

    const sent = await sendServiceReminderEmail({
      name:    customer.name,
      email:   customer.email,
      vehicle,
    })

    if (sent) {
      markReminderSent(customer.id)
    }

    results.push({ name: customer.name, email: customer.email, sent })
  }

  // Step 2: Send appointment reminders for tomorrow's bookings
  const bookingsDueReminder = getBookingsDueReminder()
  const reminderResults: { name: string; email: string; sent: boolean }[] = []

  for (const booking of bookingsDueReminder) {
    const sent = await sendAppointmentReminderEmail({
      name: booking.name,
      email: booking.email,
      confirmed_date: booking.confirmed_date!,
      confirmed_time: booking.confirmed_time,
      vehicle: booking.vehicle,
      issue: booking.issue,
      address: booking.address,
    })
    reminderResults.push({ name: booking.name, email: booking.email, sent })
  }

  console.log(`Service reminders cron: ${results.length} service reminder(s), ${reminderResults.length} appointment reminder(s)`)
  return NextResponse.json({
    service_reminders: { processed: results.length, results },
    appointment_reminders: { processed: reminderResults.length, results: reminderResults },
    timestamp: new Date().toISOString(),
  })
}
