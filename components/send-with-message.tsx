"use client"

import { useState } from "react"
import { Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  onSend: (message: string | null) => void
  onCancel: () => void
  isPending: boolean
  label?: string
}

export default function SendWithMessage({ onSend, onCancel, isPending, label = "Send Email" }: Props) {
  const [message, setMessage] = useState("")

  return (
    <div className="bg-gray-750 border border-gray-600 rounded-lg p-4 space-y-3 bg-gray-800">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Send className="h-4 w-4 text-orange-400" />
          Add a message (optional)
        </p>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-300">
          <X className="h-4 w-4" />
        </button>
      </div>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="e.g. Hi John, as discussed here's your quote. Please let me know if you have any questions!"
        rows={3}
        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
      />
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={() => onSend(message.trim() || null)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {isPending ? "Sending..." : label}
        </Button>
      </div>
    </div>
  )
}
