import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get distinct customers from bookings table
    const results = await query(`
      SELECT DISTINCT 
        name, 
        email, 
        phone, 
        address, 
        postcode,
        MIN(created_at) as created_at
      FROM 
        bookings 
      GROUP BY 
        email, name, phone, address, postcode
      ORDER BY 
        created_at DESC
    `)

    // Format the results
    const customers = results.map((customer: any) => ({
      id: `cust_${Buffer.from(customer.email).toString("base64")}`,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || "",
      postcode: customer.postcode || "",
      createdAt: customer.created_at,
    }))

    return NextResponse.json({ success: true, customers })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch customers" }, { status: 500 })
  }
}
