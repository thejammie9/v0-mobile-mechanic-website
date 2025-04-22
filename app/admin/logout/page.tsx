"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { logoutAdmin } from "@/app/actions/auth-actions"

export default function Logout() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      await logoutAdmin()

      // Redirect to login page
      setTimeout(() => {
        router.push("/admin/login")
      }, 1000)
    }

    performLogout()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-900 mb-4" />
      <h1 className="text-xl font-medium">Logging out...</h1>
    </div>
  )
}
