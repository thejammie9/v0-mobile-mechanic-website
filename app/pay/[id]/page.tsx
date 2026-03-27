import { notFound } from "next/navigation"
import { getSiteSetting } from "@/lib/db"
import { CheckoutForm } from "./checkout-form"

export const dynamic = "force-dynamic"

async function getCheckoutDetails(checkoutId: string) {
  const apiKey = process.env.SUMUP_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch(`https://api.sumup.com/v0.1/checkouts/${checkoutId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const checkout = await getCheckoutDetails(id)
  if (!checkout || checkout.status === "PAID") {
    notFound()
  }

  const businessName = (await getSiteSetting("business_name")) || "Jamie's Auto Care"
  const businessPhone = process.env.BUSINESS_PHONE || ""

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-gray-900">{businessName}</p>
            {businessPhone && <p className="text-xs text-gray-500">{businessPhone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Secure Payment</p>
            <p className="text-xs text-gray-400">Powered by SumUp</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Parts Deposit</h1>
          <p className="text-sm text-gray-500 mb-6">
            {checkout.description || "Deposit payment"}
          </p>

          <CheckoutForm
            checkoutId={id}
            amount={checkout.amount}
            description={checkout.description || "Deposit payment"}
            businessName={businessName}
            businessPhone={businessPhone}
          />
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        Payments processed securely by SumUp
      </footer>
    </div>
  )
}
