"use server"

import { saveBookingAvailability, type BookingAvailability } from "@/lib/db"
import { isAdminAuthenticated } from "@/app/admin/actions"

export async function updateBookingAvailability(
  data: BookingAvailability
): Promise<{ success: boolean; error?: string }> {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false, error: "Unauthorised" }
  try {
    saveBookingAvailability(data)
    return { success: true }
  } catch (e) {
    console.error("updateBookingAvailability error:", e)
    return { success: false, error: "Failed to save" }
  }
}
