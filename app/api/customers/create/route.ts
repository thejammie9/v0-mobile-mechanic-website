import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const customerData = await request.json()
    console.log("Customer data received:", customerData)

    // Validate required fields
    const requiredFields = ["name", "email", "phone"]
    const missingFields = requiredFields.filter((field) => !customerData[field])

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

    // Generate customer ID
    const customerId = `customer_${Date.now()}`

    // Format the current date in MySQL format (YYYY-MM-DD HH:MM:SS)
    const now = new Date()
    const mysqlDatetime = now.toISOString().slice(0, 19).replace("T", " ")

    // Save to database
    try {
      await query(
        `INSERT INTO customers 
        (id, name, email, phone, address, notes, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          customerData.name,
          customerData.email,
          customerData.phone,
          customerData.address || "",
          customerData.notes || "",
          mysqlDatetime,
          mysqlDatetime,
        ],
      )
      console.log("Customer saved to database")
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save customer to database",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Customer created successfully",
      customer: {
        id: customerId,
        ...customerData,
        created_at: mysqlDatetime,
        updated_at: mysqlDatetime,
      },
    })
  } catch (error) {
    console.error("Error processing customer:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request",
      },
      { status: 500 },
    )
  }
}
