"use server"

import { createBooking as dbCreateBooking, getAllBookings, updateBookingStatus as dbUpdateStatus, type Booking } from "@/lib/db"
import { sendBookingNotification, sendCustomerConfirmation } from "@/lib/email"

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
  try {
    // Save to SQLite database
    const booking = dbCreateBooking({
      name: data.name,
      phone: data.phone,
      email: data.email,
      vehicle: data.vehicle,
      issue: data.issue,
      preferred_date: data.preferredDate,
      preferred_time: data.preferredTime,
    })

    // Send email notifications (non-blocking)
    Promise.all([
      sendBookingNotification(data),
      sendCustomerConfirmation(data),
    ]).catch((err) => {
      console.error("Failed to send email notifications:", err)
    })

    return { success: true, bookingId: booking.id }
  } catch (error) {
    console.error("Error creating booking:", error)
    return { success: false, error: "Failed to create booking" }
  }
}

export async function getBookings(): Promise<Booking[]> {
  try {
    return getAllBookings()
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

export async function updateBookingStatus(id: number, status: string) {
  try {
    const success = dbUpdateStatus(id, status)
    return { success }
  } catch (error) {
    console.error("Error updating booking status:", error)
    return { success: false, error: "Failed to update status" }
  }
}
