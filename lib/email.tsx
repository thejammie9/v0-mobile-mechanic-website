import nodemailer from "nodemailer"
import type { Invoice, Quote } from "@/lib/db"
import { logEmail, getSiteSetting } from "@/lib/db"

// SMTP configuration from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

type BookingData = {
  name: string
  phone: string
  email: string
  vehicle: string
  issue: string
  preferredDate: string | null
  preferredTime: string | null
}

// Send notification to admin when new booking is received
export async function sendBookingNotification(booking: BookingData): Promise<boolean> {
  // Skip if SMTP is not configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("SMTP not configured - skipping admin notification")
    return false
  }

  const adminEmail = process.env.ADMIN_EMAIL || "appointments@jamiesautocare.com"
  const fromEmail = process.env.EMAIL_FROM || "appointments@jamiesautocare.com"

  const dateStr = booking.preferredDate || "Not specified"
  const timeStr = booking.preferredTime || "Not specified"

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: adminEmail,
      subject: `New Booking Request - ${booking.name} - ${booking.vehicle}`,
      text: `
NEW BOOKING REQUEST
====================

Customer Details:
- Name: ${booking.name}
- Phone: ${booking.phone}
- Email: ${booking.email}

Vehicle: ${booking.vehicle}

Issue Description:
${booking.issue}

Preferred Date: ${dateStr}
Preferred Time: ${timeStr}

---
Login to your admin dashboard to manage this booking.
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #1e3a5f; }
    .value { margin-left: 10px; }
    .issue-box { background: white; padding: 15px; border-left: 4px solid #f97316; margin-top: 10px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">New Booking Request</h1>
    </div>
    <div class="content">
      <div class="section">
        <h2 style="color:#1e3a5f; margin-top:0;">Customer Details</h2>
        <p><span class="label">Name:</span><span class="value">${booking.name}</span></p>
        <p><span class="label">Phone:</span><span class="value"><a href="tel:${booking.phone}">${booking.phone}</a></span></p>
        <p><span class="label">Email:</span><span class="value"><a href="mailto:${booking.email}">${booking.email}</a></span></p>
      </div>
      <div class="section">
        <h2 style="color:#1e3a5f;">Vehicle</h2>
        <p style="font-size: 18px; font-weight: bold;">${booking.vehicle}</p>
      </div>
      <div class="section">
        <h2 style="color:#1e3a5f;">Issue Description</h2>
        <div class="issue-box">${booking.issue.replace(/\n/g, "<br>")}</div>
      </div>
      <div class="section">
        <h2 style="color:#1e3a5f;">Preferred Appointment</h2>
        <p><span class="label">Date:</span><span class="value">${dateStr}</span></p>
        <p><span class="label">Time:</span><span class="value">${timeStr}</span></p>
      </div>
    </div>
    <div class="footer">
      <p>Login to your admin dashboard to manage this booking.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    })

    logEmail({ to_address: adminEmail, subject: `New Booking Request - ${booking.name}`, type: "booking_notification", status: "sent" })
    console.log("Admin notification email sent successfully")
    return true
  } catch (error) {
    logEmail({ to_address: adminEmail, subject: `New Booking Request - ${booking.name}`, type: "booking_notification", status: "failed", error: String(error) })
    console.error("Failed to send admin notification:", error)
    return false
  }
}

// Send confirmation email to customer
export async function sendCustomerConfirmation(booking: BookingData): Promise<boolean> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return false

  const fromEmail = process.env.EMAIL_FROM || "contact@jamiesautocare.com"
  const businessPhone = process.env.BUSINESS_PHONE || ""

  const subject = "We've Received Your Enquiry – Jamie's Auto Care"

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: booking.email,
      subject,
      text: `
Hi ${booking.name},

Thanks for getting in touch with Jamie's Auto Care.

I've received your contact form and will give you a call back by the end of the day to discuss your enquiry and get something booked in for you.

YOUR ENQUIRY
============
Vehicle: ${booking.vehicle}
Details: ${booking.issue}
${businessPhone ? `\nIf you need to reach me sooner, give me a call on ${businessPhone}.` : ""}

Speak soon,
Jamie
Jamie's Auto Care — Mobile Mechanic
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;color:#1f2937;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#1e3a5f;color:white;padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">Jamie's Auto Care</h1>
      ${businessPhone ? `<p style="margin:6px 0 0;opacity:0.85;font-size:13px;">${businessPhone}</p>` : ""}
    </div>

    <!-- Banner -->
    <div style="background:#f97316;color:white;padding:16px 36px;text-align:center;">
      <p style="margin:0;font-size:17px;font-weight:700;">📞 Enquiry Received — I'll Call You Today</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 36px;">
      <p style="margin:0 0 16px;font-size:15px;">Hi ${booking.name},</p>
      <p style="margin:0 0 16px;font-size:15px;">Thanks for getting in touch. I've received your enquiry and will give you a <strong>call back by the end of the day</strong> to discuss the job and get a date and time sorted for you.</p>

      <!-- Enquiry details -->
      <div style="background:#f0f4f8;border-radius:8px;padding:20px 24px;margin:24px 0;">
        <h2 style="margin:0 0 14px;font-size:14px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:0.05em;">Your Enquiry</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#6b7280;width:90px;vertical-align:top;">Vehicle</td>
            <td style="padding:6px 0;color:#374151;">${booking.vehicle}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;vertical-align:top;">Details</td>
            <td style="padding:6px 0;color:#374151;">${booking.issue}</td>
          </tr>
        </table>
      </div>

      ${businessPhone ? `<p style="margin:0;font-size:14px;color:#6b7280;">If you need to reach me sooner, feel free to call on <strong style="color:#1f2937;">${businessPhone}</strong>.</p>` : ""}

      <p style="margin:24px 0 0;font-size:15px;">Speak soon,<br><strong style="color:#f97316;">Jamie</strong><br><span style="font-size:13px;color:#6b7280;">Jamie's Auto Care — Mobile Mechanic</span></p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Jamie's Auto Care — Mobile Mechanic — Edinburgh &amp; Lothians</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    })

    logEmail({ to_address: booking.email, subject, type: "customer_confirmation", status: "sent" })
    return true
  } catch (error) {
    logEmail({ to_address: booking.email, subject, type: "customer_confirmation", status: "failed", error: String(error) })
    console.error("Failed to send callback confirmation:", error)
    return false
  }
}

