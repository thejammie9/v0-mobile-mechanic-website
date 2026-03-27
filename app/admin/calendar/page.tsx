import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getBookingsByMonth, getBookingsForDate } from "@/lib/db"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Printer, CalendarDays } from "lucide-react"
import CalendarBookingCard from "./booking-card"

export const dynamic = "force-dynamic"

const STATUS_DOT: Record<string, string> = {
  pending: "bg-yellow-400",
  confirmed: "bg-blue-400",
  completed: "bg-green-400",
  cancelled: "bg-red-400",
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun,1=Mon...6=Sat → convert to Mon=0..Sun=6
  const day = new Date(year, month - 1, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

type SearchParams = { y?: string; m?: string; d?: string }

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) redirect("/admin/login")

  const params = await searchParams
  const now = new Date()
  const year = parseInt(params.y || String(now.getFullYear()), 10)
  const month = parseInt(params.m || String(now.getMonth() + 1), 10)
  const selectedDay = params.d ? parseInt(params.d, 10) : null

  const bookings = getBookingsByMonth(year, month)
  const todayStr = now.toISOString().slice(0, 10)
  const todayBookings = getBookingsForDate(todayStr)

  // Build a map of date -> bookings
  const byDate: Record<string, typeof bookings> = {}
  for (const b of bookings) {
    const d = b.confirmed_date || b.preferred_date
    if (!d) continue
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(b)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Prev/next month
  const prevMonth = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 }
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 }

  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-IE", { month: "long", year: "numeric" })

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  // Selected day bookings
  const selectedDayStr = selectedDay ? `${year}-${pad(month)}-${pad(selectedDay)}` : null
  const selectedDayBookings = selectedDayStr ? (byDate[selectedDayStr] || []) : []

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <CalendarDays className="h-7 w-7 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-100">Calendar</h1>
        </div>

        {/* Month navigation */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/calendar?y=${prevMonth.y}&m=${prevMonth.m}`}
                  className="p-2 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                <h2 className="text-xl font-semibold text-gray-100 min-w-[200px] text-center">{monthName}</h2>
                <Link
                  href={`/admin/calendar?y=${nextMonth.y}&m=${nextMonth.m}`}
                  className="p-2 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <Link
                href="/admin/calendar"
                className="px-3 py-1.5 rounded-md border border-gray-600 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Today
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayNames.map(d => (
                <div key={d} className="text-center text-xs font-medium text-gray-500 py-1 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 rounded-lg bg-gray-900/30" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateStr = `${year}-${pad(month)}-${pad(day)}`
                const dayBookings = byDate[dateStr] || []
                const isToday = dateStr === todayStr
                const isSelected = day === selectedDay

                return (
                  <Link
                    key={day}
                    href={`/admin/calendar?y=${year}&m=${month}&d=${day}`}
                    className={`h-20 rounded-lg border p-1.5 flex flex-col transition-colors cursor-pointer ${
                      isSelected
                        ? "border-orange-500 bg-orange-950/30"
                        : dayBookings.length > 0
                        ? "border-orange-700/50 bg-orange-950/10 hover:bg-orange-950/20"
                        : "border-gray-700 bg-gray-850 hover:bg-gray-700/30"
                    } ${isToday ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-900" : ""}`}
                  >
                    <div className={`text-sm font-semibold mb-0.5 ${isToday ? "text-blue-300" : "text-gray-300"}`}>
                      {day}
                    </div>
                    {dayBookings.length > 0 && (
                      <div className="flex-1 overflow-hidden">
                        <div className="text-xs text-orange-300 font-medium">
                          {dayBookings.length} job{dayBookings.length !== 1 ? "s" : ""}
                        </div>
                        <div className="space-y-0.5 mt-0.5">
                          {dayBookings.slice(0, 2).map(b => (
                            <div key={b.id} className="flex items-center gap-1">
                              <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[b.status] || "bg-gray-400"}`} />
                              <span className="text-xs text-gray-400 truncate">{b.name.split(" ")[0]}</span>
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div className="text-xs text-gray-500">+{dayBookings.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Pending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Confirmed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Cancelled
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Selected day panel */}
        {selectedDayStr && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-gray-100 text-lg">
                {formatDate(selectedDayStr)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayBookings.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">No bookings on this day</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayBookings.map(b => (
                    <CalendarBookingCard
                      key={b.id}
                      booking={b}
                      returnUrl={`/admin/calendar?y=${year}&m=${month}&d=${selectedDay}`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Today's Jobs */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-100">
                Today&apos;s Jobs — {new Date().toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" })}
              </CardTitle>
              <button
                onClick={undefined}
                className="print:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-600 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                id="print-btn"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {todayBookings.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No jobs scheduled for today</p>
            ) : (
              <div className="space-y-4" id="today-jobs">
                {todayBookings.map(b => (
                  <CalendarBookingCard
                    key={b.id}
                    booking={b}
                    returnUrl="/admin/calendar"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Print script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('print-btn') && document.getElementById('print-btn').addEventListener('click', function() {
              window.print();
            });
          `
        }} />
      </main>

      <style>{`
        @media print {
          nav, .print\\:hidden { display: none !important; }
          body { background: white !important; }
          #today-jobs .bg-gray-700\\/40 { background: white !important; border: 1px solid #ccc !important; }
        }
      `}</style>
    </div>
  )
}
