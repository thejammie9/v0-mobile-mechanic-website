import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const results = await query(`
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        vehicle,
        vehicle_reg,
        issue, 
        booking_date as date, 
        time_slot as timeSlot, 
        status, 
        created_at as createdAt,
        cancellation_token as cancellationToken,
        address,
        postcode,
        service_type as serviceType,
        notes,
        completed_at as completedAt,
        service_performed as servicePerformed,
        cost
      FROM bookings 
      ORDER BY created_at DESC
    `)

    return NextResponse.json({
      success: true,
      bookings: results,
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