// Send appointment confirmation email with cancellation link
// Step 1 email: sent immediately after booking — asks customer to confirm their slot
export async function sendAppointmentRequest(booking: {
  name: string
  email: string
  vehicle: string
  vehicle_reg?: string | null
  issue: string
  preferred_date: string
  preferred_time: string
  confirm_token: string
}): Promise<boolean> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return false

  const fromEmail = process.env.EMAIL_FROM || "contact@jamiesautocare.com"
  const businessPhone = process.env.BUSINESS_PHONE || ""
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jamiesautocare.com"
  const confirmUrl = `${siteUrl}/confirm/${booking.confirm_token}`

  const dateObj = new Date(booking.preferred_date + "T00:00:00")
  const friendlyDate = dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const [hour, minute] = booking.preferred_time.split(":").map(Number)
  const friendlyTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })

  const subject = `Please Confirm Your Appointment – ${friendlyDate} at ${friendlyTime}`

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: booking.email,
      subject,
      text: `
Hi ${booking.name},

Thanks for booking with Jamie's Auto Care!

I've reserved the following slot for you — please click the link below to confirm you're happy with it:

DATE:  ${friendlyDate}
TIME:  ${friendlyTime}
VEHICLE: ${booking.vehicle}${booking.vehicle_reg ? ` (${booking.vehicle_reg})` : ""}
JOB:   ${booking.issue}

Confirm your appointment here:
${confirmUrl}

If you need a different date or time, just reply to this email or give me a call on ${businessPhone}.

Speak soon,
Jamie
Jamie's Auto Care — Mobile Mechanic
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;color:#1f2937;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <div style="background:#1e3a5f;color:white;padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">Jamie's Auto Care</h1>
      ${businessPhone ? `<p style="margin:6px 0 0;opacity:0.85;font-size:13px;">${businessPhone}</p>` : ""}
    </div>

    <div style="background:#f97316;color:white;padding:16px 36px;text-align:center;">
      <p style="margin:0;font-size:17px;font-weight:700;">📅 Please Confirm Your Appointment</p>
    </div>

    <div style="padding:32px 36px;">
      <p style="margin:0 0 16px;font-size:15px;">Hi ${booking.name},</p>
      <p style="margin:0 0 20px;font-size:15px;">Thanks for booking! I've reserved the following slot for you. Please click the button below to confirm you're happy with it.</p>

      <div style="background:#f0f4f8;border-radius:8px;padding:20px 24px;margin-bottom:28px;">
        <h2 style="margin:0 0 14px;font-size:14px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:0.05em;">Your Booking</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr>
            <td style="padding:7px 0;color:#6b7280;width:90px;">Date</td>
            <td style="padding:7px 0;font-weight:700;color:#111827;font-size:15px;">${friendlyDate}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#6b7280;">Time</td>
            <td style="padding:7px 0;font-weight:700;color:#111827;font-size:15px;">${friendlyTime}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#6b7280;">Vehicle</td>
            <td style="padding:7px 0;color:#374151;">${booking.vehicle}${booking.vehicle_reg ? ` <span style="color:#6b7280;">(${booking.vehicle_reg})</span>` : ""}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#6b7280;vertical-align:top;">Job</td>
            <td style="padding:7px 0;color:#374151;">${booking.issue}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="${confirmUrl}" style="display:inline-block;background:#16a34a;color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">✓ Confirm My Appointment</a>
      </div>

      <p style="margin:0;font-size:14px;color:#6b7280;">Need a different date or time? Just reply to this email${businessPhone ? ` or call <strong style="color:#1f2937;">${businessPhone}</strong>` : ""} and I'll get it sorted.</p>

      <p style="margin:24px 0 0;font-size:15px;">Speak soon,<br><strong style="color:#f97316;">Jamie</strong><br><span style="font-size:13px;color:#6b7280;">Jamie's Auto Care — Mobile Mechanic</span></p>
    </div>

    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Jamie's Auto Care — Mobile Mechanic — Edinburgh &amp; Lothians</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    })
    logEmail({ to_address: booking.email, subject, type: "appointment_request", status: "sent" })
    return true
  } catch (error) {
    logEmail({ to_address: booking.email, subject, type: "appointment_request", status: "failed", error: String(error) })
    console.error("Failed to send appointment request email:", error)
    return false
  }
}

// Step 2 email: sent after customer clicks the confirm link
export async function sendAppointmentConfirmation(booking: {
  name: string
  email: string
  phone: string
  vehicle: string
  vehicle_reg?: string | null
  issue: string
  confirmed_date: string
  confirmed_time: string
  cancel_token: string
}): Promise<boolean> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return false

  const fromEmail = process.env.EMAIL_FROM || "contact@jamiesautocare.com"
  const businessPhone = process.env.BUSINESS_PHONE || ""
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jamiesautocare.com"
  const cancelUrl = `${siteUrl}/cancel/${booking.cancel_token}`

  const dateObj = new Date(booking.confirmed_date)
  const friendlyDate = dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const [hour, minute] = booking.confirmed_time.split(":").map(Number)
  const friendlyTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: booking.email,
      subject: `Appointment Confirmed – ${friendlyDate} at ${friendlyTime}`,
      text: `
Hi ${booking.name},

Your appointment with Jamie's Auto Care has been confirmed.

APPOINTMENT DETAILS
===================
Date: ${friendlyDate}
Time: ${friendlyTime}
Vehicle: ${booking.vehicle}${booking.vehicle_reg ? ` (${booking.vehicle_reg})` : ""}
Job: ${booking.issue}

CANCELLATION POLICY
===================
If you need to cancel, please do so at least 24 hours before your appointment.
Cancellations made less than 24 hours before the appointment may be subject to a call-out fee.

To cancel your appointment, visit:
${cancelUrl}

If you have any questions, please call us on ${businessPhone}.

Best regards,
Jamie's Auto Care
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;color:#1f2937;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#1e3a5f;color:white;padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">Jamie's Auto Care</h1>
      ${businessPhone ? `<p style="margin:6px 0 0;opacity:0.85;font-size:13px;">${businessPhone}</p>` : ""}
    </div>

    <!-- Confirmed banner -->
    <div style="background:#16a34a;color:white;padding:16px 36px;text-align:center;">
      <p style="margin:0;font-size:18px;font-weight:700;">✓ Appointment Confirmed</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 36px;">
      <p style="margin:0 0 20px;font-size:15px;">Hi ${booking.name},</p>
      <p style="margin:0 0 24px;font-size:15px;">Your appointment has been confirmed. We look forward to seeing you!</p>

      <!-- Appointment details box -->
      <div style="background:#f0f4f8;border-radius:8px;padding:20px 24px;margin-bottom:28px;">
        <h2 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:0.05em;">Appointment Details</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#6b7280;width:100px;">Date</td>
            <td style="padding:6px 0;font-weight:600;color:#111827;">${friendlyDate}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;">Time</td>
            <td style="padding:6px 0;font-weight:600;color:#111827;">${friendlyTime}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;">Vehicle</td>
            <td style="padding:6px 0;color:#374151;">${booking.vehicle}${booking.vehicle_reg ? ` <span style="color:#6b7280;">(${booking.vehicle_reg})</span>` : ""}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;vertical-align:top;">Job</td>
            <td style="padding:6px 0;color:#374151;">${booking.issue}</td>
          </tr>
        </table>
      </div>

      <!-- Cancellation policy -->
      <div style="border:1px solid #fde68a;background:#fffbeb;border-radius:8px;padding:18px 22px;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-weight:700;color:#92400e;font-size:14px;">⚠️ Cancellation Policy</p>
        <p style="margin:0 0 8px;font-size:14px;color:#78350f;">All appointments must be cancelled at least <strong>24 hours before</strong> the scheduled time. Cancellations made with less than 24 hours' notice may be subject to a <strong>call-out fee</strong>.</p>
        <p style="margin:0;font-size:14px;color:#78350f;">To cancel your appointment:</p>
        <a href="${cancelUrl}" style="display:inline-block;margin-top:12px;background:#dc2626;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Cancel Appointment</a>
      </div>

      <p style="margin:0;font-size:14px;color:#6b7280;">If you have any questions, please call us on <strong>${businessPhone}</strong>.</p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Jamie's Auto Care — Mobile Mechanic</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    })
    logEmail({ to_address: booking.email, subject: `Appointment Confirmed – ${friendlyDate} at ${friendlyTime}`, type: "appointment_confirmation", status: "sent" })
    console.log(`Appointment confirmation sent to ${booking.email}`)
    return true
  } catch (err) {
    logEmail({ to_address: booking.email, subject: `Appointment Confirmed`, type: "appointment_confirmation", status: "failed", error: String(err) })
    console.error("Failed to send appointment confirmation:", err)
    return false
  }
}

// Send cancellation emails — one to customer, one to admin
export async function sendCancellationEmails(booking: {
  name: string
  email: string
  phone: string
  vehicle: string
  vehicle_reg?: string | null
  confirmed_date: string
  confirmed_time: string
}): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return

  const fromEmail   = process.env.EMAIL_FROM  || "contact@jamiesautocare.com"
  const adminEmail  = process.env.ADMIN_EMAIL || "contact@jamiesautocare.com"
  const businessPhone = process.env.BUSINESS_PHONE || ""

  const dateObj    = new Date(booking.confirmed_date)
  const friendlyDate = dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const [h, m]     = booking.confirmed_time.split(":").map(Number)
  const friendlyTime = new Date(2000, 0, 1, h, m).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })

  const vehicleStr = `${booking.vehicle}${booking.vehicle_reg ? ` (${booking.vehicle_reg})` : ""}`

  // ── Customer email ──────────────────────────────────────────────────────────
  const customerHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;color:#1f2937;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
    <div style="background:#1e3a5f;color:white;padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">Jamie's Auto Care</h1>
      ${businessPhone ? `<p style="margin:6px 0 0;opacity:0.85;font-size:13px;">${businessPhone}</p>` : ""}
    </div>
    <div style="background:#dc2626;color:white;padding:14px 36px;text-align:center;">
      <p style="margin:0;font-size:17px;font-weight:700;">Appointment Cancelled</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="margin:0 0 16px;font-size:15px;">Hi ${booking.name},</p>
      <p style="margin:0 0 24px;font-size:15px;">Your appointment has been successfully cancelled. Here's a summary of what was booked:</p>
      <div style="background:#f0f4f8;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#6b7280;width:100px;">Date</td><td style="padding:6px 0;font-weight:600;color:#111827;">${friendlyDate}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;font-weight:600;color:#111827;">${friendlyTime}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Vehicle</td><td style="padding:6px 0;color:#374151;">${vehicleStr}</td></tr>
        </table>
      </div>
      <p style="margin:0 0 8px;font-size:14px;color:#4b5563;">If you'd like to rebook or have any questions, please get in touch${businessPhone ? ` at <strong>${businessPhone}</strong>` : ""}.</p>
      <p style="margin:24px 0 0;font-size:14px;color:#4b5563;">Best regards,<br><strong>Jamie's Auto Care</strong></p>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Jamie's Auto Care — Mobile Mechanic</p>
    </div>
  </div>
