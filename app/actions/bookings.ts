"use server"

import { createBooking as dbCreateBooking, getAllBookings, updateBookingStatus as dbUpdateStatus, deleteBooking as dbDeleteBooking, updateBookingDateTime as dbUpdateBookingDateTime, getSlotBookingCounts as dbGetSlotBookingCounts, getBookingById, getCustomerByEmail, getCustomerByPhone, getCustomerByVehicleReg, createCustomer, addVehicle, linkBookingToCustomer, updateBookingNotes as dbUpdateBookingNotes, getBookingAvailability, getSiteSetting, type Booking, type Customer, getCustomerVehicles, updateBookingIp, updateBookingDetails as dbUpdateBookingDetails, markReviewRequestSent } from "@/lib/db"
import { headers } from "next/headers"
import { sendBookingNotification, sendCustomerConfirmation, sendAppointmentConfirmation, sendAppointmentRequest, sendQuoteRequestConfirmation, sendDiscordBookingNotification, sendReviewRequestEmail } from "@/lib/email"

export type BookingFormData = {
  name: string
  phone: string
  email: string
  vehicle: string
  vehicleReg: string | null
  vehicleYear: string | null
  issue: string
  preferredDate: string | null
  preferredTime: string | null
  address: string | null
  requestCallback?: boolean
  requestQuote?: boolean
  _hp?: string          // honeypot
  _t?: number           // form load timestamp (ms)
}

// In-memory rate limiter: IP → list of submission timestamps
const ipSubmissions = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000   // 1 hour
const RATE_LIMIT_MAX = 5                    // max 5 submissions per IP per hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const times = (ipSubmissions.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW)
  if (times.length >= RATE_LIMIT_MAX) return false
  ipSubmissions.set(ip, [...times, now])
  return true
}

