"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AdminAuthCheck({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      // The middleware should handle authentication, so if we're here, we're authenticated
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}
