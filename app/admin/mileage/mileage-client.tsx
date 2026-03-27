"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createMileageEntry, removeMileageEntry } from "@/app/actions/mileage"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Car, Plus } from "lucide-react"
import type { MileageEntry } from "@/lib/db"

type Props = {
  entries: MileageEntry[]
  taxYearStartStr: string
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function MileageClient({ entries: initialEntries, taxYearStartStr }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState(initialEntries)
  const [form, setForm] = useState({
    date: today(),
    from_location: "",
    to_location: "",
    miles: "",
    round_trip: false,
    customer_name: "",
    notes: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Stats
  const taxYearEntries = entries.filter(e => e.date >= taxYearStartStr)
  const taxYearMiles = taxYearEntries.reduce((sum, e) => sum + (e.round_trip ? e.miles * 2 : e.miles), 0)
  const totalMiles = entries.reduce((sum, e) => sum + (e.round_trip ? e.miles * 2 : e.miles), 0)
  const totalTrips = entries.length

  // HMRC: 45p/mile first 10k, 25p/mile after
  const taxRelief = taxYearMiles <= 10000
    ? taxYearMiles * 0.45
    : 10000 * 0.45 + (taxYearMiles - 10000) * 0.25

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.from_location.trim() || !form.to_location.trim() || !form.miles) {
      setError("Please fill in all required fields.")
      return
    }
    const miles = parseFloat(form.miles)
    if (isNaN(miles) || miles <= 0) {
      setError("Miles must be a positive number.")
      return
    }
    setSaving(true)
    const result = await createMileageEntry({
      date: form.date,
      booking_id: null,
      customer_name: form.customer_name.trim() || null,
      from_location: form.from_location.trim(),
      to_location: form.to_location.trim(),
      miles,
      round_trip: form.round_trip ? 1 : 0,
      notes: form.notes.trim() || null,
    })
    setSaving(false)
    if (result.success && result.entry) {
      setEntries([result.entry, ...entries])
      setForm({ date: today(), from_location: "", to_location: "", miles: "", round_trip: false, customer_name: "", notes: "" })
      router.refresh()
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this mileage entry?")) return
    const result = await removeMileageEntry(id)
    if (result.success) {
      setEntries(entries.filter(e => e.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Car className="h-7 w-7 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-100">Mileage Log</h1>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          HMRC allows 45p/mile for the first 10,000 miles per tax year, then 25p/mile after that.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total Miles (All)</CardDescription>
              <CardTitle className="text-2xl text-gray-100">{totalMiles.toFixed(1)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total Trips</CardDescription>
              <CardTitle className="text-2xl text-gray-100">{totalTrips}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Tax Year Miles</CardDescription>
              <CardTitle className="text-2xl text-orange-400">{taxYearMiles.toFixed(1)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Est. Tax Relief</CardDescription>
              <CardTitle className="text-2xl text-green-400">£{taxRelief.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Add Trip Form */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-400" />
              Add Trip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-md px-4 py-2 text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">From *</label>
                  <input
                    type="text"
                    value={form.from_location}
                    onChange={e => setForm({ ...form, from_location: e.target.value })}
                    required
                    placeholder="e.g. Home / Postcode"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">To *</label>
                  <input
                    type="text"
                    value={form.to_location}
                    onChange={e => setForm({ ...form, to_location: e.target.value })}
                    required
                    placeholder="e.g. Customer address"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Miles (one way) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={form.miles}
                    onChange={e => setForm({ ...form, miles: e.target.value })}
                    required
                    placeholder="0.0"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Customer Name (optional)</label>
                  <input
                    type="text"
                    value={form.customer_name}
                    onChange={e => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="Optional"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Optional"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.round_trip}
                    onChange={e => setForm({ ...form, round_trip: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                  />
                  Round trip (doubles the mileage)
                </label>
                {form.round_trip && form.miles && !isNaN(parseFloat(form.miles)) && (
                  <span className="text-xs text-orange-400">
                    Total: {(parseFloat(form.miles) * 2).toFixed(1)} miles
                  </span>
                )}
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {saving ? "Adding..." : "Add Trip"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Entries Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">All Trips</CardTitle>
            <CardDescription className="text-gray-400">{entries.length} total entries</CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No mileage entries yet. Add your first trip above.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 font-medium py-2 pr-4">Date</th>
                      <th className="text-left text-gray-400 font-medium py-2 pr-4">Route</th>
                      <th className="text-right text-gray-400 font-medium py-2 pr-4">Miles</th>
                      <th className="text-left text-gray-400 font-medium py-2 pr-4">Customer</th>
                      <th className="text-left text-gray-400 font-medium py-2 pr-4">Notes</th>
                      <th className="text-right text-gray-400 font-medium py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(entry => {
                      const displayMiles = entry.round_trip ? entry.miles * 2 : entry.miles
                      return (
                        <tr key={entry.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{entry.date}</td>
                          <td className="py-3 pr-4 text-gray-200">
                            <span>{entry.from_location}</span>
                            <span className="text-gray-500 mx-1">→</span>
                            <span>{entry.to_location}</span>
                          </td>
                          <td className="py-3 pr-4 text-right text-gray-100 whitespace-nowrap">
                            {displayMiles.toFixed(1)}
                            {entry.round_trip ? (
                              <span className="ml-1 text-xs text-orange-400">(return)</span>
                            ) : null}
                          </td>
                          <td className="py-3 pr-4 text-gray-400">
                            {entry.customer_name || <span className="text-gray-600">—</span>}
                          </td>
                          <td className="py-3 pr-4 text-gray-400 max-w-[150px]">
                            <span className="truncate block">{entry.notes || <span className="text-gray-600">—</span>}</span>
                          </td>
                          <td className="py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(entry.id)}
                              className="border-red-800 text-red-400 hover:bg-red-900/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-600">
                      <td colSpan={2} className="py-3 text-gray-400 font-medium">Total</td>
                      <td className="py-3 text-right text-orange-400 font-bold">{totalMiles.toFixed(1)}</td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