export async function createBooking(data: BookingFormData) {
  // Honeypot: bots fill hidden fields, humans don't
  if (data._hp && data._hp.trim() !== "") return { success: false, error: "Submission rejected." }

  // Timing: reject if submitted in under 3 seconds (bot speed)
  if (data._t && Date.now() - data._t < 3000) return { success: false, error: "Submission rejected." }

  // IP rate limiting
  try {
    const hdrs = await headers()
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown"
    if (!checkRateLimit(ip)) return { success: false, error: "Too many submissions. Please wait a while before trying again." }
  } catch {}

  // Server-side validation
  if (!data.name?.trim() || data.name.length > 100) return { success: false, error: "Invalid name" }
  if (!data.email?.trim() || data.email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { success: false, error: "Invalid email" }
  if (!data.phone?.trim() || data.phone.length > 30) return { success: false, error: "Invalid phone number" }
  // Phone must contain at least 10 digits
  if ((data.phone.replace(/\D/g, "").length) < 10) return { success: false, error: "Please enter a valid phone number" }
  if (!data.vehicle?.trim() || data.vehicle.length > 200) return { success: false, error: "Invalid vehicle" }
  // Vehicle name must contain at least one space (e.g. "Ford Focus") — rejects random strings
  if (!data.vehicle.trim().includes(" ")) return { success: false, error: "Please enter your vehicle make and model (e.g. Ford Focus 1.6)" }
  if (!data.issue?.trim() || data.issue.length > 2000) return { success: false, error: "Invalid issue description" }
  const availConfig = getBookingAvailability()
  if (data.preferredTime && !availConfig.slots.includes(data.preferredTime)) return { success: false, error: "Invalid time slot" }
  if (data.preferredDate) {
    const advanceDays = parseInt(getSiteSetting("booking_advance_days") || "1", 10) || 1
    const cutoff = new Date()
    cutoff.setHours(0, 0, 0, 0)
    cutoff.setDate(cutoff.getDate() + advanceDays - 1)
    const chosen = new Date(data.preferredDate + "T00:00:00")
    if (chosen <= cutoff) return { success: false, error: `Bookings must be made at least ${advanceDays} day${advanceDays>1?"s":""} in advance. Please call for same-day availability.` }
  }

  try {
    const issueText = data.requestCallback
      ? `[CALLBACK REQUESTED] ${data.issue}`
      : data.requestQuote
        ? `[QUOTE REQUESTED] ${data.issue}`
        : data.issue

    // Save to SQLite database
    const booking = dbCreateBooking({
      name: data.name,
      phone: data.phone,
      email: data.email,
      vehicle: data.vehicle,
      vehicle_reg: data.vehicleReg,
      vehicle_year: data.vehicleYear,
      issue: issueText,
      preferred_date: data.preferredDate,
      preferred_time: data.preferredTime,
      address: data.address,
    })

    // Log IP address of form submitter
    try {
      const hdrs = await headers()
      const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || null
      if (ip) updateBookingIp(booking.id, ip)
    } catch {}

    // Auto-link to existing customer record (email → phone → vehicle reg)
    try {
      let existingCustomer: Customer | null = null
      existingCustomer = getCustomerByEmail(data.email)
      if (!existingCustomer && data.phone) existingCustomer = getCustomerByPhone(data.phone)
      if (!existingCustomer && data.vehicleReg) existingCustomer = getCustomerByVehicleReg(data.vehicleReg)

      if (existingCustomer) {
        linkBookingToCustomer(booking.id, existingCustomer.id)
        // Add vehicle to their profile if it's a new reg
        if (data.vehicleReg) {
          const existing = getCustomerVehicles(existingCustomer.id)
          const regNorm = data.vehicleReg.replace(/\s/g, "").toUpperCase()
          const alreadyHave = existing.some(v => v.reg && v.reg.replace(/\s/g, "").toUpperCase() === regNorm)
          if (!alreadyHave) {
            addVehicle(existingCustomer.id, {
              make_model: data.vehicle,
              reg: data.vehicleReg,
              year: data.vehicleYear ?? null,
            })
          }
        }
      }
    } catch (linkErr) {
      console.error("Failed to auto-link booking to customer:", linkErr)
    }

    // Discord notification (non-blocking, fire-and-forget)
    sendDiscordBookingNotification({
      name: data.name, phone: data.phone, email: data.email,
      vehicle: data.vehicle, issue: issueText,
      preferredDate: data.preferredDate ?? null,
      preferredTime: data.preferredTime ?? null,
    }).catch(() => {})

    // Send emails (non-blocking)
    if (data.requestQuote) {
      // Quote request — notify admin + send "quote received" to customer
      Promise.all([
        sendBookingNotification(data),
        sendQuoteRequestConfirmation({ name: data.name, email: data.email, vehicle: data.vehicle, issue: data.issue }),
      ]).catch(err => console.error("Failed to send quote request emails:", err))
    } else if (data.preferredDate && data.preferredTime && !data.requestCallback) {
      // Date + time selected, no callback — send "please confirm your slot" email
      Promise.all([
        sendBookingNotification(data),
        sendAppointmentRequest({
          name: data.name,
          email: data.email,
          vehicle: data.vehicle,
          vehicle_reg: data.vehicleReg ?? null,
          issue: issueText,
          preferred_date: data.preferredDate,
          preferred_time: data.preferredTime,
          confirm_token: booking.confirm_token!,
        }),
      ]).catch(err => console.error("Failed to send booking emails:", err))
    } else {
      // Callback requested or no date/time — "enquiry received, I'll call you"
      Promise.all([
        sendBookingNotification(data),
        sendCustomerConfirmation(data),
      ]).catch(err => console.error("Failed to send callback emails:", err))
    }

    return { success: true, bookingId: booking.id }
  } catch (error) {
    console.error("Error creating booking:", error)
    return { success: false, error: "Failed to create booking" }
  }
}

export async function createAdminBooking(data: {
  name: string
  phone: string
  email: string | null
  vehicle: string
  vehicle_reg: string | null
  vehicle_year: string | null
  issue: string
  confirmed_date: string | null
  confirmed_time: string | null
  address: string | null
  quote_id?: number | null
}): Promise<{ success: boolean; bookingId?: number; error?: string }> {
  const { isAdminAuthenticated } = await import("@/app/admin/actions")
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false, error: "Unauthorised" }

  if (!data.name?.trim()) return { success: false, error: "Name is required" }
  if (!data.phone?.trim()) return { success: false, error: "Phone is required" }
  if (data.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { success: false, error: "Invalid email address" }
  if (!data.vehicle?.trim()) return { success: false, error: "Vehicle is required" }
  if (!data.issue?.trim()) return { success: false, error: "Job description is required" }

  const email = data.email?.trim() || ""

  try {
    const booking = dbCreateBooking({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email,
      vehicle: data.vehicle.trim(),
      vehicle_reg: data.vehicle_reg,
      vehicle_year: data.vehicle_year,
      issue: data.issue.trim(),
      preferred_date: data.confirmed_date,
      preferred_time: data.confirmed_time,
      address: data.address,
      quote_id: data.quote_id ?? null,
    })

    // Set confirmed date/time if provided, then mark confirmed
    if (data.confirmed_date) {
      dbUpdateBookingDateTime(booking.id, data.confirmed_date, data.confirmed_time || "09:00")
    }
    dbUpdateStatus(booking.id, "confirmed")

    // Auto-link or auto-create customer
    try {
      let existingCustomer = email ? getCustomerByEmail(email) : null
      if (!existingCustomer && data.phone) existingCustomer = getCustomerByPhone(data.phone.trim())

      if (existingCustomer) {
        linkBookingToCustomer(booking.id, existingCustomer.id)
        // Add vehicle to profile if new reg
        if (data.vehicle_reg) {
          const existing = getCustomerVehicles(existingCustomer.id)
          const regNorm = data.vehicle_reg.replace(/\s/g, "").toUpperCase()
          const alreadyHave = existing.some(v => v.reg && v.reg.replace(/\s/g, "").toUpperCase() === regNorm)
          if (!alreadyHave) {
            addVehicle(existingCustomer.id, { make_model: data.vehicle.trim(), reg: data.vehicle_reg, year: data.vehicle_year ?? null })
          }
        }
      } else {
        // New customer — create their account automatically
        const newCustomer = createCustomer({
          name: data.name.trim(),
          email,
          phone: data.phone.trim(),
          address: data.address,
        })
        linkBookingToCustomer(booking.id, newCustomer.id)
        if (data.vehicle.trim()) {
          addVehicle(newCustomer.id, {
            make_model: data.vehicle.trim(),
            reg: data.vehicle_reg,
            year: data.vehicle_year ?? null,
          })
        }
      }
    } catch (linkErr) {
      console.error("createAdminBooking customer link/create error:", linkErr)
    }

    return { success: true, bookingId: booking.id }
  } catch (error) {
    console.error("createAdminBooking error:", error)
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
    // Send review request when a job is marked complete (only once)
    if (success && status === "completed") {
      const booking = getBookingById(id)
      if (booking && booking.email && !booking.review_request_sent) {
        sendReviewRequestEmail({ name: booking.name, email: booking.email })
          .then(() => markReviewRequestSent(id))
          .catch(err => console.error("Review email failed:", err))
      }
    }
    return { success }
  } catch (error) {
    console.error("Error updating booking status:", error)
    return { success: false, error: "Failed to update status" }
  }
}

export async function deleteBooking(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const success = dbDeleteBooking(id)
    return { success }
  } catch (error) {
    console.error("Error deleting booking:", error)
    return { success: false, error: "Failed to delete booking" }
  }
}

