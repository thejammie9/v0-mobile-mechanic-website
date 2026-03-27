"use client"

import { useState, useRef, useEffect } from "react"
import { Send, CreditCard, ChevronDown, Loader2, Check, AlertCircle } from "lucide-react"
import { createSumUpCheckout } from "@/app/actions/sumup"
import { sendInvoiceEmail } from "@/app/actions/invoices"
import { useRouter } from "next/navigation"

type Props = {
  invoiceId: number
  invoiceTotal: number
  invoiceNumber: string
  customerName: string
  vehicle: string
  hasSumUp: boolean
  existingPaymentLink: string | null
}

export default function SendInvoiceButton({
  invoiceId, invoiceTotal, invoiceNumber, customerName, vehicle, hasSumUp, existingPaymentLink
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"plain" | "full" | "deposit" | null>(null)
  const [depositAmt, setDepositAmt] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [payLink, setPayLink] = useState(existingPaymentLink || "")
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleSend() {
    if (!mode) return
    setLoading(true)
    setStatus("idle")
    setErrorMsg("")

    let link: string | null = null
    let deposit: number | null = null

    try {
      // Create SumUp checkout if needed
      if (mode === "full" || mode === "deposit") {
        const amt = mode === "deposit" ? parseFloat(depositAmt) : invoiceTotal
        if (isNaN(amt) || amt <= 0) {
          setErrorMsg("Enter a valid deposit amount")
          setLoading(false)
          return
        }
        const desc = mode === "deposit"
          ? `Parts deposit for ${vehicle || customerName} — Invoice ${invoiceNumber}`
          : `${vehicle || customerName} — Invoice ${invoiceNumber}`
        const checkout = await createSumUpCheckout(invoiceId, amt, desc)
        if (!checkout.success || !checkout.paymentLink) {
          setErrorMsg(checkout.error || "Failed to create payment link")
          setLoading(false)
          setStatus("error")
          return
        }
        link = checkout.paymentLink
        deposit = mode === "deposit" ? amt : null
        setPayLink(link)
      }

      // Send the email
      const result = await sendInvoiceEmail(invoiceId, null, link, deposit)
      if (!result.success) {
        setErrorMsg(result.error || "Failed to send email")
        setStatus("error")
      } else {
        setStatus("success")
        setOpen(false)
        setTimeout(() => router.refresh(), 1000)
      }
    } catch {
      setErrorMsg("Unexpected error")
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Send className="h-4 w-4" />
        Send Invoice
        <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 p-3 space-y-2">
          <p className="text-xs text-gray-400 px-1 pb-1 border-b border-gray-700">Choose how to send</p>

          {/* Option 1: plain email */}
          <button
            onClick={() => setMode("plain")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${mode === "plain" ? "bg-blue-900/50 border border-blue-600 text-blue-200" : "hover:bg-gray-700 text-gray-300"}`}
          >
            <p className="font-medium">Email only</p>
            <p className="text-xs text-gray-500 mt-0.5">Send invoice PDF — customer pays on day</p>
          </button>

          {/* Option 2: full payment link — only if SumUp configured */}
          {hasSumUp && (
            <button
              onClick={() => setMode("full")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${mode === "full" ? "bg-orange-900/50 border border-orange-600 text-orange-200" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                <p className="font-medium">Full payment link — £{invoiceTotal.toFixed(2)}</p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 ml-5">Adds a "Pay Now" button to the email</p>
            </button>
          )}

          {/* Option 3: deposit link */}
          {hasSumUp && (
            <button
              onClick={() => setMode("deposit")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${mode === "deposit" ? "bg-orange-900/50 border border-orange-600 text-orange-200" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                <p className="font-medium">Parts deposit request</p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 ml-5">Customer pays a deposit before you order parts</p>
            </button>
          )}

          {/* Deposit amount input */}
          {mode === "deposit" && (
            <div className="px-1 pt-1">
              <label className="text-xs text-gray-400 block mb-1">Deposit amount (£)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 50.00"
                value={depositAmt}
                onChange={e => setDepositAmt(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
            </div>
          )}

          {/* Existing link display */}
          {payLink && mode !== "deposit" && mode !== "full" && (
            <div className="px-2 py-2 bg-green-900/30 border border-green-700 rounded-lg">
              <p className="text-xs text-green-300 font-medium">Payment link already created:</p>
              <a href={payLink} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 underline break-all">{payLink}</a>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="flex items-center gap-2 px-2 py-1.5 bg-red-900/30 border border-red-700 rounded-lg">
              <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{errorMsg}</p>
            </div>
          )}

          {/* Send button */}
          {mode && (
            <button
              onClick={handleSend}
              disabled={loading || (mode === "deposit" && !depositAmt)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors mt-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : status === "success" ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {loading ? "Sending..." : status === "success" ? "Sent!" : "Send Now"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
