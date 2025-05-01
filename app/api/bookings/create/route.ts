import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import nodemailer from "nodemailer"
import crypto from "crypto"
import { z } from "zod"

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

// POST handler to create a new booking
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate data
    try {
      bookingSchema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation error. Please check your information.",
            errors: error.errors,
          },
          { status: 400 },
        )
      }
    }

    // Validate date (must be at least 1 day in the future)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + 1)

    const bookingDate = new Date(data.date)
    if (bookingDate < minDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking date must be at least 1 day in the future",
        },
        { status: 400 },
      )
    }

    // Validate time slot
    const validTimeSlots = ["Morning (09:00 - 12:30)", "Afternoon (13:30 - 17:30)", "Weekend Sat/Sun (10:30 - 13:30)"]
    if (!validTimeSlots.includes(data.timeSlot)) {
      return NextResponse.json({ success: false, message: "Invalid time slot" }, { status: 400 })
    }

    // Generate unique ID and cancellation token
    const id = `booking_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`
    const cancellationToken = crypto.randomBytes(32).toString("hex")

    // Insert booking into database
    await query(
      `INSERT INTO bookings 
      (id, name, email, phone, vehicle, issue, booking_date, time_slot, cancellation_token) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.email, data.phone, data.vehicle, data.issue, data.date, data.timeSlot, cancellationToken],
    )

    // Send confirmation emails
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.yourdomain.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "info@yourdomain.com",
        pass: process.env.SMTP_PASSWORD || "your-email-password",
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const cancellationUrl = `${appUrl}/bookings/cancel?id=${id}&token=${cancellationToken}`

    // Send email to customer
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${process.env.SMTP_USER || "contact@jamiesautocare.com"}>`,
      to: data.email,
      subject: "Your Booking Confirmation - Jamie's Auto Care",
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${data.name},</p>
        <p>Thank you for booking with Jamie's Auto Care. We have received your request and will contact you shortly to confirm your appointment.</p>
        <h2>Booking Details:</h2>
        <p><strong>Booking Reference:</strong> ${id}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.timeSlot}</p>
        <p><strong>Vehicle:</strong> ${data.vehicle}</p>
        <p><strong>Issue:</strong> ${data.issue}</p>
        <p>If you need to make any changes to your booking, please contact us at ${
          process.env.ADMIN_EMAIL || "contact@jamiesautocare.com"
        } or call us at 07463451967.</p>
        <p>If you need to cancel your booking, please <a href="${cancellationUrl}">click here</a>.</p>
        <p>We look forward to serving you!</p>
        <p>Best regards,<br>Jamie's Auto Care Team</p>
      `,
    })

    // Send notification to admin
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${process.env.SMTP_USER || "contact@jamiesautocare.com"}>`,
      to: process.env.ADMIN_EMAIL || "contact@jamiesautocare.com",
      subject: `New Booking Request: ${data.name}`,
      html: `
        <h1>New Booking Request</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Vehicle:</strong> ${data.vehicle}</p>
        <p><strong>Issue:</strong> ${data.issue}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.timeSlot}</p>
        <p><a href="${appUrl}/admin/bookings">View in Admin Dashboard</a></p>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      bookingId: id,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ success: false, message: "Failed to create booking" }, { status: 500 })
  }
}
