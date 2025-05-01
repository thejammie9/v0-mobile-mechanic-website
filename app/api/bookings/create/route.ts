import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()

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

    // In a real application, you would save the booking to a database here
    // For now, we'll just simulate a successful booking

    // Simulate sending an email
    console.log("Booking received:", bookingData)

    return NextResponse.json({
      success: true,
      message: "Booking received successfully",
      booking: {
        id: "booking_" + Math.random().toString(36).substr(2, 9),
        ...bookingData,
        status: "pending",
        created_at: new Date().toISOString(),
      },
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
