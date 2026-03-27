"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateBookingAvailability } from "@/app/actions/availability"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Save, ToggleLeft, ToggleRight, X, Plus } from "lucide-react"
import type { BookingAvailability } from "@/lib/db"

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Quick-add presets — all common times; only shown when NOT already active
const PRESET_TIMES = [
  "07:00","07:30","08:00","08:30","09:00","09:30",
  "10:00","10:30","11:00","11:30","12:00","12:30",
  "13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00",
]

function fmt12(t: string) {
  const [hStr, mStr] = t.split(":")
  const h = parseInt(hStr, 10)
  const m = mStr || "00"
  const ampm = h < 12 ? "AM" : "PM"
  const h12 = h % 12 || 12
  return m === "00" ? `${h12}${ampm}` : `${h12}:${m}${ampm}`
}

type Props = { config: BookingAvailability }

export default function AvailabilityClient({ config }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [enabled, setEnabled] = useState(config.enabled === 1)
  const [slots, setSlots] = useState<string[]>([...config.slots].sort())
  const [availDays, setAvailDays] = useState<number[]>(config.available_days)
  const [closedDates, setClosedDates] = useState<string[]>(config.closed_dates)
  const [daySlots, setDaySlots] = useState<Record<string, string[]>>(config.day_slots ?? {})
  const [overrideDay, setOverrideDay] = useState<string>("")
  const [newClosedDate, setNewClosedDate] = useState("")
  const [newSlot, setNewSlot] = useState("")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  function toggleDay(d: number) {
    setAvailDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort())
  }

  function addSlot(s: string) {
    if (!s || slots.includes(s)) return
    setSlots(prev => [...prev, s].sort())
  }

  function removeSlot(s: string) {
    setSlots(prev => prev.filter(x => x !== s))
  }

  function addCustomSlot() {
    const s = newSlot.trim()
    if (!s) return
    addSlot(s)
    setNewSlot("")
  }

  function addClosedDate() {
    const d = newClosedDate.trim()
    if (!d || closedDates.includes(d)) return
    setClosedDates([...closedDates, d].sort())
    setNewClosedDate("")
  }

  function removeClosedDate(d: string) {
    setClosedDates(closedDates.filter(x => x !== d))
  }

  function handleSave() {
    setError("")
    setSaved(false)
    startTransition(async () => {
      const result = await updateBookingAvailability({
        enabled: enabled ? 1 : 0,
        slots,
        available_days: availDays,
        closed_dates: closedDates,
        day_slots: daySlots,
      })
      if (result.success) {
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(result.error || "Failed to save")
      }
    })
  }

  const availablePresets = PRESET_TIMES.filter(t => !slots.includes(t))

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-7 w-7 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-100">Booking Availability</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">{error}</div>
        )}
        {saved && (
          <div className="mb-4 p-3 bg-green-900/40 border border-green-700 rounded text-green-300 text-sm">Settings saved.</div>
        )}

        {/* Master toggle */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-gray-100">Online Bookings</CardTitle>
            <CardDescription className="text-gray-400">
              Turn off to prevent customers from submitting new bookings via the website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`flex items-center gap-3 px-5 py-3 rounded-lg border text-sm font-semibold transition-colors ${
                enabled
                  ? "bg-green-900/40 border-green-600 text-green-300"
                  : "bg-red-900/40 border-red-700 text-red-300"
              }`}
            >
              {enabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
              {enabled ? "Bookings are OPEN" : "Bookings are CLOSED"}
            </button>
          </CardContent>
        </Card>

        {/* Available days */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-400" /> Working Days
            </CardTitle>
            <CardDescription className="text-gray-400">
              Days when bookings can be made. Customers won&apos;t see unavailable days in the calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {DAY_LABELS.map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`w-14 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    availDays.includes(idx)
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-gray-600 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time slots — redesigned */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-400" /> Time Slots
            </CardTitle>
            <CardDescription className="text-gray-400">
              These are the appointment start times offered to customers. Remove ones you don&apos;t want, add ones you do.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Active slots — clearly shown with remove buttons */}
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Active slots ({slots.length})</p>
              {slots.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No slots active — customers won&apos;t see any times to book.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map(s => (
                    <div key={s} className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/50 rounded-lg px-3 py-1.5 text-sm font-medium text-orange-300">
                      {fmt12(s)}
                      <button
                        type="button"
                        onClick={() => removeSlot(s)}
                        className="text-orange-400/70 hover:text-orange-200 transition-colors ml-0.5"
                        title={`Remove ${s}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick-add from presets */}
            {availablePresets.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Quick add</p>
                <div className="flex flex-wrap gap-1.5">
                  {availablePresets.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addSlot(t)}
                      className="px-3 py-1.5 rounded-lg border border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-300 text-sm transition-colors"
                    >
                      + {fmt12(t)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom time input */}
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Add custom time</p>
              <div className="flex gap-2 items-center">
                <input
                  type="time"
                  value={newSlot}
                  onChange={e => setNewSlot(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Button type="button" size="sm" onClick={addCustomSlot} disabled={!newSlot || slots.includes(newSlot)}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Per-day slot overrides */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-400" /> Day-Specific Hours
            </CardTitle>
            <CardDescription className="text-gray-400">
              Override time slots for specific days (e.g. shorter hours on Saturday).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing overrides */}
            {Object.entries(daySlots).map(([dayIdx, daySlotsArr]) => {
              const dayName = DAY_LABELS[Number(dayIdx)]
              return (
                <div key={dayIdx} className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-300">{dayName} override</span>
                    <button
                      type="button"
                      onClick={() => setDaySlots(prev => { const n = { ...prev }; delete n[dayIdx]; return n })}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove override
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {daySlotsArr.map(s => (
                      <div key={s} className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/50 rounded-md px-2.5 py-1 text-xs font-medium text-orange-300">
                        {fmt12(s)}
                        <button type="button"
                          onClick={() => setDaySlots(prev => ({ ...prev, [dayIdx]: prev[dayIdx].filter(x => x !== s) }))}
                          className="text-orange-400/70 hover:text-orange-200 ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {/* Quick add for this day */}
                    {PRESET_TIMES.filter(t => !daySlotsArr.includes(t)).map(t => (
                      <button key={t} type="button"
                        onClick={() => setDaySlots(prev => ({ ...prev, [dayIdx]: [...(prev[dayIdx] || []), t].sort() }))}
                        className="px-2.5 py-1 rounded-md border border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-300 text-xs transition-colors">
                        + {fmt12(t)}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Add a new day override */}
            <div className="flex items-center gap-2">
              <select
                value={overrideDay}
                onChange={e => setOverrideDay(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">— Add override for day —</option>
                {DAY_LABELS.map((label, idx) =>
                  availDays.includes(idx) && !daySlots[String(idx)] ? (
                    <option key={idx} value={idx}>{label}</option>
                  ) : null
                )}
              </select>
              <Button type="button" size="sm" disabled={!overrideDay}
                onClick={() => {
                  if (!overrideDay) return
                  setDaySlots(prev => ({ ...prev, [overrideDay]: [] }))
                  setOverrideDay("")
                }}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Closed / blackout dates */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-gray-100">Closed / Blackout Dates</CardTitle>
            <CardDescription className="text-gray-400">
              Specific dates when you&apos;re unavailable, even if they fall on a working day.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {closedDates.length === 0 ? (
              <p className="text-gray-500 text-sm">No blackout dates.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {closedDates.map(d => (
                  <div key={d} className="flex items-center gap-1.5 bg-red-900/30 border border-red-800 rounded-md px-3 py-1.5 text-sm text-red-300">
                    {d}
                    <button type="button" onClick={() => removeClosedDate(d)} className="text-red-500 hover:text-red-300 ml-1">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-center pt-1">
              <input
                type="date"
                value={newClosedDate}
                onChange={e => setNewClosedDate(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Button type="button" size="sm" onClick={addClosedDate}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8"
        >
          <Save className="h-4 w-4 mr-2" />
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </main>
    </div>
  )
}
