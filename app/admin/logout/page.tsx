"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { logoutAdmin } from "@/app/actions/auth-actions"

export default function LogoutPage() {
  useEffect(() => {
    logoutAdmin()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      <p className="mt-4 text-gray-600">Logging out...</p>
    </div>
  )
}
