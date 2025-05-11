import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { z } from "zod"

// Define invoice schema for validation
const invoiceSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, { message: "Customer name is required" }),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  date: z.string().min(1, { message: "Date is required" }),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  items: z.array(
    z.object({
      description: z.string().min(1, { message: "Description is required" }),
      quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
      unitPrice: z.number().min(0, { message: "Unit price must be a positive number" }),
      total: z.number().min(0, { message: "Total must be a positive number" }),
      type: z.enum(["labor", "parts"]).default("parts"),
    }),
  ),
  subtotal: z.number().min(0, { message: "Subtotal must be a positive number" }),
  tax: z.number().min(0, { message: "Tax must be a positive number" }),
  total: z.number().min(0, { message: "Total must be a positive number" }),
  status: z.enum(["draft", "pending", "paid", "overdue"]).default("pending"),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Invoice creation request:", body)

    // Validate the request body
    const validatedData = invoiceSchema.parse(body)

    // Generate an invoice ID
    const invoiceId = `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(
      4,
      "0",
    )}`

    // Format dates for MySQL
    const formattedDate = new Date(validatedData.date).toISOString().slice(0, 19).replace("T", " ")
    const formattedDueDate = new Date(validatedData.dueDate).toISOString().slice(0, 19).replace("T", " ")
    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ")

    // Insert the invoice
    await query(
      `INSERT INTO invoices 
       (id, customer_id, customer_name, customer_email, customer_phone, date, due_date, subtotal, tax, total, status, notes, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceId,
        validatedData.customerId || null,
        validatedData.customerName,
        validatedData.customerEmail || null,
        validatedData.customerPhone || null,
        formattedDate,
        formattedDueDate,
        validatedData.subtotal,
        validatedData.tax,
        validatedData.total,
        validatedData.status,
        validatedData.notes || null,
        createdAt,
      ],
    )

    // Insert invoice items
    for (const item of validatedData.items) {
      if (item.type === "labor") {
        await query(
          `INSERT INTO invoice_labor 
           (invoice_id, description, hours, hourly_rate, total) 
           VALUES (?, ?, ?, ?, ?)`,
          [invoiceId, item.description, item.quantity, item.unitPrice, item.total],
        )
      } else {
        await query(
          `INSERT INTO invoice_parts 
           (invoice_id, name, quantity, price, total) 
           VALUES (?, ?, ?, ?, ?)`,
          [invoiceId, item.description, item.quantity, item.unitPrice, item.total],
        )
      }
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

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create invoice",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
