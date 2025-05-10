import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Get the admin password from environment variables
    const correctPassword = process.env.ADMIN_PASSWORD

    if (!correctPassword) {
      console.error("ADMIN_PASSWORD environment variable is not set")
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
    }

    // Check if the password matches
    const isCorrect = password === correctPassword

    // Log the attempt (without revealing the actual password)
    console.log(`Admin login attempt: ${isCorrect ? "Success" : "Failed"}`)

    if (isCorrect) {
      // Set the cookie in the response
      const response = NextResponse.json({ success: true })
      response.cookies.set({
        name: "admin_logged_in",
        value: "true",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: "lax",
      })
      return response
    }

    return NextResponse.json({ success: isCorrect })
  } catch (error) {
    console.error("Error checking admin password:", error)
    return NextResponse.json({ success: false, error: "An error occurred" }, { status: 500 })
  }
}
