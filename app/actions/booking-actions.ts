"use server"

import nodemailer from "nodemailer"
import { z } from "zod"
import { query, initDatabase } from "@/lib/db"
import crypto from "crypto"

// Initialize database on first import
initDatabase().catch(console.error)

// Define booking schema for validation
const bookingSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  vehicle: z.string().min(2, { message: "Please enter your vehicle details" }),
  issue: z.string().min(10, { message: "Please describe the issue in more detail" }),
  date: z.string().min(1, { message: "Please select a date" }),
  timeSlot: z.string().min(1, { message: "Please select a time slot" }),
})

// Type for booking data
export type BookingData = z.infer<typeof bookingSchema> & {
  id: string
  createdAt: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  cancellationToken?: string
}

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mail.yourdomain.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "info@yourdomain.com",
      pass: process.env.SMTP_PASSWORD || "your-email-password",
    },
  })
}

// Generate a secure cancellation token
const generateCancellationToken = () => {
  return crypto.randomBytes(32).toString("hex")
}

// Function to save booking to database
const saveBooking = async (booking: BookingData) => {
  try {
    await query(
      `INSERT INTO bookings 
      (id, name, email, phone, vehicle, issue, booking_date, time_slot, status, created_at, cancellation_token) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking.id,
        booking.name,
        booking.email,
        booking.phone,
        booking.vehicle,
        booking.issue,
        booking.date,
        booking.timeSlot,
        booking.status,
        booking.createdAt,
        booking.cancellationToken,
      ],
    )
    return true
  } catch (error) {
    console.error("Error saving booking to database:", error)
    throw error
  }
}

// Function to send admin notification email
const sendAdminNotification = async (booking: BookingData) => {
  try {
    const transporter = createTransporter()

    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${process.env.SMTP_USER || "contact@jamiesautocare.com"}>`,
      to: process.env.ADMIN_EMAIL || "contact@jamiesautocare.com", // Set your email in .env
      subject: `New Booking Request: ${booking.name}`,
      html: `
        <h1>New Booking Request</h1>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Vehicle:</strong> ${booking.vehicle}</p>
        <p><strong>Issue:</strong> ${booking.issue}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.timeSlot}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/bookings">View in Admin Dashboard</a></p>
      `,
    })
  } catch (error) {
    console.error("Error sending admin notification:", error)
  }
}

// Function to send customer confirmation email
const sendCustomerConfirmation = async (booking: BookingData) => {
  try {
    const transporter = createTransporter()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const cancellationUrl = `${appUrl}/bookings/${booking.id}/cancel?token=${booking.cancellationToken}`

    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${process.env.SMTP_USER || "contact@jamiesautocare.com"}>`,
      to: booking.email,
      subject: "Your Booking Confirmation - Jamie's Auto Care",
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${booking.name},</p>
        <p>Thank you for booking with Jamie's Auto Care. We have received your request and will contact you shortly to confirm your appointment.</p>
        <h2>Booking Details:</h2>
        <p><strong>Booking Reference:</strong> ${booking.id}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.timeSlot}</p>
        <p><strong>Vehicle:</strong> ${booking.vehicle}</p>
        <p><strong>Issue:</strong> ${booking.issue}</p>
        <p>If you need to make any changes to your booking, please contact us at ${process.env.ADMIN_EMAIL || "contact@jamiesautocare.com"} or call us at 07463451967.</p>
        <p>If you need to cancel your booking, please <a href="${cancellationUrl}">click here</a>.</p>
        <p>We look forward to serving you!</p>
        <p>Best regards,<br>Jamie's Auto Care Team</p>
      `,
    })
  } catch (error) {
    console.error("Error sending customer confirmation:", error)
  }
}

