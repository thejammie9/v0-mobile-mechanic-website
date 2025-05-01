import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import nodemailer from "nodemailer"

// POST handler to cancel a booking
export async function POST(request: NextRequest) {
  try {
    const { id, token } = await request.json()

    // Validate required fields
    if (!id || !token) {
      return NextResponse.json({ success: false, message: "Booking ID and token are required" }, { status: 400 })
    }

    // Verify booking and token
    const results = await query(
      `SELECT 
        name, 
        email, 
        booking_date as date, 
        time_slot as timeSlot, 
        vehicle, 
        status 
      FROM bookings 
      WHERE id = ? AND cancellation_token = ?`,
      [id, token],
    )

    if ((results as any[]).length === 0) {
      return NextResponse.json({ success: false, message: "Invalid booking ID or cancellation token" }, { status: 404 })
    }

    const booking = (results as any[])[0]

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      return NextResponse.json({ success: false, message: "This booking has already been cancelled" }, { status: 400 })
    }

    // Update booking status to cancelled
    await query("UPDATE bookings SET status = 'cancelled' WHERE id = ? AND cancellation_token = ?", [id, token])

    // Send cancellation email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.yourdomain.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "info@yourdomain.com",
        pass: process.env.SMTP_PASSWORD || "your-email-password",
      },
    })

    // Send email to customer
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${process.env.SMTP_USER || "contact@jamiesautocare.com"}>`,
      to: booking.email,
      subject: "Booking Cancellation Confirmation - Jamie's Auto Care",
      html: `
        <h1>Booking Cancellation Confirmation</h1>
        <p>Dear ${booking.name},</p>
        <p>Your booking with Jamie's Auto Care has been successfully cancelled.</p>
        <h2>Cancelled Booking Details:</h2>
        <p><strong>Booking Reference:</strong> ${id}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.timeSlot}</p>
        <p>If you cancelled by mistake or would like to make a new booking, please visit our website or contact us at ${
          process.env.ADMIN_EMAIL || "contact@jamiesautocare.com"
        } or call us at 07463451967.</p>
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
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.timeSlot}</p>
        <p><strong>Vehicle:</strong> ${booking.vehicle}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/bookings">View in Admin Dashboard</a></p>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json({ success: false, message: "Failed to cancel booking" }, { status: 500 })
  }
}
