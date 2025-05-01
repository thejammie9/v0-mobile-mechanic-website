"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"

export function AdminWarningBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <strong>Testing Mode Active:</strong> This site is using default admin credentials. Before deploying to
            production, remove the default admin account from{" "}
            <code className="bg-yellow-100 px-1 rounded">app/actions/auth-actions.ts</code> and set proper environment
            variables.
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="ml-4 flex-shrink-0 text-yellow-500 hover:text-yellow-700">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
