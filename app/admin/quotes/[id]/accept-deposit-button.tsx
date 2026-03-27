"use client"

import { useState } from "react"
import { PackageCheck, Loader2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { acceptAndSendDeposit } from "@/app/actions/quotes"
import { useRouter } from "next/navigation"

export function AcceptDepositButton({ quoteId }: { quoteId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  async function handleClick() {
    if (!confirm("This will mark the quote as accepted, create a SumUp payment link for the parts total, and email the deposit request to the customer. Continue?")) return
    setLoading(true)
    setError("")
    const result = await acceptAndSendDeposit(quoteId)
    setLoading(false)
    if (!result.success) {
      setError(result.error || "Something went wrong")
    } else {
      setDone(true)
      setTimeout(() => router.refresh(), 1200)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        onClick={handleClick}
        disabled={loading || done}
        className="bg-orange-600 hover:bg-orange-500 text-white"
      >
        {loading
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
          : done
          ? <><Check className="h-4 w-4 mr-2" />Deposit Sent!</>
          : <><PackageCheck className="h-4 w-4 mr-2" />Accept &amp; Request Deposit</>
        }
      </Button>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
