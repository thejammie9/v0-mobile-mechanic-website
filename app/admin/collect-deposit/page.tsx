import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getAllQuotes } from "@/lib/db"
import { CollectDepositClient } from "./collect-deposit-client"

export const dynamic = "force-dynamic"

export default async function CollectDepositPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; phone?: string; email?: string; description?: string }>
}) {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect("/admin/login")

  const hasSumUp = !!process.env.SUMUP_API_KEY
  const { name, phone, email, description } = await searchParams

  // Fetch quotes that may still need a deposit (exclude fully paid/cancelled/expired)
  const allQuotes = getAllQuotes()
  const activeQuotes = allQuotes
    .filter(q => ["draft", "sent", "accepted"].includes(q.status))
    .map(q => ({
      id: q.id,
      quote_number: q.quote_number,
      customer_name: q.customer_name,
      customer_email: q.customer_email,
      customer_phone: q.customer_phone ?? "",
      vehicle: q.vehicle ?? "",
      parts_items: q.parts_items ?? "[]",
      labour_items: q.labour_items ?? "[]",
      status: q.status,
    }))

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Collect Deposit</h1>
          <p className="text-gray-400 text-sm mt-1">
            Generate a payment link to collect a deposit from any customer — useful for phone or WhatsApp bookings.
          </p>
        </div>
        <CollectDepositClient
          hasSumUp={hasSumUp}
          prefill={{ name, phone, email, description }}
          quotes={activeQuotes}
        />
      </main>
    </div>
  )
}
