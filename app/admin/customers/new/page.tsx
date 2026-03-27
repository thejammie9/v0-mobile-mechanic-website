"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createCustomer, addVehicle } from "@/app/actions/customers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function NewCustomerPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const form = e.currentTarget
    const vehicleReg = (form.elements.namedItem("vehicle_reg") as HTMLInputElement).value.trim().toUpperCase()
    const vehicleMakeModel = (form.elements.namedItem("vehicle_make_model") as HTMLInputElement).value.trim()
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim() || null,
      address: (form.elements.namedItem("address") as HTMLTextAreaElement).value.trim() || null,
      notes: (form.elements.namedItem("notes") as HTMLTextAreaElement).value.trim() || null,
    }

    const result = await createCustomer(data)
    if (result.success && result.customerId) {
      // Add vehicle if provided
      if (vehicleReg || vehicleMakeModel) {
        await addVehicle(result.customerId, {
          make_model: vehicleMakeModel || "Unknown",
          reg: vehicleReg || null,
          year: null,
          notes: null,
        })
      }
      router.push(`/admin/customers/${result.customerId}`)
    } else {
      setError(result.error || "Failed to create customer")
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-200 mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Customers
        </Link>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">New Customer</CardTitle>
            <CardDescription className="text-gray-400">
              Add a new customer account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="07xxx xxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                <textarea
                  name="address"
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Street, City, Postcode"
                />
              </div>

              <div className="border-t border-gray-700 pt-4">
                <p className="text-xs text-gray-500 mb-3">Vehicle (optional — can be added later)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Registration</label>
                    <input
                      name="vehicle_reg"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                      placeholder="e.g. AB12 CDE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Make / Model</label>
                    <input
                      name="vehicle_make_model"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. Ford Focus"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Internal notes about this customer"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {saving ? "Saving..." : "Create Customer"}
                </Button>
                <Link href="/admin/customers">
                  <Button type="button" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
