import nodemailer from "nodemailer"

// SMTP configuration using your email hosting
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export type BookingEmailData = {
  name: string
  phone: string
  email: string
  vehicle: string
  issue: string
  preferredDate: string | null
  preferredTime: string | null
}

// Send notification to admin when a new booking is received
export async function sendBookingNotification(booking: BookingEmailData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || "appointments@jamiesautocare.com"
  const fromEmail = process.env.SMTP_FROM || "appointments@jamiesautocare.com"

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("SMTP not configured - skipping email notification")
    return false
  }

  const preferredDateTime = booking.preferredDate
    ? `${booking.preferredDate}${booking.preferredTime ? ` at ${booking.preferredTime}` : ""}`
    : "Not specified"

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e3a5f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #1e3a5f; }
        .value { margin-top: 5px; }
        .issue-box { background-color: white; padding: 15px; border-left: 4px solid #f97316; margin-top: 10px; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">New Booking Request</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Customer Name</div>
            <div class="value">${booking.name}</div>
          </div>
          <div class="field">
            <div class="label">Phone</div>
            <div class="value"><a href="tel:${booking.phone}">${booking.phone}</a></div>
          </div>
          <div class="field">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${booking.email}">${booking.email}</a></div>
          </div>
          <div class="field">
            <div class="label">Vehicle</div>
            <div class="value">${booking.vehicle}</div>
          </div>
          <div class="field">
            <div class="label">Preferred Date/Time</div>
            <div class="value">${preferredDateTime}</div>
          </div>
          <div class="field">
            <div class="label">Issue Description</div>
            <div class="issue-box">${booking.issue}</div>
          </div>
        </div>
        <div class="footer">
          Jamie's Auto Care - Edinburgh Mobile Mechanic<br>
          <a href="https://jamiesautocare.com/admin">View in Admin Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
New Booking Request

Customer: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email}
Vehicle: ${booking.vehicle}
Preferred Date/Time: ${preferredDateTime}

Issue Description:
${booking.issue}

---
View in admin dashboard: https://jamiesautocare.com/admin
  `

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: adminEmail,
      subject: `New Booking: ${booking.name} - ${booking.vehicle}`,
      text: textContent,
      html: htmlContent,
    })
    console.log("Booking notification email sent successfully")
    return true
  } catch (error) {
    console.error("Failed to send booking notification email:", error)
    return false
  }
}

// Send confirmation email to customer
export async function sendCustomerConfirmation(booking: BookingEmailData): Promise<boolean> {
  const fromEmail = process.env.SMTP_FROM || "contact@jamiesautocare.com"

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("SMTP not configured - skipping customer confirmation email")
    return false
  }

  const preferredDateTime = booking.preferredDate
    ? `${booking.preferredDate}${booking.preferredTime ? ` at ${booking.preferredTime}` : ""}`
    : "Not specified"

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e3a5f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .highlight { color: #f97316; font-weight: bold; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Booking Received</h1>
        </div>
        <div class="content">
          <p>Hi ${booking.name},</p>
          <p>Thank you for your booking request. We've received your details and will be in touch shortly to confirm your appointment.</p>
          
          <h3>Your Booking Summary:</h3>
          <p><strong>Vehicle:</strong> ${booking.vehicle}</p>
          <p><strong>Requested Date/Time:</strong> ${preferredDateTime}</p>
          <p><strong>Issue:</strong> ${booking.issue}</p>
          
          <p style="margin-top: 20px;">If you have any urgent questions, please don't hesitate to contact us:</p>
          <p>
            <strong>Phone:</strong> <a href="tel:07XXX-XXXXXX">07XXX XXXXXX</a><br>
            <strong>Email:</strong> <a href="mailto:contact@jamiesautocare.com">contact@jamiesautocare.com</a>
          </p>
        </div>
        <div class="footer">
          Jamie's Auto Care - Edinburgh Mobile Mechanic<br>
          Quality servicing, diagnostics & repairs at your doorstep
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
Hi ${booking.name},

Thank you for your booking request. We've received your details and will be in touch shortly to confirm your appointment.

Your Booking Summary:
- Vehicle: ${booking.vehicle}
- Requested Date/Time: ${preferredDateTime}
- Issue: ${booking.issue}

If you have any urgent questions, please contact us:
Phone: 07XXX XXXXXX
Email: contact@jamiesautocare.com

---
Jamie's Auto Care - Edinburgh Mobile Mechanic
Quality servicing, diagnostics & repairs at your doorstep
  `

  try {
    await transporter.sendMail({
      from: `"Jamie's Auto Care" <${fromEmail}>`,
      to: booking.email,
      subject: "Booking Received - Jamie's Auto Care",
      text: textContent,
      html: htmlContent,
    })
    console.log("Customer confirmation email sent successfully")
    return true
  } catch (error) {
    console.error("Failed to send customer confirmation email:", error)
    return false
  }
}
