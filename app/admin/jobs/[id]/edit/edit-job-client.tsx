"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateBookingDetails } from "@/app/actions/bookings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import type { Booking } from "@/lib/db"

export default function EditJobClient({ booking }: { booking: Booking }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState(booking.name)
  const [phone, setPhone] = useState(booking.phone)
  const [email, setEmail] = useState(booking.email)
  const [vehicle, setVehicle] = useState(booking.vehicle)
  const [vehicleReg, setVehicleReg] = useState(booking.vehicle_reg || "")
  const [vehicleYear, setVehicleYear] = useState(booking.vehicle_year || "")
  const [issue, setIssue] = useState(booking.issue)
  const [address, setAddress] = useState(booking.address || "")
  const [confirmedDate, setConfirmedDate] = useState(booking.confirmed_date || "")
  const [confirmedTime, setConfirmedTime] = useState(booking.confirmed_time || "")

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateBookingDetails(booking.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        vehicle: vehicle.trim(),
        vehicle_reg: vehicleReg.trim() || null,
        vehicle_year: vehicleYear.trim() || null,
        issue: issue.trim(),
        address: address.trim() || null,
        confirmed_date: confirmedDate || null,
        confirmed_time: confirmedTime || null,
      })
      if (result.success) {
        setSaved(true)
        router.refresh()
      } else {
        setError(result.error || "Failed to save")
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/jobs" className="text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-100">Edit Job</h1>
            <p className="text-gray-400 text-sm">{booking.name} — {booking.vehicle}</p>
          </div>
        </div>

        <div className="space-y-5 bg-gray-800 border border-gray-700 rounded-lg p-5">
          {/* Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300">Customer Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-gray-300">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
            </div>
          </div>

          <hr className="border-gray-700" />

          {/* Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3 space-y-1.5">
              <Label className="text-gray-300">Vehicle</Label>
              <Input
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="e.g. Ford Focus 1.6 Diesel"
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Registration</Label>
              <Input
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                placeholder="AB12 CDE"
                className="bg-gray-900 border-gray-600 text-gray-100 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Year</Label>
              <Input
                value={vehicleYear}
                onChange={(e) => setVehicleYear(e.target.value)}
                placeholder="2018"
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
            </div>
          </div>

          <hr className="border-gray-700" />

          {/* Job */}
          <div className="space-y-1.5">
            <Label className="text-gray-300">Job Description / Issue</Label>
            <Textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              rows={4}
              className="bg-gray-900 border-gray-600 text-gray-100"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-gray-300">Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Customer address"
              className="bg-gray-900 border-gray-600 text-gray-100"
            />
          </div>

          <hr className="border-gray-700" />

          {/* Date / Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300">Confirmed Date</Label>
              <Input
                type="date"
                value={confirmedDate}
                onChange={(e) => setConfirmedDate(e.target.value)}
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Confirmed Time</Label>
              <Input
                type="time"
                value={confirmedTime}
                onChange={(e) => setConfirmedTime(e.target.value)}
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 border border-green-800 rounded-md p-3">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Changes saved successfully.
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Link href="/admin/jobs">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
