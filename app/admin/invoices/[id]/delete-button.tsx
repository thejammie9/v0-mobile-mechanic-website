"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteInvoice } from "@/app/actions/invoices"

export function DeleteInvoiceButton({ invoiceId }: { invoiceId: number }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("Delete this invoice? This cannot be undone.")) return
    await deleteInvoice(invoiceId)
    router.push("/admin/invoices")
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
