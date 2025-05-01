import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

// GET handler to fetch all bookings
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authCookie = cookies().get("admin_auth")?.value
    if (!authCookie || authCookie !== process.env.ADMIN_AUTH_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Build query
    let sql = `
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        vehicle, 
        issue, 
        booking_date as date, 
        time_slot as timeSlot, 
        status, 
        created_at as createdAt,
        cancellation_token as cancellationToken
      FROM bookings
    `
    const params: any[] = []

    // Add status filter if provided
    if (status) {
      sql += " WHERE status = ?"
      params.push(status)
    }

    // Add order by and limit
    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    // Execute query
    const results = await query(sql, params)

    // Format dates
    const bookings = (results as any[]).map((booking) => ({
      ...booking,
      createdAt: new Date(booking.createdAt).toISOString(),
    }))

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch bookings" }, { status: 500 })
  }
}
