"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteQuote } from "@/app/actions/quotes"

export function DeleteQuoteButton({ quoteId }: { quoteId: number }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("Delete this quote? This cannot be undone.")) return
    await deleteQuote(quoteId)
    router.push("/admin/quotes")
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="border-red-800 text-red-400 hover:bg-red-900/30"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </Button>
  )
}
