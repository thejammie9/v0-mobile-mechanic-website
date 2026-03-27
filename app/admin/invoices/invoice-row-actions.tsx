"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Banknote, CreditCard } from "lucide-react"
import { toggleInvoicePaid } from "@/app/actions/invoices"

interface Props {
  invoiceId: number
  status: string
  paymentMethod: string | null
}

export default function InvoiceRowActions({ invoiceId, status, paymentMethod }: Props) {
  const [method, setMethod] = useState<"cash" | "card">("cash")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleMarkPaid() {
    startTransition(async () => {
      await toggleInvoicePaid(invoiceId, method)
      router.refresh()
    })
  }

  if (status === "paid") {
    return (
      <div className="flex items-center gap-2">
        <Link href={`/admin/invoices/${invoiceId}`}>
          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100">
            View
          </Button>
        </Link>
        {paymentMethod && (
          <Badge className="bg-green-900/40 text-green-400 border-green-700 capitalize text-xs">
            {paymentMethod === "cash" ? (
              <Banknote className="h-3 w-3 mr-1" />
            ) : (
              <CreditCard className="h-3 w-3 mr-1" />
            )}
            {paymentMethod}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/admin/invoices/${invoiceId}`}>
        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100">
          View
        </Button>
      </Link>

      {/* Cash / Card toggle */}
      <div className="flex rounded overflow-hidden border border-gray-600 text-xs">
        <button
          type="button"
          onClick={() => setMethod("cash")}
          className={`px-2 py-1 flex items-center gap-1 transition-colors ${
            method === "cash"
              ? "bg-yellow-700 text-yellow-100"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          }`}
        >
          <Banknote className="h-3 w-3" />
          Cash
        </button>
        <button
          type="button"
          onClick={() => setMethod("card")}
          className={`px-2 py-1 flex items-center gap-1 transition-colors ${
            method === "card"
              ? "bg-blue-700 text-blue-100"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          }`}
        >
          <CreditCard className="h-3 w-3" />
          Card
        </button>
      </div>

      <Button
        size="sm"
        onClick={handleMarkPaid}
        disabled={isPending}
        className="bg-green-800 hover:bg-green-700 text-white"
        title={`Mark as paid (${method})`}
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
    </div>
  )
}
