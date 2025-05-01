import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

// GET handler to fetch a single booking
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

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
      WHERE id = ?
    `
    const queryParams: any[] = [id]

    // If token is provided, add it to the query
    if (token) {
      sql += " AND cancellation_token = ?"
      queryParams.push(token)
    } else {
      // If no token, require admin authentication
      const authCookie = cookies().get("admin_auth")?.value
      if (!authCookie || authCookie !== process.env.ADMIN_AUTH_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    // Execute query
    // const results = await query(sql, queryParams)

    // if ((results as any[]).length === 0) {
    //   return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 })
    // }

    // const booking = (results as any[])[0]

    // // Format dates
    // booking.createdAt = new Date(booking.createdAt).toISOString()

    // return NextResponse.json({
    //   success: true,
    //   booking,
    // })
    const booking = {
      id,
      name: "John Smith",
      email: "john@example.com",
      phone: "07463451967",
      vehicle: "Ford Focus 2018",
      issue: "Engine making strange noise",
      date: "2023-06-15",
      timeSlot: "Morning (09:00 - 12:30)",
      status: "confirmed",
      created_at: "2023-06-10T14:30:00Z",
    }

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch booking" }, { status: 500 })
  }
}

// PATCH handler to update booking status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const authCookie = cookies().get("admin_auth")?.value
    if (!authCookie || authCookie !== process.env.ADMIN_AUTH_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const { status } = await request.json()

    // Validate status
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 })
    }

    // Update booking status
    await query("UPDATE bookings SET status = ? WHERE id = ?", [status, id])

    // If status is updated to confirmed, send confirmation email
    if (status === "confirmed") {
      // Get booking details
      const bookingResults = await query(
        "SELECT name, email, booking_date, time_slot, vehicle FROM bookings WHERE id = ?",
        [id],
      )

      if ((bookingResults as any[]).length > 0) {
        const booking = (bookingResults as any[])[0]

        // In a real app, you would send an email here
        console.log(`Sending confirmation email to ${booking.email}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ success: false, message: "Failed to update booking status" }, { status: 500 })
  }
}
