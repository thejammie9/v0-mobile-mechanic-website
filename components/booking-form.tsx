"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, Loader } from "lucide-react"

export default function BookingForm() {
  const [formStatus, setFormStatus] = useState<{
    type: "idle" | "loading" | "success" | "error"
    message: string
  }>({
    type: "idle",
    message: "",
  })

  const [minDate, setMinDate] = useState("")

  useEffect(() => {
    // Set minimum date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0]
    setMinDate(tomorrowFormatted)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setFormStatus({
      type: "loading",
      message: "Processing your booking request...",
    })

    const form = e.currentTarget
    const formData = new FormData(form)

    const bookingData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      vehicle: formData.get("vehicle"),
      issue: formData.get("issue"),
      booking_date: formData.get("date"),
      time_slot: formData.get("timeSlot"),
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Success response
      setFormStatus({
        type: "success",
        message: "Thank you for your booking request. We'll contact you shortly to confirm your appointment.",
      })

      // Reset form
      form.reset()
    } catch (error) {
      setFormStatus({
        type: "error",
        message: "Something went wrong. Please try again later.",
      })
    }
  }

  return (
    <section className="py-16 bg-gray-100" id="booking">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Book Your Repair</h2>

        <form
          id="booking-form"
          className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                placeholder="John Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block font-medium">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="07463451967"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block font-medium">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="vehicle" className="block font-medium">
                Vehicle Make/Model
              </label>
              <input
                id="vehicle"
                name="vehicle"
                placeholder="Ford Focus 2018"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="issue" className="block font-medium">
                Issue Description
              </label>
              <textarea
                id="issue"
                name="issue"
                placeholder="Please describe the problem with your vehicle..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
                required
              ></textarea>
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="block font-medium">
                Preferred Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min={minDate}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Please note: Appointments require at least 1 day advance notice.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="timeSlot" className="block font-medium">
                Preferred Time
              </label>
              <select
                id="timeSlot"
                name="timeSlot"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select time slot</option>
                <option value="Morning (09:00 - 12:30)">Morning (09:00 - 12:30)</option>
                <option value="Afternoon (13:30 - 17:30)">Afternoon (13:30 - 17:30)</option>
                <option value="Weekend Sat/Sun (10:30 - 13:30)">Weekend Sat/Sun (10:30 - 13:30)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded"
            disabled={formStatus.type === "loading"}
          >
            {formStatus.type === "loading" ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin mr-2 h-5 w-5" />
                Processing...
              </span>
            ) : (
              "Submit Booking Request"
            )}
          </button>
        </form>

        {formStatus.type !== "idle" && (
          <div className="max-w-2xl mx-auto mt-6">
            {formStatus.type === "success" && (
              <div className="flex bg-green-50 border border-green-200 text-green-800 p-4 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold">Booking Request Received!</h4>
                  <p>{formStatus.message}</p>
                </div>
              </div>
            )}

            {formStatus.type === "error" && (
              <div className="flex bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-bold">Error</h4>
                  <p>{formStatus.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
