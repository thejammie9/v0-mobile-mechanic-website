"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Create a server action to check the password securely
async function checkPassword(password: string) {
  const response = await fetch("/api/admin/check-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  })

  return response.json()
}

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const router = useRouter()

  const addDebug = (message: string) => {
    setDebugInfo((prev) => [...prev, `${new Date().toISOString().split("T")[1].split(".")[0]}: ${message}`])
  }

  // Client-side cookie check
  useEffect(() => {
    addDebug("Checking for existing admin cookie")
    const cookies = document.cookie.split(";").map((c) => c.trim())
    addDebug(`All cookies: ${cookies.length > 0 ? "Cookies present" : "No cookies"}`)

    const hasAdminCookie = cookies.some((c) => c.startsWith("admin_logged_in=true"))
    addDebug(`Has admin cookie: ${hasAdminCookie}`)

    if (hasAdminCookie) {
      addDebug("Admin cookie found, redirecting to dashboard")
      router.push("/admin")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    addDebug(`Login attempt with password: ${password.replace(/./g, "*")}`)

    try {
      // Check password against environment variable using API
      const result = await checkPassword(password)

      if (result.success) {
        addDebug("Password correct, setting cookie")

        // Set cookie with very simple format to avoid issues
        document.cookie = "admin_logged_in=true; path=/; max-age=86400" // 1 day

        addDebug("Cookie set, checking if it exists")
        const cookieSet = document.cookie.includes("admin_logged_in=true")
        addDebug(`Cookie exists after setting: ${cookieSet}`)

        // Force reload to ensure the cookie is applied
        window.location.href = "/admin"
      } else {
        addDebug("Password incorrect")
        setError("Invalid password")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      addDebug(`Error during login: ${errorMessage}`)
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Debug information */}
        <div className="mt-6 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-60">
          <p className="font-bold">Debug Info:</p>
          {debugInfo.map((msg, i) => (
            <div key={i} className="mt-1">
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
