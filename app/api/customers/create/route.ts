import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { z } from "zod"

// Define customer schema for validation
const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }),
  address: z.string().optional(),
  postcode: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = customerSchema.parse(body)

    // Check if customer already exists
    const existingCustomers = await query("SELECT * FROM customers WHERE email = ?", [validatedData.email])

    if (existingCustomers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "A customer with this email already exists",
          customerId: existingCustomers[0].id,
        },
        { status: 400 },
      )
    }

    // Generate a customer ID
    const customerId = `cust_${Date.now()}`

    // Insert the customer
    await query(
      `INSERT INTO customers 
       (id, name, email, phone, address, postcode, notes, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        validatedData.name,
        validatedData.email,
        validatedData.phone,
        validatedData.address || "",
        validatedData.postcode || "",
        validatedData.notes || "",
        new Date().toISOString().slice(0, 19).replace("T", " "),
      ],
    )

    return NextResponse.json({
      success: true,
      message: "Customer created successfully",
      customerId,
    })
  } catch (error) {
    console.error("Error creating customer:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: false, message: "Failed to create customer" }, { status: 500 })
  }
}