// Function to send cancellation confirmation email
const sendCancellationConfirmation = async (booking: BookingData) => {
  try {
    const transporter = createTransporter()

    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${process.env.SMTP_USER || "contact@jamiesautocare.com"}>`,
      to: booking.email,
      subject: "Booking Cancellation Confirmation - Jamie's Auto Care",
      html: `
        <h1>Booking Cancellation Confirmation</h1>
        <p>Dear ${booking.name},</p>
        <p>Your booking with Jamie's Auto Care has been successfully cancelled.</p>
        <h2>Cancelled Booking Details:</h2>
        <p><strong>Booking Reference:</strong> ${booking.id}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.timeSlot}</p>
        <p>If you cancelled by mistake or would like to make a new booking, please visit our website or contact us at ${process.env.ADMIN_EMAIL || "contact@jamiesautocare.com"} or call us at 07463451967.</p>
        <p>Thank you for considering Jamie's Auto Care.</p>
        <p>Best regards,<br>Jamie's Auto Care Team</p>
      `,
    })

    // Also notify admin about the cancellation
    await transporter.sendMail({
      from: `"Jamie's Auto Care System" <${process.env.SMTP_USER || "contact@jamiesautocare.com"}>`,
      to: process.env.ADMIN_EMAIL || "contact@jamiesautocare.com",
      subject: `Booking Cancellation: ${booking.name}`,
      html: `
        <h1>Booking Cancellation</h1>
        <p>A customer has cancelled their booking:</p>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.timeSlot}</p>
        <p><strong>Vehicle:</strong> ${booking.vehicle}</p>
        <p><strong>Issue:</strong> ${booking.issue}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/bookings">View in Admin Dashboard</a></p>
      `,
    })
  } catch (error) {
    console.error("Error sending cancellation confirmation:", error)
  }
}

// Main action to handle booking submission
export async function submitBooking(formData: FormData) {
  try {
    // Extract and validate form data
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      vehicle: formData.get("vehicle") as string,
      issue: formData.get("issue") as string,
      date: formData.get("date") as string,
      timeSlot: formData.get("timeSlot") as string,
    }

    // Validate data
    const validatedData = bookingSchema.parse(data)

    // Create booking object with cancellation token
    const booking: BookingData = {
      ...validatedData,
      id: `booking_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      cancellationToken: generateCancellationToken(),
    }

    // Save booking
    await saveBooking(booking)

    // Send emails
    await Promise.all([sendAdminNotification(booking), sendCustomerConfirmation(booking)])

    return { success: true, message: "Booking submitted successfully!" }
  } catch (error) {
    console.error("Error submitting booking:", error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation error. Please check your information.",
        errors: error.errors,
      }
    }
    return { success: false, message: "Failed to submit booking. Please try again." }
  }
}

// Function to get all bookings (for admin dashboard)
export async function getBookings() {
  try {
    const results = (await query(
      `SELECT 
        id, 
        name, 
        email, 
        phone, 
        vehicle, 
        issue, 
        booking_date as date, 
        time_slot as timeSlot, 
        status, 
        created_at as createdAt,
        cancellation_token as cancellationToken
      FROM bookings 
      ORDER BY created_at DESC`,
    )) as any[]

    return results.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt).toISOString(),
    }))
  } catch (error) {
    console.error("Error getting bookings:", error)
    return []
  }
}

// Function to get a single booking by ID and token
export async function getBookingByIdAndToken(id: string, token: string) {
  try {
    const results = (await query(
      `SELECT 
        id, 
        name, 
        email, 
        phone, 
        vehicle, 
        issue, 
        booking_date as date, 
        time_slot as timeSlot, 
        status, 
        created_at as createdAt,
        cancellation_token as cancellationToken
      FROM bookings 
      WHERE id = ? AND cancellation_token = ?`,
      [id, token],
    )) as any[]

    if (results.length === 0) {
      return null
    }

    const booking = results[0]
    return {
      ...booking,
      createdAt: new Date(booking.createdAt).toISOString(),
    }
  } catch (error) {
    console.error("Error getting booking:", error)
    return null
  }
}

// Function to update booking status
export async function updateBookingStatus(id: string, status: BookingData["status"]) {
  try {
    await query(`UPDATE bookings SET status = ? WHERE id = ?`, [status, id])

    return { success: true, message: "Booking status updated" }
  } catch (error) {
    console.error("Error updating booking status:", error)
    return { success: false, message: "Failed to update booking status" }
  }
}

// Function to cancel a booking
export async function cancelBooking(id: string, token: string) {
  try {
    // First verify the booking and token
    const booking = await getBookingByIdAndToken(id, token)

    if (!booking) {
      return { success: false, message: "Invalid booking or cancellation link" }
    }

    if (booking.status === "cancelled") {
      return { success: false, message: "This booking has already been cancelled" }
    }

    // Update the booking status to cancelled
    await query(`UPDATE bookings SET status = 'cancelled' WHERE id = ? AND cancellation_token = ?`, [id, token])

    // Send cancellation confirmation email
    await sendCancellationConfirmation(booking)

    return { success: true, message: "Booking cancelled successfully" }
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return { success: false, message: "Failed to cancel booking. Please try again or contact us directly." }
  }
}
