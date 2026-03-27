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
  markQuoteDepositPaid,
  saveQuotePaymentLink,
  type Quote,
  type Invoice,
} from "@/lib/db"
import { sendQuoteEmail as emailQuote, sendDepositRequestEmail } from "@/lib/email"

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
  customMessage?: string | null,
  paymentLink?: string | null,
  depositAmount?: number | null,
): Promise<{ success: boolean; error?: string }> {
  const quote = getQuoteById(id)
  if (!quote) {
    return { success: false, error: "Quote not found" }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jamiesautocare.com"
  const confirmUrl = quote.confirm_token ? `${siteUrl}/quote/${quote.confirm_token}` : null

  // Fall back to stored link if not explicitly passed
  const link = paymentLink ?? quote.payment_link ?? null
  const deposit = depositAmount ?? quote.deposit_amount ?? null

  const result = await emailQuote(quote, confirmUrl, customMessage || null, link, deposit)

  if (result.success) {
    if (quote.status === "draft") {
      updateQuoteStatus(id, "sent")
    }
  }

  return result
}

export async function acceptAndSendDeposit(
  quoteId: number,
): Promise<{ success: boolean; error?: string }> {
  const quote = getQuoteById(quoteId)
  if (!quote) return { success: false, error: "Quote not found" }

  // Calculate parts subtotal
  let partsItems: { qty: number; unitPrice: number }[] = []
  try { partsItems = JSON.parse(quote.parts_items || "[]") } catch {}
  const partsSubtotal = partsItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  if (partsSubtotal <= 0) return { success: false, error: "No parts to create a deposit for" }

  const apiKey = process.env.SUMUP_API_KEY
  if (!apiKey) return { success: false, error: "SumUp not configured" }

  // Fetch merchant code
  const meRes = await fetch("https://api.sumup.com/v0.1/me", {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!meRes.ok) return { success: false, error: "Failed to reach SumUp" }
  const me = await meRes.json()
  const merchantCode: string = me.merchant_profile?.merchant_code
  if (!merchantCode) return { success: false, error: "SumUp merchant_code not found" }

  const ref = `${quote.quote_number}-DEP-${Date.now()}`
  const desc = `Parts deposit — ${quote.vehicle || quote.customer_name} (${quote.quote_number})`

  const checkoutRes = await fetch("https://api.sumup.com/v0.1/checkouts", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      checkout_reference: ref,
      amount: Math.round(partsSubtotal * 100) / 100,
      currency: "GBP",
      description: desc,
      merchant_code: merchantCode,
      redirect_url: process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/payment-thanks`
        : undefined,
    }),
  })

  if (!checkoutRes.ok) {
    const text = await checkoutRes.text()
    return { success: false, error: `SumUp: ${text}` }
  }

  const checkoutData = await checkoutRes.json()
  const checkoutId: string = checkoutData.id
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jamiesautocare.com"
  const paymentLink = `${siteUrl}/pay/${checkoutId}`

  // Save payment link to quote
  saveQuotePaymentLink(quoteId, checkoutId, paymentLink, partsSubtotal)

  // Mark quote as accepted
  updateQuoteStatus(quoteId, "accepted")

  // Send breakdown deposit email
  const result = await sendDepositRequestEmail(quote, paymentLink, partsSubtotal)
  return result
}

export async function markQuoteDepositPaidAction(
  id: number,
  amount: number,
): Promise<{ success: boolean }> {
  const ok = markQuoteDepositPaid(id, amount)
  return { success: ok }
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
    return result
  } catch (e) {
    console.error("acceptQuoteByToken error:", e)
    return { success: false, error: "Failed to accept quote" }
  }
}