</body></html>`.trim()

  // ── Admin email ─────────────────────────────────────────────────────────────
  const adminHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;color:#1f2937;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
    <div style="background:#1e3a5f;color:white;padding:28px 36px;">
      <h1 style="margin:0;font-size:20px;font-weight:700;">Appointment Cancelled</h1>
      <p style="margin:6px 0 0;opacity:0.8;font-size:13px;">A customer has cancelled their appointment</p>
    </div>
    <div style="padding:28px 36px;">
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:18px 22px;margin-bottom:24px;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#6b7280;width:110px;">Customer</td><td style="padding:6px 0;font-weight:600;color:#111827;">${booking.name}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;color:#374151;"><a href="tel:${booking.phone}" style="color:#1e3a5f;">${booking.phone}</a></td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;color:#374151;"><a href="mailto:${booking.email}" style="color:#1e3a5f;">${booking.email}</a></td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Vehicle</td><td style="padding:6px 0;color:#374151;">${vehicleStr}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Was booked</td><td style="padding:6px 0;font-weight:600;color:#111827;">${friendlyDate} at ${friendlyTime}</td></tr>
        </table>
      </div>
      <p style="margin:0;font-size:13px;color:#6b7280;">The slot is now free. Log in to the admin dashboard to manage your schedule.</p>
    </div>
  </div>
</body></html>`.trim()

  await Promise.allSettled([
    transporter.sendMail({
      from:    `"Jamie's Auto Care" <${fromEmail}>`,
      to:      booking.email,
      subject: `Appointment Cancelled – ${friendlyDate} at ${friendlyTime}`,
      text:    `Hi ${booking.name},\n\nYour appointment on ${friendlyDate} at ${friendlyTime} for ${vehicleStr} has been successfully cancelled.\n\nIf you'd like to rebook, please get in touch${businessPhone ? ` on ${businessPhone}` : ""}.\n\nBest regards,\nJamie's Auto Care`,
      html:    customerHtml,
    }),
    transporter.sendMail({
      from:    `"Jamie's Auto Care" <${fromEmail}>`,
      to:      adminEmail,
      subject: `❌ Appointment Cancelled – ${booking.name} – ${friendlyDate}`,
      text:    `Appointment cancelled.\n\nCustomer: ${booking.name}\nPhone: ${booking.phone}\nEmail: ${booking.email}\nVehicle: ${vehicleStr}\nWas booked: ${friendlyDate} at ${friendlyTime}`,
      html:    adminHtml,
    }),
  ]).then(results => {
    results.forEach((r, i) => {
      const to = i === 0 ? booking.email : adminEmail
      const subject = i === 0 ? `Appointment Cancelled – ${friendlyDate}` : `Appointment Cancelled – ${booking.name}`
      if (r.status === "rejected") {
        logEmail({ to_address: to, subject, type: "cancellation", status: "failed", error: String(r.reason) })
        console.error(`Cancellation email ${i} failed:`, r.reason)
      } else {
        logEmail({ to_address: to, subject, type: "cancellation", status: "sent" })
        console.log(`Cancellation email ${i} sent`)
      }
    })
  })
}

// Confirm to a customer that their quote request has been received
export async function sendQuoteRequestConfirmation(booking: {
  name: string
  email: string
  vehicle: string
  issue: string
}): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !booking.email) return

  const fromEmail     = process.env.EMAIL_FROM     || "contact@jamiesautocare.com"
  const businessPhone = process.env.BUSINESS_PHONE || ""

  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;color:#1f2937;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
    <div style="background:#1e3a5f;color:white;padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">Jamie's Auto Care</h1>
      <p style="margin:6px 0 0;opacity:0.85;font-size:13px;">Mobile Mechanic — Edinburgh &amp; Lothians</p>
    </div>
    <div style="background:#1d4ed8;color:white;padding:14px 36px;text-align:center;">
      <p style="margin:0;font-size:17px;font-weight:700;">💬 Quote Request Received</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="margin:0 0 16px;font-size:15px;">Hi ${booking.name},</p>
      <p style="margin:0 0 20px;font-size:15px;">
        Thanks for getting in touch — I've received your quote request for your <strong>${booking.vehicle}</strong> and will get back to you with pricing as soon as possible.
      </p>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:18px 22px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:13px;color:#1e40af;font-weight:600;">What you described:</p>
        <p style="margin:0;font-size:14px;color:#1e3a5f;">${booking.issue}</p>
      </div>
      <p style="margin:0 0 8px;font-size:14px;color:#4b5563;">
        ${businessPhone ? `If you'd like to discuss it sooner, give me a call on <strong>${businessPhone}</strong>.` : "I'll be in touch shortly with a full price breakdown."}
      </p>
      <p style="margin:24px 0 0;font-size:14px;color:#4b5563;">Best regards,<br><strong>Jamie's Auto Care</strong></p>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Jamie's Auto Care — Mobile Mechanic, Edinburgh &amp; Lothians</p>
    </div>
  </div>
</body></html>`.trim()

  try {
    await transporter.sendMail({
      from:    `"Jamie's Auto Care" <${fromEmail}>`,
      to:      booking.email,
      subject: `Quote Request Received — ${booking.vehicle}`,
      text:    `Hi ${booking.name},\n\nThanks for your quote request for your ${booking.vehicle}. I'll get back to you with pricing shortly.\n\n${businessPhone ? `To discuss sooner, call me on ${businessPhone}.\n\n` : ""}Best regards,\nJamie's Auto Care`,
      html,
    })
    logEmail({ to_address: booking.email, subject: `Quote Request Received — ${booking.vehicle}`, type: "quote_request", status: "sent" })
  } catch (err) {
    logEmail({ to_address: booking.email, subject: `Quote Request Received — ${booking.vehicle}`, type: "quote_request", status: "failed", error: String(err) })
    console.error("Failed to send quote request confirmation:", err)
  }
}

// Notify customer that their unconfirmed slot was auto-released after 30 minutes
export async function sendAutoExpiredEmail(booking: {
  name: string
  email: string
  vehicle: string
  preferred_date: string
  preferred_time: string
}): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !booking.email) return

  const fromEmail     = process.env.EMAIL_FROM     || "contact@jamiesautocare.com"
  const businessPhone = process.env.BUSINESS_PHONE || ""
  const siteUrl       = process.env.NEXT_PUBLIC_SITE_URL || "https://jamiesautocare.com"

  const dateObj      = new Date(booking.preferred_date + "T00:00:00")
  const friendlyDate = dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const [h, m]       = booking.preferred_time.split(":").map(Number)
  const friendlyTime = new Date(2000, 0, 1, h, m).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })

  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;color:#1f2937;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
    <div style="background:#1e3a5f;color:white;padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">Jamie's Auto Care</h1>
      <p style="margin:6px 0 0;opacity:0.85;font-size:13px;">Mobile Mechanic — Edinburgh &amp; Lothians</p>
    </div>
    <div style="background:#b45309;color:white;padding:14px 36px;text-align:center;">
      <p style="margin:0;font-size:17px;font-weight:700;">⏰ Slot Released — Not Confirmed in Time</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="margin:0 0 16px;font-size:15px;">Hi ${booking.name},</p>
      <p style="margin:0 0 20px;font-size:15px;">
        Your booking request for <strong>${friendlyDate} at ${friendlyTime}</strong> was not confirmed within 30 minutes, so the slot has been automatically released.
      </p>
      <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:18px 22px;margin-bottom:24px;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:5px 0;color:#92400e;width:90px;">Vehicle</td><td style="padding:5px 0;font-weight:600;color:#78350f;">${booking.vehicle}</td></tr>
          <tr><td style="padding:5px 0;color:#92400e;">Date</td><td style="padding:5px 0;font-weight:600;color:#78350f;">${friendlyDate}</td></tr>
          <tr><td style="padding:5px 0;color:#92400e;">Time</td><td style="padding:5px 0;font-weight:600;color:#78350f;">${friendlyTime}</td></tr>
        </table>
      </div>
      <p style="margin:0 0 20px;font-size:14px;color:#4b5563;">
        If you'd still like to book, please submit a new request and we'll be happy to help.
        ${businessPhone ? `You can also call us directly on <strong>${businessPhone}</strong>.` : ""}
      </p>
      <div style="text-align:center;margin-bottom:8px;">
        <a href="${siteUrl}/#booking" style="display:inline-block;background:#ea580c;color:white;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">Book Again</a>
      </div>
      <p style="margin:24px 0 0;font-size:14px;color:#4b5563;">Best regards,<br><strong>Jamie's Auto Care</strong></p>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Jamie's Auto Care — Mobile Mechanic, Edinburgh &amp; Lothians</p>
    </div>
  </div>
</body></html>`.trim()

  try {
    await transporter.sendMail({
      from:    `"Jamie's Auto Care" <${fromEmail}>`,
      to:      booking.email,
      subject: `Booking Slot Released — ${friendlyDate} at ${friendlyTime}`,
      text:    `Hi ${booking.name},\n\nYour booking slot for ${friendlyDate} at ${friendlyTime} (${booking.vehicle}) was not confirmed within 30 minutes and has been automatically released.\n\nTo rebook, please visit ${siteUrl}/#booking${businessPhone ? ` or call us on ${businessPhone}` : ""}.\n\nBest regards,\nJamie's Auto Care`,
      html,
    })
    logEmail({ to_address: booking.email, subject: `Booking Slot Released — ${friendlyDate}`, type: "auto_expired", status: "sent" })
  } catch (err) {
    logEmail({ to_address: booking.email, subject: `Booking Slot Released — ${friendlyDate}`, type: "auto_expired", status: "failed", error: String(err) })
    console.error("Failed to send auto-expired email:", err)
  }
}

