import { redirect } from "next/navigation"
import { updateBookingStatus } from "@/lib/db"
import { createInvoiceFromBooking } from "@/app/actions/invoices"
import { sendApprovalEmail } from "@/app/actions/bookings"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Booking } from "@/lib/db"

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  confirmed: "bg-blue-900/50 text-blue-300 border-blue-700",
  completed: "bg-green-900/50 text-green-300 border-green-700",
  cancelled: "bg-red-900/50 text-red-300 border-red-700",
}

function formatTime(time: string | null) {
  if (!time) return ""
  const [h, m] = time.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`
}

type Props = {
  booking: Booking
  returnUrl: string
  compact?: boolean
}

export default function CalendarBookingCard({ booking: b, returnUrl, compact = false }: Props) {
  const time = formatTime(b.confirmed_time || b.preferred_time)

  return (
    <div className="bg-gray-700/40 border border-gray-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-100">{b.name}</span>
            <Badge className={STATUS_BADGE[b.status] || STATUS_BADGE.pending}>
              {b.status}
            </Badge>
            {b.customer_confirmed ? (
              <Badge className="bg-green-900/50 text-green-300 border-green-700 text-xs">
                ✓ Customer confirmed
              </Badge>
            ) : null}
          </div>
          <div className="text-sm text-gray-400 mt-0.5 space-y-0.5">
            <div>{b.vehicle}{b.vehicle_reg ? ` — ${b.vehicle_reg.toUpperCase()}` : ""}</div>
            {time && <div>Time: {time}</div>}
            {b.address && <div>Address: {b.address}</div>}
            {!compact && <div className="text-gray-300">{b.issue}</div>}
            <div className="text-xs">{b.phone} · {b.email}</div>
          </div>
        </div>
        <span className="text-xs text-gray-600 flex-shrink-0">#{b.id}</span>
      </div>

      {/* Action buttons */}
      {b.status !== "cancelled" && (
        <div className="flex flex-wrap gap-2 pt-3 mt-1 border-t border-gray-700">
          {/* Confirm */}
          {b.status === "pending" && (
            <form action={async () => {
              "use server"
              updateBookingStatus(b.id, "confirmed")
              redirect(returnUrl)
            }}>
              <button type="submit"
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-800 hover:bg-blue-700 text-white transition-colors">
                Confirm
              </button>
            </form>
          )}

          {/* Mark Complete */}
          {b.status !== "completed" && (
            <form action={async () => {
              "use server"
              updateBookingStatus(b.id, "completed")
              redirect(returnUrl)
            }}>
              <button type="submit"
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-800 hover:bg-green-700 text-white transition-colors">
                Mark Complete
              </button>
            </form>
          )}

          {/* Create Invoice */}
          <form action={async () => {
            "use server"
            const result = await createInvoiceFromBooking(b.id)
            if (result.success && result.invoiceId) {
              redirect(`/admin/invoices/${result.invoiceId}/edit`)
            } else {
              redirect(returnUrl)
            }
          }}>
            <button type="submit"
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-orange-700 hover:bg-orange-600 text-white transition-colors">
              Create Invoice
            </button>
          </form>

          {/* Cancel */}
          {b.status !== "completed" && (
            <form action={async () => {
              "use server"
              updateBookingStatus(b.id, "cancelled")
              redirect(returnUrl)
            }}>
              <button type="submit"
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-red-800 text-red-400 hover:bg-red-900/30 transition-colors">
                Cancel
              </button>
            </form>
          )}

          {/* Send approval/confirmation email */}
          {b.confirmed_date && b.confirmed_time && (
            <form action={async () => {
              "use server"
              await sendApprovalEmail(b.id)
              redirect(returnUrl)
            }}>
              <button type="submit"
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-900 hover:bg-blue-800 border border-blue-700 text-blue-200 transition-colors">
                {b.customer_confirmed ? "Re-send Confirmation" : "Send Confirmation Email"}
              </button>
            </form>
          )}

          {/* View customer */}
          <Link href={`/admin/customers?q=${encodeURIComponent(b.email)}`}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">
            Customer →
          </Link>
        </div>
      )}
    </div>
  )
}