export async function updateBookingDateTime(
  id: number,
  confirmed_date: string,
  confirmed_time: string
): Promise<{ success: boolean }> {
  const cancel_token = dbUpdateBookingDateTime(id, confirmed_date, confirmed_time)
  const booking = getBookingById(id)
  if (booking) {
    sendAppointmentConfirmation({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      vehicle: booking.vehicle,
      vehicle_reg: booking.vehicle_reg,
      issue: booking.issue,
      confirmed_date,
      confirmed_time,
      cancel_token,
    }).catch(err => console.error("Failed to send appointment confirmation:", err))
  }
  return { success: true }
}

export async function getSlotCounts(date: string): Promise<Record<string, number>> {
  return dbGetSlotBookingCounts(date)
}

export async function getAvailabilityForDate(date: string): Promise<{
  slots: string[]
  available_days: number[]
  closed_dates: string[]
  slotCounts: Record<string, number>
  isDayOff: boolean
  isClosed: boolean
}> {
  const avail = getBookingAvailability()
  const slotCounts = dbGetSlotBookingCounts(date)
  const dayOfWeek = new Date(date + "T00:00:00").getDay()
  const isDayOff = !avail.available_days.includes(dayOfWeek)
  const isClosed = avail.closed_dates.includes(date)
  return {
    slots: avail.slots,
    available_days: avail.available_days,
    closed_dates: avail.closed_dates,
    slotCounts,
    isDayOff,
    isClosed,
  }
}