// Send a service reminder email to a customer
export async function sendServiceReminderEmail(customer: {
  name: string
  email: string
  vehicle?: string | null
}): Promise<boolean> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return false

  const fromEmail     = process.env.EMAIL_FROM    || "contact@jamiesautocare.com"
  const businessPhone = process.env.BUSINESS_PHONE || ""
  const siteUrl       = process.env.NEXT_PUBLIC_SITE_URL || "https://jamiesautocare.com"
  const bookingUrl    = `${siteUrl}/#booking`

  const vehicleLine = customer.vehicle
    ? `<p style="margin:4px 0 0;color:#4b5563;">Vehicle: <strong>${customer.vehicle}</strong></p>`
    : ""

  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;color:#1f2937;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <div style="background:#1e3a5f;color:white;padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">Jamie's Auto Care</h1>
      ${businessPhone ? `<p style="margin:6px 0 0;opacity:0.85;font-size:13px;">${businessPhone}</p>` : ""}
    </div>

    <div style="background:#f97316;color:white;padding:14px 36px;text-align:center;">
      <p style="margin:0;font-size:17px;font-weight:700;">Your Annual Service is Due</p>
    </div>

    <div style="padding:32px 36px;">
      <p style="margin:0 0 16px;font-size:15px;">Hi ${customer.name},</p>
      <p style="margin:0 0 20px;font-size:15px;">
        It's been around 10 months since your last service with Jamie's Auto Care — which means your annual service is coming up soon!
      </p>

      ${customer.vehicle || vehicleLine ? `
      <div style="background:#f0f4f8;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Vehicle on file</p>
        ${vehicleLine || `<p style="margin:4px 0 0;color:#1f2937;">${customer.vehicle}</p>`}
      </div>` : ""}

      <p style="margin:0 0 16px;font-size:14px;color:#4b5563;">
        Regular servicing keeps your vehicle running safely and efficiently, and can help avoid costly breakdowns down the line. We come to you — no need to drop your car off at a garage.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${bookingUrl}" style="background:#f97316;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
          Book Your Service
        </a>
      </div>

      <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">
        If you'd prefer to chat first, give us a call${businessPhone ? ` on <strong>${businessPhone}</strong>` : ""} and we'll be happy to help.
      </p>

      <p style="margin:24px 0 0;font-size:14px;color:#4b5563;">
        Best regards,<br>
        <strong style="color:#f97316;">Jamie's Auto Care</strong><br>
        Edinburgh's Trusted Mobile Mechanic
      </p>
    </div>

    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">
        You're receiving this because you opted in to annual service reminders.<br>
        To unsubscribe, reply to this email and we'll remove you from the list.
      </p>
    </div>
  </div>
</body></html>`.trim()

  const text = `
Hi ${customer.name},

It's been around 10 months since your last service with Jamie's Auto Care — which means your annual service is coming up soon!
${customer.vehicle ? `\nVehicle on file: ${customer.vehicle}\n` : ""}
Regular servicing keeps your vehicle running safely and efficiently, and can help avoid costly breakdowns.

Book your service at: ${bookingUrl}

Or give us a call${businessPhone ? ` on ${businessPhone}` : ""} and we'll be happy to help.

Best regards,
Jamie's Auto Care
Edinburgh's Trusted Mobile Mechanic

