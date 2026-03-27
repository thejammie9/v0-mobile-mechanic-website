// Next.js instrumentation — runs once on server startup (nodejs runtime only).
// Registers all in-process cron jobs so they travel with the codebase
// and require no server-level crontab configuration.

export async function register() {
  // Only run in the Node.js runtime (not edge), and not during build
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const cron = await import("node-cron")

  // ── Every 15 minutes: auto-cancel unconfirmed slot bookings ─────────────────
  cron.schedule("*/15 * * * *", async () => {
    try {
      const { getDb } = await import("@/lib/db")
      const { sendAutoExpiredEmail } = await import("@/lib/email")

      const db = getDb()
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
      `).all() as {
        id: number
        name: string
        email: string
        vehicle: string
        preferred_date: string
        preferred_time: string
      }[]

      if (expired.length === 0) return

      const cancel = db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?")
      for (const booking of expired) {
        cancel.run(booking.id)
        console.log(`[cron] Auto-cancelled booking #${booking.id} (${booking.name} — ${booking.preferred_date} ${booking.preferred_time})`)
        sendAutoExpiredEmail({
          name: booking.name,
          email: booking.email,
          vehicle: booking.vehicle,
          preferred_date: booking.preferred_date,
          preferred_time: booking.preferred_time,
        }).catch(err => console.error(`[cron] Auto-expired email failed for #${booking.id}:`, err))
      }
    } catch (err) {
      console.error("[cron] expire-bookings error:", err)
    }
  })

  // ── Daily at 09:00: service reminders + next-day appointment reminders ───────
  cron.schedule("0 9 * * *", async () => {
    try {
      const {
        getCustomersDueReminder,
        markReminderSent,
        getCustomerVehicles,
        getBookingsDueReminder,
      } = await import("@/lib/db")
      const { sendServiceReminderEmail, sendAppointmentReminderEmail } = await import("@/lib/email")

      // Annual service reminders
      const customers = getCustomersDueReminder()
      for (const customer of customers) {
        const vehicles = getCustomerVehicles(customer.id)
        const vehicle  = vehicles[vehicles.length - 1]?.make_model ?? null
        const sent = await sendServiceReminderEmail({ name: customer.name, email: customer.email, vehicle })
        if (sent) markReminderSent(customer.id)
      }
      console.log(`[cron] service-reminders: ${customers.length} processed`)

      // Next-day appointment reminders
      const bookings = getBookingsDueReminder()
      for (const booking of bookings) {
        await sendAppointmentReminderEmail({
          name:           booking.name,
          email:          booking.email,
          confirmed_date: booking.confirmed_date!,
          confirmed_time: booking.confirmed_time,
          vehicle:        booking.vehicle,
          issue:          booking.issue,
          address:        booking.address,
        })
      }
      console.log(`[cron] appointment-reminders: ${bookings.length} processed`)
    } catch (err) {
      console.error("[cron] service-reminders error:", err)
    }
  })

  // ── Daily at 00:05: apply recurring expenses ─────────────────────────────────
  cron.schedule("5 0 * * *", async () => {
    try {
      const { applyRecurringExpenses } = await import("@/lib/db")
      const today   = new Date().toISOString().slice(0, 10)
      const created = applyRecurringExpenses(today)
      console.log(`[cron] recurring-expenses: ${created.length} expense(s) added for ${today}`)
    } catch (err) {
      console.error("[cron] recurring-expenses error:", err)
    }
  })

  console.log("[instrumentation] In-process cron jobs registered")
}
