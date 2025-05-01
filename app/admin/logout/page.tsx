"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // In a real application, you would clear the authentication token
    // For now, we'll just redirect to the login page after a short delay
    const timer = setTimeout(() => {
      router.push("/admin/login")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Logging Out</h1>
        <p className="text-gray-600">You are being logged out. Please wait...</p>
      </div>
    </div>
  )
}
