import { notFound } from "next/navigation"
import { getBookingByCancelToken, cancelBookingByToken } from "@/lib/db"
import { sendCancellationEmails } from "@/lib/email"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

function fmt(date: string, time: string) {
  const d = new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const [h, m] = time.split(":").map(Number)
  const t = new Date(2000, 0, 1, h, m).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })
  return { d, t }
}

export default async function CancelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const booking = getBookingByCancelToken(token)

  if (!booking) notFound()

  const alreadyCancelled = booking.status === "cancelled"
  const hasDateTime = booking.confirmed_date && booking.confirmed_time
  const { d, t } = hasDateTime
    ? fmt(booking.confirmed_date!, booking.confirmed_time!)
    : { d: "Not yet set", t: "" }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-[#1e3a5f] text-white px-8 py-6">
          <h1 className="text-xl font-bold">Jamie&apos;s Auto Care</h1>
          <p className="text-blue-200 text-sm mt-1">Appointment Cancellation</p>
        </div>

        <div className="px-8 py-8">
          {alreadyCancelled ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl">✓</div>
                <h2 className="text-lg font-semibold text-gray-700">Already Cancelled</h2>
              </div>
              <p className="text-gray-500 text-sm">This appointment has already been cancelled. No further action is needed.</p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Cancel Your Appointment</h2>
              <p className="text-gray-500 text-sm mb-6">Please review your appointment details before cancelling.</p>

              {/* Booking details */}
              <div className="bg-gray-50 rounded-lg p-5 mb-6 text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium text-gray-800">{booking.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-medium text-gray-800">{booking.vehicle}{booking.vehicle_reg ? ` (${booking.vehicle_reg})` : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-800">{d}</span>
                </div>
                {t && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-800">{t}</span>
                  </div>
                )}
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
                <p className="font-semibold mb-1">⚠️ Cancellation Policy</p>
                <p>All appointments must be cancelled at least <strong>24 hours before</strong> the scheduled time. Cancellations made with less than 24 hours&apos; notice may be subject to a <strong>call-out fee</strong>.</p>
              </div>

              {/* Cancel form */}
              <form
                action={async () => {
                  "use server"
                  const result = cancelBookingByToken(token)
                  if (result.success && booking.confirmed_date && booking.confirmed_time) {
                    sendCancellationEmails({
                      name: booking.name,
                      email: booking.email,
                      phone: booking.phone,
                      vehicle: booking.vehicle,
                      vehicle_reg: booking.vehicle_reg,
                      confirmed_date: booking.confirmed_date,
                      confirmed_time: booking.confirmed_time,
                    }).catch(err => console.error("Cancellation emails failed:", err))
                  }
                  redirect(`/cancel/${token}`)
                }}
              >
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Confirm Cancellation
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Changed your mind? Simply close this page — your appointment remains booked.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
