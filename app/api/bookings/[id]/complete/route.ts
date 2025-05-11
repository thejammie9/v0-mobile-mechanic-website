import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { servicePerformed, cost, notes } = await request.json()

    // Validate required fields
    if (!servicePerformed || !cost) {
      return NextResponse.json(
        {
          success: false,
          message: "Service performed and cost are required",
        },
        { status: 400 },
      )
    }

    // Format current date for MySQL
    const completedAt = new Date().toISOString().slice(0, 19).replace("T", " ")

    // Update booking
    await query(
      `UPDATE bookings SET 
        status = 'completed', 
        completed_at = ?, 
        service_performed = ?, 
        cost = ?, 
        notes = ? 
      WHERE id = ?`,
      [completedAt, servicePerformed, cost, notes, id],
    )

    return NextResponse.json({
      success: true,
      message: "Booking marked as completed successfully",
    })
  } catch (error) {
    console.error("Error completing booking:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to complete booking",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
