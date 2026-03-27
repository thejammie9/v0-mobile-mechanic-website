"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    SumUpCard?: {
      mount: (options: {
        id: string
        checkoutId: string
        onResponse?: (type: string, body: unknown) => void
        onLoad?: () => void
      }) => void
    }
  }
}

export function CheckoutForm({
  checkoutId,
  amount,
  description,
  businessName,
  businessPhone,
}: {
  checkoutId: string
  amount: number
  description: string
  businessName: string
  businessPhone: string
}) {
  const mountRef = useRef(false)
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "failed">("loading")
  const [error, setError] = useState("")

  useEffect(() => {
    if (mountRef.current) return
    mountRef.current = true

    const script = document.createElement("script")
    script.src = "https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
    script.async = true
    script.onload = () => {
      if (!window.SumUpCard) {
        setError("Payment system failed to load. Please try again.")
        setStatus("failed")
        return
      }
      setStatus("ready")
      window.SumUpCard.mount({
        id: "sumup-card",
        checkoutId,
        onLoad: () => setStatus("ready"),
        onResponse: (type, body) => {
          console.log("SumUp response:", type, body)
          if (type === "success") {
            setStatus("success")
          } else if (type === "error") {
            setStatus("failed")
            setError("Payment failed. Please check your card details and try again.")
          }
        },
      })
    }
    script.onerror = () => {
      setError("Could not load payment form. Please try again later.")
      setStatus("failed")
    }
    document.body.appendChild(script)
  }, [checkoutId])

  if (status === "success") {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Received!</h2>
        <p className="text-gray-600 mb-1">Thank you — your deposit of <strong>£{amount.toFixed(2)}</strong> has been received.</p>
        <p className="text-gray-600">We'll be in touch shortly to confirm your booking.</p>
        {businessPhone && (
          <p className="mt-4 text-sm text-gray-500">Questions? Call us on <a href={`tel:${businessPhone}`} className="text-blue-600 font-medium">{businessPhone}</a></p>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
        <p className="text-sm text-orange-800 font-medium">{description}</p>
        <p className="text-2xl font-bold text-orange-700 mt-1">£{amount.toFixed(2)}</p>
      </div>

      {status === "failed" && error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div id="sumup-card" className="min-h-[200px]" />

      {status === "loading" && (
        <div className="text-center py-8 text-gray-500 text-sm">Loading payment form…</div>
      )}
    </div>
  )
}
