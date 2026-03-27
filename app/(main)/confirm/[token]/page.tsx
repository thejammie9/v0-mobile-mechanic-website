import { notFound } from "next/navigation"
import { getBookingByConfirmToken, confirmBookingByToken, updateBookingDateTime } from "@/lib/db"
import { sendAppointmentConfirmation } from "@/lib/email"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const booking = getBookingByConfirmToken(token)

  if (!booking) notFound()

  const result = confirmBookingByToken(token)
  const alreadyDone = result.alreadyConfirmed
  const cancelled = booking.status === "cancelled"

  // First time confirming — set the confirmed date/time and send the appointment confirmed email
  if (!alreadyDone && !cancelled && booking.preferred_date && booking.preferred_time) {
    const cancel_token = updateBookingDateTime(booking.id, booking.preferred_date, booking.preferred_time)
    sendAppointmentConfirmation({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      vehicle: booking.vehicle,
      vehicle_reg: booking.vehicle_reg,
      issue: booking.issue,
      confirmed_date: booking.preferred_date,
      confirmed_time: booking.preferred_time,
      cancel_token,
    }).catch(err => console.error("Failed to send appointment confirmation:", err))
  }

  const date = booking.confirmed_date || booking.preferred_date
  const time = booking.confirmed_time || booking.preferred_time

  const dateStr = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "To be confirmed"

  const timeStr = time
    ? new Date(2000, 0, 1, ...time.split(":").map(Number) as [number, number]).toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#1e3a5f] text-white px-8 py-6">
          <h1 className="text-xl font-bold">Jamie&apos;s Auto Care</h1>
          <p className="text-blue-200 text-sm mt-1">Mobile Mechanic — Edinburgh &amp; Lothians</p>
        </div>

        <div className="px-8 py-8">
          {cancelled ? (
            <>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl mb-4">✗</div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Booking Cancelled</h2>
              <p className="text-gray-500 text-sm">
                This booking has been cancelled and can no longer be confirmed. If you&apos;d like to book again, please
                submit a new request.
              </p>
              <Link
                href="/#booking"
                className="inline-block mt-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Submit a New Booking
              </Link>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl mb-4">✓</div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {alreadyDone ? "Already Confirmed" : "Appointment Confirmed!"}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {alreadyDone
                  ? "Your appointment was already confirmed. Check your email for the confirmation."
                  : "Thanks for confirming — a confirmation email is on its way to you now."}
              </p>

              <div className="bg-gray-50 rounded-lg p-5 text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium text-gray-800">{booking.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-medium text-gray-800">
                    {booking.vehicle}
                    {booking.vehicle_reg ? ` (${booking.vehicle_reg.toUpperCase()})` : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-800">{dateStr}</span>
                </div>
                {timeStr && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-800">{timeStr}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Job</span>
                  <span className="font-medium text-gray-800 text-right max-w-[220px]">{booking.issue}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-6 text-center">
                Need to cancel or change? Contact us at{" "}
                <a href="mailto:contact@jamiesautocare.com" className="underline">
                  contact@jamiesautocare.com
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
