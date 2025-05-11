import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { z } from "zod"

// Define invoice schema for validation
const invoiceSchema = z.object({
  customerId: z.string().min(1, { message: "Customer ID is required" }),
  customerName: z.string().min(1, { message: "Customer name is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  labor: z.array(
    z.object({
      description: z.string().min(1, { message: "Description is required" }),
      hours: z.number().min(0, { message: "Hours must be a positive number" }),
      hourlyRate: z.number().min(0, { message: "Hourly rate must be a positive number" }),
      total: z.number().min(0, { message: "Total must be a positive number" }),
    }),
  ),
  parts: z.array(
    z.object({
      name: z.string().min(1, { message: "Part name is required" }),
      quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
      price: z.number().min(0, { message: "Price must be a positive number" }),
      total: z.number().min(0, { message: "Total must be a positive number" }),
    }),
  ),
  subtotal: z.number().min(0, { message: "Subtotal must be a positive number" }),
  tax: z.number().min(0, { message: "Tax must be a positive number" }),
  total: z.number().min(0, { message: "Total must be a positive number" }),
  status: z.enum(["pending", "paid", "overdue"]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = invoiceSchema.parse(body)

    // Generate an invoice ID
    const invoiceId = `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, "0")}`

    // Format dates for MySQL
    const formattedDate = new Date(validatedData.date).toISOString().slice(0, 19).replace("T", " ")
    const formattedDueDate = new Date(validatedData.dueDate).toISOString().slice(0, 19).replace("T", " ")
    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ")

    // Insert the invoice
    await query(
      `INSERT INTO invoices 
       (id, customer_id, customer_name, date, due_date, subtotal, tax, total, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceId,
        validatedData.customerId,
        validatedData.customerName,
        formattedDate,
        formattedDueDate,
        validatedData.subtotal,
        validatedData.tax,
        validatedData.total,
        validatedData.status,
        createdAt,
      ],
    )

    // Insert labor items
    for (const item of validatedData.labor) {
      await query(
        `INSERT INTO invoice_labor 
         (invoice_id, description, hours, hourly_rate, total) 
         VALUES (?, ?, ?, ?, ?)`,
        [invoiceId, item.description, item.hours, item.hourlyRate, item.total],
      )
    }

    // Insert parts items
    for (const part of validatedData.parts) {
      await query(
        `INSERT INTO invoice_parts 
         (invoice_id, name, quantity, price, total) 
         VALUES (?, ?, ?, ?, ?)`,
        [invoiceId, part.name, part.quantity, part.price, part.total],
      )
    }

    return NextResponse.json({
      success: true,
      message: "Invoice created successfully",
      invoiceId,
    })
  } catch (error) {
    console.error("Error creating invoice:", error)

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

    return NextResponse.json({ success: false, message: "Failed to create invoice" }, { status: 500 })
  }
}
