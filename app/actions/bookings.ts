"use server"

import { createClient } from "@/lib/supabase/server"
import { sendBookingNotification } from "@/lib/email"

export type BookingFormData = {
  name: string
  phone: string
  email: string
  vehicle: string
  issue: string
  preferredDate: string | null
  preferredTime: string | null
}

export async function createBooking(data: BookingFormData) {
  const supabase = await createClient()

  const { error } = await supabase.from("bookings").insert({
    name: data.name,
    phone: data.phone,
    email: data.email,
    vehicle: data.vehicle,
    issue: data.issue,
    preferred_date: data.preferredDate,
    preferred_time: data.preferredTime,
    status: "pending",
  })

  if (error) {
    console.error("Error creating booking:", error)
    return { success: false, error: error.message }
  }

  // Send email notification (non-blocking - don't fail the booking if email fails)
  sendBookingNotification(data).catch((err) => {
    console.error("Failed to send booking notification email:", err)
  })

  return { success: true }
}
