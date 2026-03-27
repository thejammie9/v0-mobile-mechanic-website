"use server"

import { updateInvoiceStatus, saveInvoicePaymentLink, getInvoiceById, saveQuotePaymentLink, getQuoteById } from "@/lib/db"
import { isAdminAuthenticated } from "@/app/admin/actions"

export async function matchSumUpTransaction(invoiceId: number, transactionCode: string): Promise<{ success: boolean }> {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false }
  const ok = updateInvoiceStatus(invoiceId, "paid", "card", transactionCode)
  return { success: ok }
}

export async function createSumUpCheckout(
  id: number,
  amount: number,
  description: string,
  type: "invoice" | "quote" = "invoice"
): Promise<{ success: boolean; paymentLink?: string; error?: string }> {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false, error: "Unauthorised" }

  const apiKey = process.env.SUMUP_API_KEY
  if (!apiKey) return { success: false, error: "SUMUP_API_KEY not configured" }

  let ref: string
  if (type === "quote") {
    const quote = getQuoteById(id)
    if (!quote) return { success: false, error: "Quote not found" }
    ref = `${quote.quote_number}-${Date.now()}`
  } else {
    const invoice = getInvoiceById(id)
    if (!invoice) return { success: false, error: "Invoice not found" }
    ref = `${invoice.invoice_number}-${Date.now()}`
  }

  try {
    // Fetch merchant code (required by SumUp Checkouts API)
    const meRes = await fetch("https://api.sumup.com/v0.1/me", {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!meRes.ok) {
      return { success: false, error: "Failed to fetch SumUp merchant info" }
    }
    const me = await meRes.json()
    const merchantCode: string = me.merchant_profile?.merchant_code
    if (!merchantCode) {
      return { success: false, error: "SumUp merchant_code not found" }
    }

    const res = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: ref,
        amount: Math.round(amount * 100) / 100,
        currency: "GBP",
        description,
        merchant_code: merchantCode,
        redirect_url: process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/payment-thanks`
          : undefined,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return { success: false, error: `SumUp error: ${text}` }
    }

    const data = await res.json()
    const checkoutId: string = data.id
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jamiesautocare.com"
    const paymentLink = `${siteUrl}/pay/${checkoutId}`

    if (type === "quote") {
      saveQuotePaymentLink(id, checkoutId, paymentLink, amount)
    } else {
      const invoice = getInvoiceById(id)!
      const isDeposit = amount < calculateInvoiceTotal(invoice)
      saveInvoicePaymentLink(id, checkoutId, paymentLink, isDeposit ? amount : null)
    }

    return { success: true, paymentLink }
  } catch {
    return { success: false, error: "Network error" }
  }
}

function calculateInvoiceTotal(invoice: ReturnType<typeof getInvoiceById>): number {
  if (!invoice) return 0
  let labour: { hours: number; rate: number }[] = []
  let parts: { qty: number; unitPrice: number }[] = []
  try { labour = JSON.parse(invoice.labour_items || "[]") } catch {}
  try { parts = JSON.parse(invoice.parts_items || "[]") } catch {}
  const labourSub = labour.reduce((s, i) => s + i.hours * i.rate, 0)
  const discount = invoice.labour_discount ?? 0
  const subtotal = (labourSub * (1 - discount / 100)) + parts.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  return subtotal + (invoice.vat_enabled ? (subtotal * invoice.vat_rate) / 100 : 0)
}