---
You're receiving this because you opted in to annual service reminders.
To unsubscribe, reply to this email.
  `.trim()

  try {
    await transporter.sendMail({
      from:    `"Jamie's Auto Care" <${fromEmail}>`,
      to:      customer.email,
      subject: "Your Annual Vehicle Service is Due — Jamie's Auto Care",
      text,
      html,
    })
    logEmail({ to_address: customer.email, subject: "Your Annual Vehicle Service is Due — Jamie's Auto Care", type: "service_reminder", status: "sent" })
    console.log(`Service reminder sent to ${customer.email}`)
    return true
  } catch (err) {
    logEmail({ to_address: customer.email, subject: "Your Annual Vehicle Service is Due", type: "service_reminder", status: "failed", error: String(err) })
    console.error("Failed to send service reminder:", err)
    return false
  }
}

type LabourItem = {
  description: string
  hours: number
  rate: number
}

type PartsItem = {
  description: string
  qty: number
  unitPrice: number
}

// Send professional invoice email to customer
export async function sendInvoiceEmail(invoice: Invoice, customMessage?: string | null): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return { success: false, error: "SMTP not configured" }
  }

  const fromEmail = process.env.EMAIL_FROM || "invoices@jamiesautocare.com"
  const businessPhone = process.env.BUSINESS_PHONE || ""
  const businessAddress = process.env.BUSINESS_ADDRESS || ""

  let labourItems: LabourItem[] = []
  let partsItems: PartsItem[] = []

  try {
    labourItems = JSON.parse(invoice.labour_items || "[]")
  } catch {}
  try {
    partsItems = JSON.parse(invoice.parts_items || "[]")
  } catch {}

  const labourSubtotal = labourItems.reduce((sum, item) => sum + item.hours * item.rate, 0)
  const partsSubtotal = partsItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  const discountPct = invoice.labour_discount ?? 0
  const labourDiscountAmount = labourSubtotal * (discountPct / 100)
  const subtotal = (labourSubtotal - labourDiscountAmount) + partsSubtotal
  const vatAmount = invoice.vat_enabled ? (subtotal * invoice.vat_rate) / 100 : 0
  const total = subtotal + vatAmount

  const fmt = (n: number) => `£${n.toFixed(2)}`

  const labourGuarantee = getSiteSetting("labour_guarantee") || "14 days"
  const partsWarranty = getSiteSetting("parts_warranty") || "12,000 miles or 12 months (whichever comes first)"

  const invoiceDate = new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const labourRowsHtml = labourItems.length > 0
    ? labourItems.map(item => `
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb;">${item.description}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:center;">${item.hours}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right;">${fmt(item.rate)}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right;">${fmt(item.hours * item.rate)}</td>
        </tr>`).join("")
    : `<tr><td colspan="4" style="padding:10px 12px; color:#6b7280; font-style:italic;">No labour items</td></tr>`

  const partsRowsHtml = partsItems.length > 0
    ? partsItems.map(item => `
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb;">${item.description}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:center;">${item.qty}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right;">${fmt(item.unitPrice)}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right;">${fmt(item.qty * item.unitPrice)}</td>
        </tr>`).join("")
    : `<tr><td colspan="4" style="padding:10px 12px; color:#6b7280; font-style:italic;">No parts items</td></tr>`

  // Health report PDF attachment
  const fs = require("fs")
  const pathMod = require("path")
  let healthReportAttachment: { filename: string; path: string } | null = null
  if (invoice.health_report) {
    const hrPath = pathMod.join(process.cwd(), "data", "health-reports", invoice.health_report)
    if (fs.existsSync(hrPath)) {
      healthReportAttachment = { filename: "vehicle-health-report.pdf", path: hrPath }
    }
  }
  const healthReportHtml = healthReportAttachment ? `
    <!-- Vehicle Health Report notice -->
    <div style="padding:20px 40px 0;">
      <div style="background:#f0f4f8; border-left:4px solid #1e3a5f; border-radius:4px; padding:14px 18px;">
        <p style="margin:0; font-size:13px; color:#374151;"><strong>Vehicle Health Report</strong> — see attached PDF for your full diagnostic report.</p>
      </div>
    </div>` : ""

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoice_number}</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f3f4f6; color:#1f2937;">
  <div style="max-width:680px; margin:30px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#1e3a5f; color:white; padding:32px 40px; display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h1 style="margin:0; font-size:26px; font-weight:700;">Jamie's Auto Care</h1>
        ${businessPhone ? `<p style="margin:6px 0 0; opacity:0.85; font-size:13px;">${businessPhone}</p>` : ""}
        ${businessAddress ? `<p style="margin:6px 0 0; opacity:0.8; font-size:12px; white-space:pre-line;">${businessAddress}</p>` : ""}
      </div>
      <div style="text-align:right;">
        <div style="font-size:22px; font-weight:700; letter-spacing:1px;">INVOICE</div>
        <div style="font-size:15px; margin-top:4px; opacity:0.9;">${invoice.invoice_number}</div>
        <div style="font-size:13px; margin-top:2px; opacity:0.75;">${invoiceDate}</div>
      </div>
    </div>

    <!-- Customer details -->
    <div style="padding:28px 40px; border-bottom:1px solid #e5e7eb;">
      <h2 style="margin:0 0 14px; font-size:14px; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Bill To</h2>
      <p style="margin:0; font-size:17px; font-weight:600; color:#111827;">${invoice.customer_name}</p>
      ${invoice.customer_email ? `<p style="margin:4px 0 0; color:#4b5563;">${invoice.customer_email}</p>` : ""}
      ${invoice.customer_phone ? `<p style="margin:4px 0 0; color:#4b5563;">${invoice.customer_phone}</p>` : ""}
      ${invoice.customer_address ? `<p style="margin:4px 0 0; color:#4b5563; white-space:pre-line;">${invoice.customer_address}</p>` : ""}
      ${invoice.vehicle ? `<p style="margin:8px 0 0; color:#4b5563;"><strong>Vehicle:</strong> ${invoice.vehicle}</p>` : ""}
      ${invoice.mileage ? `<p style="margin:4px 0 0; color:#4b5563;"><strong>Mileage at service:</strong> ${invoice.mileage.toLocaleString()} miles</p>` : ""}
    </div>

    <!-- Labour table -->
    <div style="padding:28px 40px 0;">
      <h3 style="margin:0 0 12px; font-size:15px; font-weight:600; color:#1e3a5f;">Labour</h3>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr style="background:#f0f4f8;">
            <th style="padding:10px 12px; text-align:left; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Description</th>
            <th style="padding:10px 12px; text-align:center; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Hours</th>
            <th style="padding:10px 12px; text-align:right; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Rate/hr</th>
            <th style="padding:10px 12px; text-align:right; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${labourRowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:10px 12px; text-align:right; font-weight:600; color:#374151;">Labour Subtotal</td>
            <td style="padding:10px 12px; text-align:right; font-weight:600;">${fmt(labourSubtotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Parts table -->
    <div style="padding:20px 40px 0;">
      <h3 style="margin:0 0 12px; font-size:15px; font-weight:600; color:#1e3a5f;">Parts &amp; Materials</h3>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr style="background:#f0f4f8;">
            <th style="padding:10px 12px; text-align:left; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Description</th>
            <th style="padding:10px 12px; text-align:center; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Qty</th>
            <th style="padding:10px 12px; text-align:right; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Unit Price</th>
            <th style="padding:10px 12px; text-align:right; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${partsRowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:10px 12px; text-align:right; font-weight:600; color:#374151;">Parts Subtotal</td>
            <td style="padding:10px 12px; text-align:right; font-weight:600;">${fmt(partsSubtotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Totals -->
    <div style="padding:20px 40px; margin:0 40px; border-top:2px solid #e5e7eb;">
      <table style="width:100%; font-size:15px;">
        <tr>
          <td style="padding:6px 0; color:#6b7280;">Labour Subtotal</td>
          <td style="padding:6px 0; text-align:right;">${fmt(labourSubtotal)}</td>
        </tr>
        ${discountPct > 0 ? `
        <tr>
          <td style="padding:6px 0; color:#d97706;">Labour Discount (${discountPct}%)</td>
          <td style="padding:6px 0; text-align:right; color:#d97706;">−${fmt(labourDiscountAmount)}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:6px 0; color:#6b7280;">Parts Subtotal</td>
          <td style="padding:6px 0; text-align:right;">${fmt(partsSubtotal)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#6b7280; border-top:1px solid #e5e7eb;">Subtotal</td>
          <td style="padding:6px 0; text-align:right; border-top:1px solid #e5e7eb;">${fmt(subtotal)}</td>
        </tr>
        ${invoice.vat_enabled ? `
        <tr>
          <td style="padding:6px 0; color:#6b7280;">VAT (${invoice.vat_rate}%)</td>
          <td style="padding:6px 0; text-align:right;">${fmt(vatAmount)}</td>
        </tr>` : ""}
        <tr style="border-top:2px solid #1e3a5f;">
          <td style="padding:12px 0 6px; font-size:18px; font-weight:700; color:#1e3a5f;">Total Due</td>
          <td style="padding:12px 0 6px; text-align:right; font-size:18px; font-weight:700; color:#1e3a5f;">${fmt(total)}</td>
        </tr>
      </table>
    </div>

    ${invoice.notes ? `
    <!-- Notes -->
    <div style="padding:0 40px 20px;">
      <h3 style="margin:0 0 8px; font-size:14px; font-weight:600; color:#374151;">Notes</h3>
      <p style="margin:0; color:#6b7280; font-size:14px; white-space:pre-line;">${invoice.notes}</p>
    </div>` : ""}

    ${healthReportHtml}

    ${customMessage ? `
    <!-- Custom message from Jamie -->
    <div style="padding:0 40px 24px;">
      <div style="background:#f0f4f8; border-left:4px solid #1e3a5f; border-radius:4px; padding:16px 20px;">
        <p style="margin:0 0 6px; font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em;">Message from Jamie</p>
        <p style="margin:0; color:#374151; font-size:14px; white-space:pre-line;">${customMessage}</p>
      </div>
    </div>` : ""}

    <!-- Warranty -->
    <div style="padding:0 40px 20px;">
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:14px 18px;">
        <p style="margin:0 0 4px; font-size:12px; font-weight:700; color:#15803d; text-transform:uppercase; letter-spacing:0.05em;">Warranty</p>
        <p style="margin:0 0 4px; font-size:13px; color:#374151;"><strong>Labour:</strong> ${labourGuarantee} from date of service</p>
        <p style="margin:0; font-size:13px; color:#374151;"><strong>Parts:</strong> ${partsWarranty}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:24px 40px; text-align:center;">
      <p style="margin:0; font-size:16px; font-weight:600; color:#1e3a5f;">Thank you for your business!</p>
      <p style="margin:8px 0 0; font-size:13px; color:#9ca3af;">Payment is due on the day of service. If paid by card on the day, this invoice serves as your receipt.</p>
      <p style="margin:8px 0 0; font-size:12px; color:#9ca3af;">Jamie's Auto Care</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  const textBody = `
Invoice ${invoice.invoice_number} from Jamie's Auto Care
Date: ${invoiceDate}

Bill To: ${invoice.customer_name}
${invoice.customer_email}
${invoice.customer_phone || ""}
${invoice.customer_address || ""}
${invoice.vehicle ? `Vehicle: ${invoice.vehicle}` : ""}
${invoice.mileage ? `Mileage at service: ${invoice.mileage.toLocaleString()} miles` : ""}
--- LABOUR ---
${labourItems.map(i => `${i.description}: ${i.hours} hrs @ ${fmt(i.rate)}/hr = ${fmt(i.hours * i.rate)}`).join("\n") || "None"}
Labour Subtotal: ${fmt(labourSubtotal)}
${discountPct > 0 ? `Labour Discount (${discountPct}%): −${fmt(labourDiscountAmount)}\n` : ""}
--- PARTS ---
${partsItems.map(i => `${i.description}: ${i.qty} x ${fmt(i.unitPrice)} = ${fmt(i.qty * i.unitPrice)}`).join("\n") || "None"}
Parts Subtotal: ${fmt(partsSubtotal)}

Subtotal: ${fmt(subtotal)}
${invoice.vat_enabled ? `VAT (${invoice.vat_rate}%): ${fmt(vatAmount)}\n` : ""}Total Due: ${fmt(total)}

${invoice.notes ? `Notes:\n${invoice.notes}\n` : ""}${healthReportAttachment ? "Vehicle Health Report: see attached PDF.\n\n" : ""}WARRANTY
Labour: ${labourGuarantee} from date of service
Parts: ${partsWarranty}

Payment is due on the day of service. If paid by card on the day, this invoice serves as your receipt.
Thank you for your business!
  `.trim()

  // Generate PDF from the same HTML
  let invoicePdfBuffer: Buffer | null = null
  try {
    const { htmlToPdfBuffer } = await import("@/lib/pdf")
    invoicePdfBuffer = await htmlToPdfBuffer(html)
  } catch (err) {
    console.warn("PDF generation failed (will send without attachment):", err)
  }

  const attachments: { filename: string; content?: Buffer; path?: string }[] = []
  if (invoicePdfBuffer) {
    attachments.push({ filename: `Invoice-${invoice.invoice_number}.pdf`, content: invoicePdfBuffer })
  }
  if (healthReportAttachment) {
    attachments.push({ filename: "vehicle-health-report.pdf", path: healthReportAttachment.path })
  }

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: invoice.customer_email,
      subject: `Invoice ${invoice.invoice_number} from Jamie's Auto Care`,
      text: textBody,
      html,
      ...(attachments.length > 0 ? { attachments } : {}),
    })
    logEmail({ to_address: invoice.customer_email, subject: `Invoice ${invoice.invoice_number} from Jamie's Auto Care`, type: "invoice", status: "sent" })
    console.log(`Invoice email sent to ${invoice.customer_email}`)
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    logEmail({ to_address: invoice.customer_email, subject: `Invoice ${invoice.invoice_number}`, type: "invoice", status: "failed", error: msg })
    console.error("Failed to send invoice email:", error)
    return { success: false, error: msg }
  }
}

