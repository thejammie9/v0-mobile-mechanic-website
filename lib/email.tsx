import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export type BookingEmailData = {
  name: string
  phone: string
  email: string
  vehicle: string
  issue: string
  preferredDate: string | null
  preferredTime: string | null
}

export async function sendBookingNotification(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
  // If no Resend API key, skip email but don't fail
  if (!resend) {
    console.log("RESEND_API_KEY not set, skipping email notification")
    return { success: true }
  }

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.log("ADMIN_EMAIL not set, skipping email notification")
    return { success: true }
  }

  try {
    const { error } = await resend.emails.send({
      from: "Edinburgh Mobile Mechanic <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New Booking Request from ${data.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e3a5f; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">New Booking Request</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f5f5f5;">
            <h2 style="color: #1e3a5f; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">
              Customer Details
            </h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold; width: 140px;">Name:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Phone:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">
                  <a href="tel:${data.phone}" style="color: #ea580c;">${data.phone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">
                  <a href="mailto:${data.email}" style="color: #ea580c;">${data.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Vehicle:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.vehicle}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Preferred Date:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.preferredDate || "Not specified"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold;">Preferred Time:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.preferredTime || "Not specified"}</td>
              </tr>
            </table>
            
            <h2 style="color: #1e3a5f; border-bottom: 2px solid #ea580c; padding-bottom: 10px; margin-top: 30px;">
              Issue Description
            </h2>
            <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #ea580c;">
              ${data.issue.replace(/\n/g, "<br>")}
            </div>
          </div>
          
          <div style="background-color: #1e3a5f; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">This email was sent from your Edinburgh Mobile Mechanic website booking form.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("Error sending email:", err)
    return { success: false, error: "Failed to send email notification" }
  }
}
