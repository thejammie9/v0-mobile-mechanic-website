import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { id, email } = await request.json()

    if (!id || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID and email are required",
        },
        { status: 400 },
      )
    }

    // In a real application, you would validate the booking exists and belongs to the user
    // Then update its status in the database
    // For now, we'll just simulate a successful cancellation

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while cancelling your booking",
      },
      { status: 500 },
    )
  }
}