// Send professional quote email to customer
export async function sendQuoteEmail(quote: Quote, confirmUrl?: string | null, customMessage?: string | null): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return { success: false, error: "SMTP not configured" }
  }

  const fromEmail = process.env.EMAIL_FROM || "quotes@jamiesautocare.com"
  const businessPhone = process.env.BUSINESS_PHONE || ""
  const businessAddress = process.env.BUSINESS_ADDRESS || ""

  let labourItems: { description: string; hours: number; rate: number }[] = []
  let partsItems: { description: string; qty: number; unitPrice: number }[] = []

  try { labourItems = JSON.parse(quote.labour_items || "[]") } catch {}
  try { partsItems = JSON.parse(quote.parts_items || "[]") } catch {}

  const labourSubtotal = labourItems.reduce((sum, item) => sum + item.hours * item.rate, 0)
  const partsSubtotal = partsItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  const subtotal = labourSubtotal + partsSubtotal
  const vatAmount = quote.vat_enabled ? (subtotal * quote.vat_rate) / 100 : 0
  const total = subtotal + vatAmount

  const fmt = (n: number) => `£${n.toFixed(2)}`

  const quoteDate = new Date(quote.invoice_date || quote.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const labourRowsHtml = labourItems.length > 0
    ? labourItems.map(item => `
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb;">${item.description}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:center;">${item.hours}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right;">${fmt(item.rate)}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right;">${fmt(item.hours * item.rate)}</td>
        </tr>`).join("")
    : `<tr><td colspan="4" style="padding:10px 12px; color:#6b7280; font-style:italic;">No labour items</td></tr>`

  const partsRowsHtml = partsItems.length > 0
    ? partsItems.map(item => `
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb;">${item.description}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:center;">${item.qty}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right;">${fmt(item.unitPrice)}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; text-align:right;">${fmt(item.qty * item.unitPrice)}</td>
        </tr>`).join("")
    : `<tr><td colspan="4" style="padding:10px 12px; color:#6b7280; font-style:italic;">No parts items</td></tr>`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quote ${quote.quote_number}</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f3f4f6; color:#1f2937;">
  <div style="max-width:680px; margin:30px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#1e3a5f; color:white; padding:32px 40px; display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h1 style="margin:0; font-size:26px; font-weight:700;">Jamie's Auto Care</h1>
        ${businessPhone ? `<p style="margin:6px 0 0; opacity:0.85; font-size:13px;">${businessPhone}</p>` : ""}
        ${businessAddress ? `<p style="margin:6px 0 0; opacity:0.8; font-size:12px; white-space:pre-line;">${businessAddress}</p>` : ""}
      </div>
      <div style="text-align:right;">
        <div style="font-size:22px; font-weight:700; letter-spacing:1px;">QUOTE</div>
        <div style="font-size:15px; margin-top:4px; opacity:0.9;">${quote.quote_number}</div>
        <div style="font-size:13px; margin-top:2px; opacity:0.75;">${quoteDate}</div>
      </div>
    </div>

    <!-- Customer details -->
    <div style="padding:28px 40px; border-bottom:1px solid #e5e7eb;">
      <h2 style="margin:0 0 14px; font-size:14px; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Prepared For</h2>
      <p style="margin:0; font-size:17px; font-weight:600; color:#111827;">${quote.customer_name}</p>
      ${quote.customer_email ? `<p style="margin:4px 0 0; color:#4b5563;">${quote.customer_email}</p>` : ""}
      ${quote.customer_phone ? `<p style="margin:4px 0 0; color:#4b5563;">${quote.customer_phone}</p>` : ""}
      ${quote.customer_address ? `<p style="margin:4px 0 0; color:#4b5563; white-space:pre-line;">${quote.customer_address}</p>` : ""}
      ${quote.vehicle ? `<p style="margin:8px 0 0; color:#4b5563;"><strong>Vehicle:</strong> ${quote.vehicle}</p>` : ""}
    </div>

    <!-- Labour table -->
    <div style="padding:28px 40px 0;">
      <h3 style="margin:0 0 12px; font-size:15px; font-weight:600; color:#1e3a5f;">Labour</h3>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr style="background:#f0f4f8;">
            <th style="padding:10px 12px; text-align:left; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Description</th>
            <th style="padding:10px 12px; text-align:center; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Hours</th>
            <th style="padding:10px 12px; text-align:right; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Rate/hr</th>
            <th style="padding:10px 12px; text-align:right; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Amount</th>
          </tr>
        </thead>
        <tbody>${labourRowsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:10px 12px; text-align:right; font-weight:600; color:#374151;">Labour Subtotal</td>
            <td style="padding:10px 12px; text-align:right; font-weight:600;">${fmt(labourSubtotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Parts table -->
    <div style="padding:20px 40px 0;">
      <h3 style="margin:0 0 12px; font-size:15px; font-weight:600; color:#1e3a5f;">Parts &amp; Materials</h3>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr style="background:#f0f4f8;">
            <th style="padding:10px 12px; text-align:left; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Description</th>
            <th style="padding:10px 12px; text-align:center; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Qty</th>
            <th style="padding:10px 12px; text-align:right; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Unit Price</th>
            <th style="padding:10px 12px; text-align:right; color:#374151; font-weight:600; border-bottom:2px solid #d1d5db;">Amount</th>
          </tr>
        </thead>
        <tbody>${partsRowsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:10px 12px; text-align:right; font-weight:600; color:#374151;">Parts Subtotal</td>
            <td style="padding:10px 12px; text-align:right; font-weight:600;">${fmt(partsSubtotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Totals -->
    <div style="padding:20px 40px; margin:0 40px; border-top:2px solid #e5e7eb;">
      <table style="width:100%; font-size:15px;">
        <tr>
          <td style="padding:6px 0; color:#6b7280;">Subtotal</td>
          <td style="padding:6px 0; text-align:right;">${fmt(subtotal)}</td>
        </tr>
        ${quote.vat_enabled ? `
        <tr>
          <td style="padding:6px 0; color:#6b7280;">VAT (${quote.vat_rate}%)</td>
          <td style="padding:6px 0; text-align:right;">${fmt(vatAmount)}</td>
        </tr>` : ""}
        <tr style="border-top:2px solid #1e3a5f;">
          <td style="padding:12px 0 6px; font-size:18px; font-weight:700; color:#1e3a5f;">Quote Total</td>
          <td style="padding:12px 0 6px; text-align:right; font-size:18px; font-weight:700; color:#1e3a5f;">${fmt(total)}</td>
        </tr>
      </table>
    </div>

    ${quote.notes ? `
    <!-- Notes -->
    <div style="padding:0 40px 20px;">
      <h3 style="margin:0 0 8px; font-size:14px; font-weight:600; color:#374151;">Notes</h3>
      <p style="margin:0; color:#6b7280; font-size:14px; white-space:pre-line;">${quote.notes}</p>
    </div>` : ""}

    ${customMessage ? `
    <!-- Custom message from Jamie -->
    <div style="padding:0 40px 24px;">
      <div style="background:#f0f4f8; border-left:4px solid #1e3a5f; border-radius:4px; padding:16px 20px;">
        <p style="margin:0 0 6px; font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em;">Message from Jamie</p>
        <p style="margin:0; color:#374151; font-size:14px; white-space:pre-line;">${customMessage}</p>
      </div>
    </div>` : ""}

    ${confirmUrl ? `
    <!-- Accept quote CTA -->
    <div style="padding:0 40px 32px; text-align:center;">
      <p style="margin:0 0 16px; font-size:15px; color:#374151;">Happy with this quote? Accept it online and choose a date that works for you.</p>
      <a href="${confirmUrl}" style="display:inline-block; background:#16a34a; color:white; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:700; font-size:16px; letter-spacing:0.02em;">
        ✓ Accept This Quote &amp; Book
      </a>
      <p style="margin:12px 0 0; font-size:12px; color:#9ca3af;">Or call us on ${businessPhone} to discuss further.</p>
    </div>` : ""}

    <!-- Footer -->
    <div style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:24px 40px; text-align:center;">
      <p style="margin:0; font-size:16px; font-weight:600; color:#1e3a5f;">Thank you for considering Jamie's Auto Care!</p>
      <p style="margin:8px 0 0; font-size:13px; color:#9ca3af;">This quote is valid for 30 days.${confirmUrl ? "" : " To accept, please contact us."}</p>
      <p style="margin:8px 0 0; font-size:12px; color:#9ca3af;">Jamie's Auto Care${businessPhone ? ` — ${businessPhone}` : ""}</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  const textBody = `
Quote ${quote.quote_number} from Jamie's Auto Care
Date: ${quoteDate}

Prepared For: ${quote.customer_name}
${quote.customer_email}
${quote.customer_phone || ""}
${quote.customer_address || ""}
${quote.vehicle ? `Vehicle: ${quote.vehicle}` : ""}

--- LABOUR ---
${labourItems.map(i => `${i.description}: ${i.hours} hrs @ ${fmt(i.rate)}/hr = ${fmt(i.hours * i.rate)}`).join("\n") || "None"}
Labour Subtotal: ${fmt(labourSubtotal)}

--- PARTS ---
${partsItems.map(i => `${i.description}: ${i.qty} x ${fmt(i.unitPrice)} = ${fmt(i.qty * i.unitPrice)}`).join("\n") || "None"}
Parts Subtotal: ${fmt(partsSubtotal)}

Subtotal: ${fmt(subtotal)}
${quote.vat_enabled ? `VAT (${quote.vat_rate}%): ${fmt(vatAmount)}\n` : ""}Quote Total: ${fmt(total)}

${quote.notes ? `Notes:\n${quote.notes}\n` : ""}
This quote is valid for 30 days. To accept, please contact us.
  `.trim()

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: quote.customer_email,
      subject: `Quote ${quote.quote_number} from Jamie's Auto Care`,
      text: textBody,
      html,
    })
    logEmail({ to_address: quote.customer_email, subject: `Quote ${quote.quote_number} from Jamie's Auto Care`, type: "quote", status: "sent" })
    console.log(`Quote email sent to ${quote.customer_email}`)
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    logEmail({ to_address: quote.customer_email, subject: `Quote ${quote.quote_number}`, type: "quote", status: "failed", error: msg })
    console.error("Failed to send quote email:", error)
    return { success: false, error: msg }
  }
}

// Send a review request email to a customer (Trustpilot)
export async function sendReviewRequestEmail(customer: { name: string; email: string }): Promise<boolean> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return false
  const fromEmail = process.env.EMAIL_FROM || "contact@jamiesautocare.com"
  const businessPhone = process.env.BUSINESS_PHONE || ""

  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;color:#1f2937;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
    <div style="background:#1e3a5f;color:white;padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">Jamie's Auto Care</h1>
      ${businessPhone ? `<p style="margin:6px 0 0;opacity:0.85;font-size:13px;">${businessPhone}</p>` : ""}
    </div>
    <div style="background:#00b67a;color:white;padding:14px 36px;text-align:center;">
      <p style="margin:0;font-size:17px;font-weight:700;">How was your experience?</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="margin:0 0 16px;font-size:15px;">Hi ${customer.name},</p>
      <p style="margin:0 0 16px;font-size:15px;">
        Thank you for choosing Jamie's Auto Care! We hope everything went smoothly and your vehicle is running great.
      </p>
      <p style="margin:0 0 24px;font-size:15px;">
        If you had a positive experience, we'd love it if you could take a moment to leave us a review on Trustpilot. It only takes a minute and really helps other customers find us.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://ie.trustpilot.com/evaluate/jamiesautocare.com"
          style="background:#00b67a;color:white;padding:16px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">
          Leave a Review on Trustpilot
        </a>
      </div>
      <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">
        If there was anything we could have done better, please reply to this email and let us know. Your feedback helps us improve.
      </p>
      <p style="margin:24px 0 0;font-size:14px;color:#4b5563;">
        Best regards,<br>
        <strong style="color:#f97316;">Jamie's Auto Care</strong><br>
        Edinburgh's Trusted Mobile Mechanic
      </p>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Jamie's Auto Care — Mobile Mechanic</p>
    </div>
  </div>
</body></html>`.trim()

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: customer.email,
      subject: "How was your experience with Jamie's Auto Care?",
      html,
      text: `Hi ${customer.name},\n\nThank you for choosing Jamie's Auto Care! We hope everything went smoothly.\n\nIf you had a positive experience, we'd love a review on Trustpilot:\nhttps://ie.trustpilot.com/evaluate/jamiesautocare.com\n\nBest regards,\nJamie's Auto Care`,
    })
    await logEmail({ to_address: customer.email, subject: "How was your experience with Jamie's Auto Care?", type: "review_request", status: "sent", error: null })
    return true
  } catch (err) {
    await logEmail({ to_address: customer.email, subject: "How was your experience with Jamie's Auto Care?", type: "review_request", status: "failed", error: String(err) })
    return false
  }
}

