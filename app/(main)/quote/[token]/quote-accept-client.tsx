"use client"

import { useState } from "react"
import { acceptQuoteByToken } from "@/app/actions/quotes"

const TIME_SLOTS = [
  { value: "09:00", label: "9:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "15:00", label: "3:00 PM" },
]

export default function QuoteAcceptClient({ token, customerName }: { token: string; customerName: string }) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Min date = tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 10)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time) { setError("Please choose a date and time."); return }
    setError(null)
    setSubmitting(true)
    const result = await acceptQuoteByToken(token, date, time)
    setSubmitting(false)
    if (result.success) {
      setDone(true)
    } else {
      setError(result.error || "Something went wrong. Please try again.")
    }
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">Quote Accepted!</h2>
        <p className="text-green-700 text-lg mb-2">Thank you, {customerName}!</p>
        <p className="text-green-600">Your booking request has been submitted. Jamie will be in touch shortly to confirm your appointment.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-green-600 px-6 py-4">
        <h2 className="font-semibold text-white text-lg">Accept &amp; Book</h2>
        <p className="text-green-100 text-sm mt-0.5">Choose a preferred date and time — we'll confirm it with you.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Preferred Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Preferred Time <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TIME_SLOTS.map(slot => (
              <button
                key={slot.value}
                type="button"
                onClick={() => setTime(slot.value)}
                className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  time === slot.value
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !date || !time}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-lg transition-colors text-lg"
        >
          {submitting ? "Submitting..." : "✓ Confirm — Accept This Quote"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Your preferred time is a request — Jamie will contact you to confirm the exact appointment.
        </p>
      </form>
    </div>
  )
}
