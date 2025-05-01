"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginAdmin } from "@/app/actions/auth-actions"

export default function AdminLogin() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setDebugInfo("Submitting form...")

    try {
      // Create a FormData object
      const formData = new FormData()
      formData.append("password", password)

      // Call the server action
      setDebugInfo("Calling loginAdmin...")
      const result = await loginAdmin(formData)
      setDebugInfo(`Result: ${JSON.stringify(result)}`)

      if (result.success) {
        setDebugInfo("Login successful, redirecting...")
        // Force a hard navigation instead of client-side navigation
        window.location.href = "/admin/bookings"
      } else {
        setError(result.error || "Invalid password")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(`An error occurred: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-900">Admin Login</h1>
          <p className="mt-2 text-gray-600">Enter your password to access the admin dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Testing credentials notice */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-6">
          <p>
            <strong>For testing:</strong> Use password <code className="bg-blue-100 px-1 rounded">admin123</code>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Debug information - remove in production */}
        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono">
            <p>Debug: {debugInfo}</p>
          </div>
        )}
      </div>
    </div>
  )
}
