"use server"

import {
  createInvoice as dbCreateInvoice,
  updateInvoice as dbUpdateInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice as dbDeleteInvoice,
  getCustomerByEmail,
  createCustomer,
  getCustomerById,
  linkInvoiceToCustomer,
  updateCustomer,
  getBookingById,
  type Invoice,
} from "@/lib/db"
import { sendInvoiceEmail as emailInvoice } from "@/lib/email"

export async function createInvoice(data: {
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  customer_address?: string | null
  vehicle?: string | null
  labour_items?: string
  parts_items?: string
  notes?: string | null
  vat_enabled?: number
  vat_rate?: number
  status?: string
  invoice_date?: string | null
  mileage?: number | null
  health_report?: string | null
  labour_discount?: number | null
}): Promise<{ success: boolean; invoiceId?: number; invoiceNumber?: string; error?: string }> {
  try {
    const invoice = dbCreateInvoice(data)

    // Auto-link or create customer
    try {
      let customer = getCustomerByEmail(data.customer_email)
      if (!customer) {
        customer = createCustomer({
          name: data.customer_name,
          email: data.customer_email,
          phone: data.customer_phone || null,
          address: data.customer_address || null,
          notes: null,
        })
      } else {
        // Update customer with more complete info if available
        const needsUpdate =
          (!customer.phone && data.customer_phone) ||
          (!customer.address && data.customer_address)
        if (needsUpdate) {
          updateCustomer(customer.id, {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || data.customer_phone || null,
            address: customer.address || data.customer_address || null,
            notes: customer.notes,
          })
          customer = getCustomerById(customer.id)
        }
      }
      if (customer) linkInvoiceToCustomer(invoice.id, customer.id)
    } catch (e) {
      console.error("Auto-link customer failed:", e)
    }

    return { success: true, invoiceId: invoice.id, invoiceNumber: invoice.invoice_number }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("createInvoice error:", error)
    return { success: false, error: msg }
  }
}

export async function getInvoices(): Promise<Invoice[]> {
  return getAllInvoices()
}

export async function getInvoice(id: number): Promise<Invoice | null> {
  return getInvoiceById(id)
}

export async function updateStatus(
  id: number,
  status: string
): Promise<{ success: boolean }> {
  const ok = updateInvoiceStatus(id, status)
  return { success: ok }
}

export async function updateInvoice(id: number, data: {
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  customer_address?: string | null
  vehicle?: string | null
  labour_items?: string
  parts_items?: string
  notes?: string | null
  vat_enabled?: number
  vat_rate?: number
  invoice_date?: string | null
  mileage?: number | null
  health_report?: string | null
  labour_discount?: number | null
}): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = dbUpdateInvoice(id, data)
    return { success: ok }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: msg }
  }
}

export async function deleteInvoice(id: number): Promise<{ success: boolean }> {
  const ok = dbDeleteInvoice(id)
  return { success: ok }
}

export async function sendInvoiceEmail(
  id: number,
  customMessage?: string | null
): Promise<{ success: boolean; error?: string }> {
  const invoice = getInvoiceById(id)
  if (!invoice) {
    return { success: false, error: "Invoice not found" }
  }

  const result = await emailInvoice(invoice, customMessage || null)

  if (result.success) {
    // Mark as sent if it was draft
    if (invoice.status === "draft") {
      updateInvoiceStatus(id, "sent")
    }
  }

  return result
}

export async function toggleInvoicePaid(
  id: number,
  paymentMethod?: string,
): Promise<{ success: boolean; newStatus: string }> {
  const invoice = getInvoiceById(id)
  if (!invoice) return { success: false, newStatus: "draft" }
  const newStatus = invoice.status === "paid" ? "sent" : "paid"
  updateInvoiceStatus(id, newStatus, newStatus === "paid" ? paymentMethod : null)
  return { success: true, newStatus }
}

export async function createInvoiceFromBooking(
  bookingId: number
): Promise<{ success: boolean; invoiceId?: number; error?: string }> {
  const booking = getBookingById(bookingId)
  if (!booking) return { success: false, error: "Booking not found" }

  const vehicleParts = [booking.vehicle, booking.vehicle_reg?.toUpperCase()].filter(Boolean)
  const vehicle = vehicleParts.join(" — ") || null

  return createInvoice({
    customer_name: booking.name,
    customer_email: booking.email,
    customer_phone: booking.phone || null,
    customer_address: booking.address || null,
    vehicle,
    notes: booking.issue ? `Job description: ${booking.issue}` : null,
    status: "draft",
    booking_id: bookingId,
  })
}
