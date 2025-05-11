import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET() {
  try {
    // Log all environment variables related to SMTP
    console.log("SMTP Configuration:")
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`)
    console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`)
    console.log(`SMTP_SECURE: ${process.env.SMTP_SECURE}`)
    console.log(`SMTP_USER: ${process.env.SMTP_USER}`)
    console.log(`SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? "Set (not showing for security)" : "Not set"}`)
    console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL}`)

    // Create test account if no SMTP credentials are provided
    let testAccount
    let transportConfig

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log("No SMTP credentials provided, creating test account...")
      testAccount = await nodemailer.createTestAccount()

      transportConfig = {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }

      console.log("Test account created:", testAccount.user)
    } else {
      transportConfig = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      }
    }

    console.log("Creating transporter with config:", {
      ...transportConfig,
      auth: {
        ...transportConfig.auth,
        pass: "********", // Hide password in logs
      },
    })

    // Create transporter
    const transporter = nodemailer.createTransport(transportConfig)

    // Verify connection
    await transporter.verify()
    console.log("SMTP connection verified successfully")

    // Send test email
    const info = await transporter.sendMail({
      from: `"Test Sender" <${transportConfig.auth.user}>`,
      to: process.env.ADMIN_EMAIL || "test@example.com",
      subject: "SMTP Test Email",
      text: "This is a test email to verify SMTP configuration.",
      html: "<b>This is a test email to verify SMTP configuration.</b>",
    })

    console.log("Test email sent:", info.messageId)

    // If using ethereal, provide preview URL
    if (testAccount) {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info))
    }

    return NextResponse.json({
      success: true,
      message: "SMTP test completed successfully",
      messageId: info.messageId,
      previewUrl: testAccount ? nodemailer.getTestMessageUrl(info) : null,
    })
  } catch (error) {
    console.error("SMTP test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "SMTP test failed",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