export async function saveBookingNotes(bookingId: number, notes: string) {
  dbUpdateBookingNotes(bookingId, notes)
  return { success: true }
}

export async function createCustomerFromBooking(
  bookingId: number
): Promise<{ success: boolean; customerId?: number; existing?: boolean; error?: string }> {
  try {
    const booking = getBookingById(bookingId)
    if (!booking) return { success: false, error: "Booking not found" }

    // If already linked to a customer just return that
    if (booking.customer_id) {
      return { success: true, customerId: booking.customer_id, existing: true }
    }

    // Deduplicate: email → phone → vehicle reg
    let existing = getCustomerByEmail(booking.email)
    if (!existing && booking.phone) existing = getCustomerByPhone(booking.phone)
    if (!existing && booking.vehicle_reg) existing = getCustomerByVehicleReg(booking.vehicle_reg)
    if (existing) {
      linkBookingToCustomer(bookingId, existing.id)
      return { success: true, customerId: existing.id, existing: true }
    }

    // Create the customer from booking data
    const customer = createCustomer({
      name:    booking.name,
      email:   booking.email,
      phone:   booking.phone,
      address: booking.address,
    })

    // Add vehicle if present
    if (booking.vehicle) {
      addVehicle(customer.id, {
        make_model: booking.vehicle,
        reg:        booking.vehicle_reg,
        year:       booking.vehicle_year,
      })
    }

    linkBookingToCustomer(bookingId, customer.id)
    return { success: true, customerId: customer.id, existing: false }
  } catch (error) {
    console.error("Error creating customer from booking:", error)
    return { success: false, error: "Failed to create customer" }
  }
}

export async function updateBookingDetails(
  id: number,
  data: {
    name: string
    phone: string
    email: string
    vehicle: string
    vehicle_reg: string | null
    vehicle_year: string | null
    issue: string
    address: string | null
    confirmed_date: string | null
    confirmed_time: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  const { isAdminAuthenticated } = await import("@/app/admin/actions")
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false, error: "Unauthorised" }

  if (!data.name?.trim()) return { success: false, error: "Name is required" }
  if (!data.phone?.trim()) return { success: false, error: "Phone is required" }
  if (!data.vehicle?.trim()) return { success: false, error: "Vehicle is required" }
  if (!data.issue?.trim()) return { success: false, error: "Issue is required" }

  try {
    const ok = dbUpdateBookingDetails(id, data)
    return { success: ok }
  } catch (error) {
    console.error("updateBookingDetails error:", error)
    return { success: false, error: "Failed to update booking" }
  }
}

export async function sendApprovalEmail(bookingId: number): Promise<{ success: boolean; error?: string }> {
  const { isAdminAuthenticated } = await import("@/app/admin/actions")
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false, error: "Unauthorised" }

  const { getBookingById } = await import("@/lib/db")
  const { sendAppointmentApprovalEmail } = await import("@/lib/email")

  const booking = getBookingById(bookingId)
  if (!booking) return { success: false, error: "Booking not found" }
  if (!booking.confirmed_date || !booking.confirmed_time) {
    return { success: false, error: "Please set a confirmed date and time on this booking first" }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jamiesautocare.com"
  const confirmUrl = booking.confirm_token ? `${siteUrl}/confirm/${booking.confirm_token}` : `${siteUrl}`
  const cancelUrl = booking.cancel_token ? `${siteUrl}/cancel/${booking.cancel_token}` : undefined

  return sendAppointmentApprovalEmail({
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    vehicle: booking.vehicle,
    vehicle_reg: booking.vehicle_reg,
    confirmed_date: booking.confirmed_date,
    confirmed_time: booking.confirmed_time,
    issue: booking.issue,
    address: booking.address,
    confirmUrl,
    cancelUrl,
  })
}