// Send a day-before appointment reminder email
export async function sendAppointmentReminderEmail(booking: {
  name: string
  email: string
  confirmed_date: string
  confirmed_time: string | null
  vehicle: string
  issue: string
  address: string | null
}): Promise<boolean> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return false
  const fromEmail = process.env.EMAIL_FROM || "contact@jamiesautocare.com"
  const businessPhone = process.env.BUSINESS_PHONE || ""

  const dateObj = new Date(booking.confirmed_date + "T00:00:00")
  const friendlyDate = dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  let friendlyTime = "time to be confirmed"
  if (booking.confirmed_time) {
    const [h, m] = booking.confirmed_time.split(":").map(Number)
    friendlyTime = new Date(2000, 0, 1, h, m).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;color:#1f2937;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
    <div style="background:#1e3a5f;color:white;padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">Jamie's Auto Care</h1>
      ${businessPhone ? `<p style="margin:6px 0 0;opacity:0.85;font-size:13px;">${businessPhone}</p>` : ""}
    </div>
    <div style="background:#2563eb;color:white;padding:14px 36px;text-align:center;">
      <p style="margin:0;font-size:17px;font-weight:700;">Reminder: Your Appointment is Tomorrow</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="margin:0 0 16px;font-size:15px;">Hi ${booking.name},</p>
      <p style="margin:0 0 20px;font-size:15px;">
        Just a friendly reminder that your appointment with Jamie's Auto Care is <strong>tomorrow</strong>. Here are the details:
      </p>
      <div style="background:#f0f4f8;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#6b7280;width:110px;">Date</td><td style="padding:6px 0;font-weight:600;color:#111827;">${friendlyDate}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;font-weight:600;color:#111827;">${friendlyTime}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Vehicle</td><td style="padding:6px 0;color:#374151;">${booking.vehicle}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Work</td><td style="padding:6px 0;color:#374151;">${booking.issue}</td></tr>
          ${booking.address ? `<tr><td style="padding:6px 0;color:#6b7280;">Address</td><td style="padding:6px 0;color:#374151;">${booking.address}</td></tr>` : ""}
        </table>
      </div>
      <p style="margin:0 0 8px;font-size:14px;color:#4b5563;">
        Please ensure your vehicle is accessible and there is enough space for us to work safely.
        If you need to make any changes, please get in touch${businessPhone ? ` on <strong>${businessPhone}</strong>` : ""} as soon as possible.
      </p>
      <p style="margin:24px 0 0;font-size:14px;color:#4b5563;">
        Best regards,<br>
        <strong style="color:#f97316;">Jamie's Auto Care</strong><br>
        Edinburgh's Trusted Mobile Mechanic
      </p>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Jamie's Auto Care — Mobile Mechanic</p>
    </div>
  </div>
</body></html>`.trim()

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: booking.email,
      subject: `Reminder: Your appointment is tomorrow — ${friendlyDate}`,
      html,
      text: `Hi ${booking.name},\n\nThis is a reminder that your appointment with Jamie's Auto Care is tomorrow.\n\nDate: ${friendlyDate}\nTime: ${friendlyTime}\nVehicle: ${booking.vehicle}\nWork: ${booking.issue}${booking.address ? `\nAddress: ${booking.address}` : ""}\n\nIf you need to make changes, please contact us${businessPhone ? ` on ${businessPhone}` : ""}.\n\nBest regards,\nJamie's Auto Care`,
    })
    await logEmail({ to_address: booking.email, subject: `Reminder: Your appointment is tomorrow — ${friendlyDate}`, type: "appointment_reminder", status: "sent", error: null })
    return true
  } catch (err) {
    await logEmail({ to_address: booking.email, subject: `Reminder: Your appointment is tomorrow`, type: "appointment_reminder", status: "failed", error: String(err) })
    return false
  }
}

// Send post-quote appointment approval email — manually triggered by Jamie after agreeing date/job with customer
export async function sendAppointmentApprovalEmail(booking: {
  name: string
  email: string
  phone: string
  vehicle: string
  vehicle_reg: string | null
  confirmed_date: string
  confirmed_time: string
  issue: string
  address: string | null
  confirmUrl: string
  cancelUrl?: string
}): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return { success: false, error: "SMTP not configured" }
  }

  const fromEmail = process.env.EMAIL_FROM || "contact@jamiesautocare.com"
  const contactPhone = process.env.BUSINESS_PHONE || ""

  const dateObj = new Date(booking.confirmed_date)
  const friendlyDate = dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const [hour, minute] = booking.confirmed_time.split(":").map(Number)
  const friendlyTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })

  const vehicleStr = `${booking.vehicle}${booking.vehicle_reg ? ` (${booking.vehicle_reg.toUpperCase()})` : ""}`

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: booking.email,
      subject: `Appointment Summary – ${friendlyDate} – Jamie's Auto Care`,
      text: `
Hi ${booking.name},

Following our conversation, here's a summary of your upcoming appointment with Jamie's Auto Care.

Please take a moment to confirm you're happy with everything by clicking the link below:

  CONFIRM APPOINTMENT: ${booking.confirmUrl}

APPOINTMENT DETAILS
===================
Date:     ${friendlyDate}
Time:     ${friendlyTime}
Vehicle:  ${vehicleStr}
Job:      ${booking.issue}
${booking.address ? `Address:  ${booking.address}` : ""}

${booking.cancelUrl ? `If your plans change, you can cancel here:\n  ${booking.cancelUrl}\n\nPlease give at least 24 hours' notice where possible.` : ""}

If you have any questions, please call ${contactPhone || "us"} or reply to this email.

See you soon,
Jamie's Auto Care
Edinburgh's Trusted Mobile Mechanic
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #1e3a5f; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; background: #ffffff; }
    .summary { background: #f0f7ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .row { display: flex; padding: 8px 0; border-bottom: 1px solid #dde5f0; }
    .row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #1e3a5f; width: 100px; flex-shrink: 0; }
    .confirm-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; }
    .btn-confirm { display: inline-block; background: #16a34a; color: #fff !important; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; }
    .cancel-note { background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 14px 18px; margin: 16px 0; font-size: 13px; color: #854d0e; }
    .footer { text-align: center; padding: 20px; background: #f5f5f5; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Jamie's Auto Care</h1>
      <p style="margin:8px 0 0;opacity:.9;font-size:14px;">Edinburgh's Trusted Mobile Mechanic</p>
    </div>
    <div class="content">
      <h2 style="color:#1e3a5f;margin-top:0;">Hi ${booking.name},</h2>
      <p>Following our conversation, here's a summary of your upcoming appointment. Please take a moment to confirm you're happy with everything.</p>

      <div class="summary">
        <h3 style="margin-top:0;color:#1e3a5f;">Appointment Details</h3>
        <div class="row"><span class="label">Date</span><span><strong>${friendlyDate}</strong></span></div>
        <div class="row"><span class="label">Time</span><span><strong>${friendlyTime}</strong></span></div>
        <div class="row"><span class="label">Vehicle</span><span>${vehicleStr}</span></div>
        <div class="row"><span class="label">Job</span><span>${booking.issue}</span></div>
        ${booking.address ? `<div class="row"><span class="label">Address</span><span>${booking.address}</span></div>` : ""}
      </div>

      <div class="confirm-box">
        <p style="margin:0 0 8px;font-size:16px;font-weight:bold;color:#166534;">Please confirm your appointment</p>
        <p style="margin:0 0 18px;font-size:14px;color:#166534;">Click below to let us know you're happy and we're good to go.</p>
        <a href="${booking.confirmUrl}" class="btn-confirm">✓ Yes, I Confirm</a>
        <p style="margin:14px 0 0;font-size:12px;color:#6b7280;">Button not working? Copy this link:<br>${booking.confirmUrl}</p>
      </div>

      ${booking.cancelUrl ? `
      <div class="cancel-note">
        <strong>Need to cancel?</strong> Things come up — we understand. Please let us know as early as possible.
        <a href="${booking.cancelUrl}" style="color:#854d0e;display:block;margin-top:6px;">Cancel this appointment →</a>
      </div>` : ""}

      <p>Any questions? Call ${contactPhone || "us"} or reply to this email.</p>
      <p style="margin-bottom:0;">See you soon,<br><strong style="color:#f97316;">Jamie's Auto Care</strong></p>
    </div>
    <div class="footer">Quality mobile servicing, diagnostics &amp; repairs — without the garage visit.</div>
  </div>
</body>
</html>
      `.trim(),
    })

    logEmail({ to_address: booking.email, subject: `Appointment Summary – ${friendlyDate} – Jamie's Auto Care`, type: "appointment_approval", status: "sent" })
    return { success: true }
  } catch (error) {
    logEmail({ to_address: booking.email, subject: `Appointment Summary – Jamie's Auto Care`, type: "appointment_approval", status: "failed", error: String(error) })
    return { success: false, error: String(error) }
  }
}

// ── Discord webhook notification ──────────────────────────────────────────────

export async function sendDiscordBookingNotification(booking: {
  name: string
  phone: string
  email: string
  vehicle: string
  issue: string
  preferredDate: string | null
  preferredTime: string | null
}): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL
  if (!url) return

  const dateStr = booking.preferredDate
    ? new Date(booking.preferredDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "No date selected"
  const timeStr = booking.preferredTime || "No time selected"
  const issueDisplay = booking.issue
    .replace(/^\[CALLBACK REQUESTED\]\s*/i, "")
    .replace(/^\[QUOTE REQUESTED\]\s*/i, "")
  const isCallback = /^\[CALLBACK REQUESTED\]/i.test(booking.issue)
  const isQuote    = /^\[QUOTE REQUESTED\]/i.test(booking.issue)
  const typeLabel  = isCallback ? "📞 Callback Request" : isQuote ? "💬 Quote Request" : "📅 Booking Request"

  const payload = {
    username: "Jamie's Auto Care",
    embeds: [{
      title: `🔧 New ${typeLabel}`,
      color: isCallback ? 0x3b82f6 : isQuote ? 0x8b5cf6 : 0xf97316,
      fields: [
        { name: "👤 Customer", value: `**${booking.name}**\n📞 ${booking.phone}\n📧 ${booking.email}`, inline: false },
        { name: "🚗 Vehicle", value: booking.vehicle, inline: true },
        { name: "📅 Requested Slot", value: `${dateStr}\n${timeStr}`, inline: true },
        { name: "📝 Issue", value: issueDisplay.slice(0, 400) || "—", inline: false },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "jamiesautocare.com — Admin Dashboard" },
    }],
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error("Discord notification failed:", err)
  }
}

