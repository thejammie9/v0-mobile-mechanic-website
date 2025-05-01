"use client"

import { useEffect } from "react"
import { logoutAdmin } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      await logoutAdmin()
      // Use window.location for a full page refresh
      window.location.href = "/admin/login"
    }

    performLogout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Logging Out</h1>
        <p>Please wait while we log you out...</p>
      </div>
    </div>
  )
}
