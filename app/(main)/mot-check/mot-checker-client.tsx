"use client"

import { useState } from "react"
import { Search, Loader2, CheckCircle, AlertTriangle, XCircle, CalendarDays, Car } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type DvlaResult = {
  make: string | null
  colour: string | null
  yearOfManufacture: number | null
  fuelType: string | null
  motExpiryDate: string | null
}

function formatDate(dateStr: string): string {
  // DVLA returns YYYY-MM-DD
  const [y, m, d] = dateStr.split("-")
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}

function getDaysUntil(dateStr: string): number {
  const expiry = new Date(dateStr)
  expiry.setHours(23, 59, 59, 999)
  return Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default function MotCheckerClient() {
  const [reg, setReg] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DvlaResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState("")

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = reg.trim().toUpperCase().replace(/\s/g, "")
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSearched(trimmed)

    try {
      const res = await fetch(`/api/dvla-lookup?reg=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 404) setError("Vehicle not found. Check the registration and try again.")
        else if (data.error === "DVLA_API_KEY not configured") setError("MOT checker is temporarily unavailable. Please try the official DVSA checker at check-mot.service.gov.uk")
        else setError("Something went wrong. Please try again.")
      } else {
        setResult(data)
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const days = result?.motExpiryDate ? getDaysUntil(result.motExpiryDate) : null
  const expired  = days !== null && days < 0
  const soonDue  = days !== null && days >= 0 && days <= 30
  const valid    = days !== null && days > 30

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form onSubmit={handleCheck} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Registration Number</label>
          <div className="flex gap-2">
            <Input
              value={reg}
              onChange={e => setReg(e.target.value.toUpperCase())}
              placeholder="e.g. AB12 CDE"
              className="font-mono tracking-widest text-lg bg-gray-700 border-gray-600 text-gray-100 uppercase"
              maxLength={8}
            />
            <Button
              type="submit"
              disabled={loading || !reg.trim()}
              className="bg-orange-600 hover:bg-orange-700 px-5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">UK vehicles only. Data sourced from the DVLA.</p>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-5 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium">Lookup failed</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Vehicle summary */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex items-center gap-4">
            <div className="bg-blue-900/40 p-3 rounded-xl shrink-0">
              <Car className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-gray-100 text-lg">
                {searched}
              </p>
              <p className="text-gray-400 text-sm">
                {[
                  result.make && (result.make.charAt(0) + result.make.slice(1).toLowerCase()),
                  result.colour && (result.colour.charAt(0) + result.colour.slice(1).toLowerCase()),
                  result.yearOfManufacture,
                  result.fuelType && (result.fuelType.charAt(0) + result.fuelType.slice(1).toLowerCase()),
                ].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          {/* MOT status */}
          {result.motExpiryDate ? (
            <div className={`rounded-2xl p-6 border ${
              expired  ? "bg-red-900/30 border-red-700" :
              soonDue  ? "bg-yellow-900/30 border-yellow-700" :
                         "bg-green-900/30 border-green-700"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {expired  ? <XCircle className="h-6 w-6 text-red-400 shrink-0" /> :
                 soonDue  ? <AlertTriangle className="h-6 w-6 text-yellow-400 shrink-0" /> :
                            <CheckCircle className="h-6 w-6 text-green-400 shrink-0" />}
                <div>
                  <p className={`font-bold text-lg ${expired ? "text-red-300" : soonDue ? "text-yellow-300" : "text-green-300"}`}>
                    {expired  ? "MOT Expired" :
                     soonDue  ? `MOT Due Soon — ${days} day${days === 1 ? "" : "s"} left` :
                                "MOT Valid"}
                  </p>
                  <p className={`text-sm flex items-center gap-1.5 ${expired ? "text-red-400" : soonDue ? "text-yellow-400" : "text-green-400"}`}>
                    <CalendarDays className="h-3.5 w-3.5" />
                    {expired ? "Expired " : "Expires "}{formatDate(result.motExpiryDate)}
                  </p>
                </div>
              </div>

              {expired && (
                <p className="text-red-400 text-sm mb-4">
                  Driving without a valid MOT is illegal (unless driving to a pre-booked MOT test). Book an MOT preparation check to get your vehicle ready.
                </p>
              )}
              {soonDue && (
                <p className="text-yellow-400 text-sm mb-4">
                  Your MOT expires soon. Book an MOT preparation check to identify and fix any issues before the test.
                </p>
              )}
              {valid && (
                <p className="text-green-400 text-sm mb-4">
                  Your MOT is valid — no action needed right now. Set a reminder for {days - 30} days&apos; time to stay on top of it.
                </p>
              )}

              {(expired || soonDue) && (
                <Link
                  href="/#booking"
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Book MOT Preparation Check →
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-600 rounded-2xl p-5">
              <p className="text-gray-400 text-sm">MOT expiry date not available for this vehicle. Check at <a href="https://www.check-mot.service.gov.uk" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline">check-mot.service.gov.uk</a>.</p>
            </div>
          )}
        </div>
      )}

      {/* Info box */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-xs text-gray-500">
        <p>This tool uses DVLA vehicle data. MOT expiry information is for guidance only — always verify with the official
        {" "}<a href="https://www.check-mot.service.gov.uk" target="_blank" rel="noopener noreferrer" className="text-gray-400 underline">DVSA MOT checker</a>.</p>
      </div>
    </div>
  )
}
