import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { status } = await request.json()

    // Validate status
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status value",
        },
        { status: 400 },
      )
    }

    // Update booking status
    await query(`UPDATE bookings SET status = ? WHERE id = ?`, [status, id])

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking status",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
