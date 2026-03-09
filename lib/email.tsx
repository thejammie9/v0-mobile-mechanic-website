import nodemailer from "nodemailer"

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

    console.log("Admin notification email sent successfully")
    return true
  } catch (error) {
    console.error("Failed to send admin notification:", error)
    return false
  }
}

// Send confirmation email to customer
export async function sendCustomerConfirmation(booking: BookingData): Promise<boolean> {
  // Skip if SMTP is not configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("SMTP not configured - skipping customer confirmation")
    return false
  }

  const fromEmail = process.env.EMAIL_FROM || "contact@jamiesautocare.com"
  const contactPhone = process.env.BUSINESS_PHONE || ""

  const dateStr = booking.preferredDate || "To be confirmed"
  const timeStr = booking.preferredTime || "To be confirmed"

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: booking.email,
      subject: "Booking Request Received - Jamie's Auto Care",
      text: `
Hi ${booking.name},

Thank you for your booking request with Jamie's Auto Care!

We have received your request and will be in touch shortly to confirm your appointment.

BOOKING DETAILS
===============
Vehicle: ${booking.vehicle}
Issue: ${booking.issue}
Preferred Date: ${dateStr}
Preferred Time: ${timeStr}

If you need to reach us urgently, please call ${contactPhone}.

Best regards,
Jamie's Auto Care
Edinburgh's Trusted Mobile Mechanic
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e3a5f; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; background: #ffffff; }
    .highlight { background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #1e3a5f; width: 120px; }
    .footer { text-align: center; padding: 20px; background: #f5f5f5; color: #666; }
    .accent { color: #f97316; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Jamie's Auto Care</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Edinburgh's Trusted Mobile Mechanic</p>
    </div>
    <div class="content">
      <h2 style="color: #1e3a5f;">Hi ${booking.name},</h2>
      <p>Thank you for your booking request! We have received your details and will be in touch shortly to confirm your appointment.</p>
      
      <div class="highlight">
        <h3 style="margin-top: 0; color: #1e3a5f;">Your Booking Details</h3>
        <div class="detail-row">
          <span class="detail-label">Vehicle:</span>
          <span>${booking.vehicle}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Issue:</span>
          <span>${booking.issue}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Preferred Date:</span>
          <span>${dateStr}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Preferred Time:</span>
          <span>${timeStr}</span>
        </div>
      </div>
      
      <p>We typically respond within a few hours during business hours. If you need to reach us urgently, please give us a call${contactPhone ? ` at <strong>${contactPhone}</strong>` : ""}.</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong class="accent">Jamie's Auto Care</strong>
      </p>
    </div>
    <div class="footer">
      <p>Quality servicing, diagnostics & repairs - without the garage visit.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    })

    console.log("Customer confirmation email sent successfully")
    return true
  } catch (error) {
    console.error("Failed to send customer confirmation:", error)
    return false
  }
}
