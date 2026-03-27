"use client"

import { useState } from "react"
import { CheckSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setDepositPaid } from "@/app/actions/invoices"
import { useRouter } from "next/navigation"

type Props = {
  invoiceId: number
  currentDeposit: number
}

export function DepositPaidButton({ invoiceId, currentDeposit }: Props) {
  const router = useRouter()
  const [showInput, setShowInput] = useState(false)
  const [amount, setAmount] = useState(currentDeposit > 0 ? currentDeposit.toFixed(2) : "")
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return
    setLoading(true)
    await setDepositPaid(invoiceId, amt)
    setLoading(false)
    setShowInput(false)
    router.refresh()
  }

  if (showInput) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">£</span>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-24 bg-gray-700 border border-gray-600 rounded-md px-2 py-1.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          autoFocus
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={loading || !amount}
          className="bg-orange-700 hover:bg-orange-600 text-white"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowInput(false)}
          className="border-gray-600 text-gray-300"
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      className="border-orange-700 text-orange-300 hover:bg-orange-900/40"
      onClick={() => setShowInput(true)}
    >
      <CheckSquare className="h-4 w-4 mr-2" />
      {currentDeposit > 0 ? "Edit Deposit Paid" : "Set Deposit Paid"}
    </Button>
  )
}
