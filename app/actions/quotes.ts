"use server"

import {
  createQuote as dbCreateQuote,
  updateQuote as dbUpdateQuote,
  getAllQuotes,
  getQuoteById,
  getQuoteByConfirmToken,
  acceptQuoteByToken as dbAcceptQuoteByToken,
  updateQuoteStatus,
  deleteQuote as dbDeleteQuote,
  convertQuoteToInvoice as dbConvertQuoteToInvoice,
  getCustomerByEmail,
  createCustomer,
  getCustomerById,
  linkQuoteToCustomer,
  updateCustomer,
  type Quote,
  type Invoice,
} from "@/lib/db"
import { sendQuoteEmail as emailQuote, sendAppointmentApprovalEmail } from "@/lib/email"

export async function createQuote(data: {
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
}): Promise<{ success: boolean; quoteId?: number; quoteNumber?: string; error?: string }> {
  try {
    const quote = dbCreateQuote(data)

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
      if (customer) linkQuoteToCustomer(quote.id, customer.id)
    } catch (e) {
      console.error("Auto-link customer failed:", e)
    }

    return { success: true, quoteId: quote.id, quoteNumber: quote.quote_number }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("createQuote error:", error)
    return { success: false, error: msg }
  }
}

export async function getQuotes(): Promise<Quote[]> {
  return getAllQuotes()
}

export async function getQuote(id: number): Promise<Quote | null> {
  return getQuoteById(id)
}

export async function updateQuoteAction(id: number, data: {
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
}): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = dbUpdateQuote(id, data)
    return { success: ok }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: msg }
  }
}

export async function updateQuoteStatusAction(
  id: number,
  status: string
): Promise<{ success: boolean }> {
  const ok = updateQuoteStatus(id, status)
  return { success: ok }
}

export async function deleteQuote(id: number): Promise<{ success: boolean }> {
  const ok = dbDeleteQuote(id)
  return { success: ok }
}

export async function convertToInvoice(
  quoteId: number
): Promise<{ success: boolean; invoiceId?: number; error?: string }> {
  try {
    const invoice = dbConvertQuoteToInvoice(quoteId)
    if (!invoice) return { success: false, error: "Quote not found" }
    return { success: true, invoiceId: invoice.id }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: msg }
  }
}

export async function sendQuoteEmailAction(
  id: number,
  customMessage?: string | null
): Promise<{ success: boolean; error?: string }> {
  const quote = getQuoteById(id)
  if (!quote) {
    return { success: false, error: "Quote not found" }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jamiesautocare.com"
  const confirmUrl = quote.confirm_token ? `${siteUrl}/quote/${quote.confirm_token}` : null

  const result = await emailQuote(quote, confirmUrl, customMessage || null)

  if (result.success) {
    if (quote.status === "draft") {
      updateQuoteStatus(id, "sent")
    }
  }

  return result
}

export async function getQuoteByToken(token: string): Promise<Quote | null> {
  return getQuoteByConfirmToken(token)
}

export async function acceptQuoteByToken(
  token: string,
  preferredDate: string,
  preferredTime: string
): Promise<{ success: boolean; alreadyAccepted?: boolean; bookingId?: number; error?: string }> {
  try {
    const result = dbAcceptQuoteByToken(token, preferredDate, preferredTime)
    if (!result.success || result.alreadyAccepted) return result

    // Auto-send the approval email so the customer can confirm the appointment
    const quote = getQuoteByConfirmToken(token)
    if (quote && result.cancelToken && result.bookingId) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jamiesautocare.com"
      // We need the booking's confirm_token for the confirm link — fetch it from the new booking
      const { getBookingById } = await import("@/lib/db")
      const newBooking = getBookingById(result.bookingId)
      const confirmUrl = newBooking?.confirm_token ? `${siteUrl}/confirm/${newBooking.confirm_token}` : siteUrl
      const cancelUrl  = `${siteUrl}/cancel/${result.cancelToken}`
      sendAppointmentApprovalEmail({
        name:           quote.customer_name,
        email:          quote.customer_email,
        phone:          quote.customer_phone || "",
        vehicle:        quote.vehicle || "",
        vehicle_reg:    null,
        confirmed_date: preferredDate,
        confirmed_time: preferredTime,
        issue:          `Accepted quote ${quote.quote_number}`,
        address:        quote.customer_address,
        confirmUrl,
        cancelUrl,
      }).catch(err => console.error("Failed to send quote acceptance approval email:", err))
    }

    return result
  } catch (e) {
    console.error("acceptQuoteByToken error:", e)
    return { success: false, error: "Failed to accept quote" }
  }
}
