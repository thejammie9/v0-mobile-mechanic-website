import { NextResponse } from "next/server"
import { query, initDatabase } from "@/lib/db"
import crypto from "crypto"
import nodemailer from "nodemailer"

// Initialize database
initDatabase().catch(console.error)

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

// Function to send admin notification email
const sendAdminNotification = async (booking: any) => {
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
    console.log("Admin notification email sent")
  } catch (error) {
    console.error("Error sending admin notification:", error)
  }
}

// Function to send customer confirmation email
const sendCustomerConfirmation = async (booking: any) => {
  try {
    const transporter = createTransporter()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    // Use PHP cancellation page instead of dynamic route
    const cancellationUrl = `${appUrl}/bookings/cancel.php?id=${booking.id}&token=${booking.cancellationToken}`

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
    console.log("Customer confirmation email sent")
  } catch (error) {
    console.error("Error sending customer confirmation:", error)
  }
}

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()
    console.log("Booking received:", bookingData)

    // Validate required fields
    const requiredFields = ["name", "email", "phone", "vehicle", "issue", "date", "timeSlot"]
    const missingFields = requiredFields.filter((field) => !bookingData[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          errors: missingFields.map((field) => ({ field, message: `${field} is required` })),
        },
        { status: 400 },
      )
    }

    // Generate booking ID and cancellation token
    const bookingId = `booking_${Date.now()}`
    const cancellationToken = crypto.randomBytes(32).toString("hex")
    const reference = "REF-" + Math.random().toString(36).substr(2, 6).toUpperCase()

    // Extract registration from vehicle if present
    let vehicleReg = ""
    if (bookingData.vehicle.includes("Reg:")) {
      const regMatch = bookingData.vehicle.match(/Reg: ([A-Z0-9]+)/)
      if (regMatch && regMatch[1]) {
        vehicleReg = regMatch[1]
      }
    }

    // Format the current date in MySQL format (YYYY-MM-DD HH:MM:SS)
    const now = new Date()
    const mysqlDatetime = now.toISOString().slice(0, 19).replace("T", " ")

    // Save to database
    try {
      await query(
        `INSERT INTO bookings 
        (id, name, email, phone, vehicle, issue, booking_date, time_slot, status, created_at, cancellation_token, address, postcode, service_type, vehicle_reg) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingId,
          bookingData.name,
          bookingData.email,
          bookingData.phone,
          bookingData.vehicle,
          bookingData.issue,
          bookingData.date,
          bookingData.timeSlot,
          "pending",
          mysqlDatetime, // Use MySQL formatted datetime
          cancellationToken,
          bookingData.address || "",
          bookingData.postcode || "",
          bookingData.serviceType || "",
          vehicleReg,
        ],
      )
      console.log("Booking saved to database")
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save booking to database",
        },
        { status: 500 },
      )
    }

    // Prepare booking object for emails
    const booking = {
      ...bookingData,
      id: bookingId,
      cancellationToken,
      status: "pending",
      created_at: mysqlDatetime,
    }

    // Send emails
    try {
      await Promise.all([sendAdminNotification(booking), sendCustomerConfirmation(booking)])
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Booking received successfully",
      booking: {
        id: bookingId,
        ...bookingData,
        status: "pending",
        created_at: mysqlDatetime,
      },
      reference,
    })
  } catch (error) {
    console.error("Error processing booking:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your booking",
      },
      { status: 500 },
    )
  }
}
