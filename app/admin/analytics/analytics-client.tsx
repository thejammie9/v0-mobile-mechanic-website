"use client"

import { useState } from "react"
import { BarChart3, Eye, Users, TrendingUp, Clock, Globe, ArrowUpRight } from "lucide-react"
import type { PageViewStats, RecentPageView } from "@/lib/db"

// ── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/pricing": "Pricing",
  "/faq": "FAQ",
  "/gallery": "Gallery",
  "/terms": "Terms & Conditions",
  "/privacy": "Privacy Policy",
  "/qualifications": "Qualifications",
  "/what-to-expect": "What to Expect",
  "/blog": "Blog",
  "/areas": "Service Areas",
}

function pageLabel(path: string) {
  return PAGE_LABELS[path] || path
}

function deviceType(ua: string | null): string {
  if (!ua) return "Unknown"
  if (/mobile|android|iphone|ipad/i.test(ua)) return "Mobile"
  if (/tablet|ipad/i.test(ua)) return "Tablet"
  return "Desktop"
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  })
}

function cleanReferrer(ref: string) {
  try {
    const u = new URL(ref)
    return u.hostname.replace(/^www\./, "")
  } catch {
    return ref
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, icon: Icon, color = "orange",
}: {
  title: string; value: string | number; sub?: string
  icon: React.ElementType; color?: "orange" | "blue" | "green" | "purple"
}) {
  const colours = {
    orange: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
    blue:   "bg-blue-500/10 text-blue-400 ring-blue-500/20",
    green:  "bg-green-500/10 text-green-400 ring-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 ring-purple-500/20",
  }
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ring-1 ${colours[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-100 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function DualBar({
  views, visitors, maxViews, date,
}: { views: number; visitors: number; maxViews: number; date: string }) {
  const vPct = maxViews > 0 ? Math.max(4, (views / maxViews) * 100) : 4
  const uPct = maxViews > 0 ? Math.max(4, (visitors / maxViews) * 100) : 4
  return (
    <div className="flex-1 flex flex-col items-center gap-0.5 group relative">
      <div className="w-full flex flex-col gap-0.5" style={{ height: 80 }}>
        <div className="w-full bg-orange-500/70 rounded-sm mt-auto" style={{ height: `${vPct}%` }} />
        <div className="w-full bg-blue-500/60 rounded-sm" style={{ height: `${uPct}%` }} />
      </div>
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-gray-700 border border-gray-600 text-gray-200 px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10 shadow-lg">
        {new Date(date + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}<br />
        {views} views · {visitors} visitors
      </span>
    </div>
  )
}

type Tab = "today" | "7d" | "30d"

// ── Main component ────────────────────────────────────────────────────────────

export default function AnalyticsClient({
  statsToday, stats7, stats30, todayByHour, recentViews,
}: {
  statsToday: PageViewStats
  stats7: PageViewStats
  stats30: PageViewStats
  todayByHour: { hour: string; views: number; visitors: number }[]
  recentViews: RecentPageView[]
}) {
  const [tab, setTab] = useState<Tab>("7d")
  const [visitorTab, setVisitorTab] = useState<"recent" | "referrers">("recent")

  const stats = tab === "today" ? statsToday : tab === "7d" ? stats7 : stats30
  const days  = tab === "today" ? 1 : tab === "7d" ? 7 : 30

  // Fill missing days
  const dayMap: Record<string, { views: number; visitors: number }> = {}
  for (const d of stats.viewsByDay) dayMap[d.date] = { views: d.views, visitors: d.visitors }
  const dayBars: { date: string; views: number; visitors: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    dayBars.push({ date: d, ...(dayMap[d] || { views: 0, visitors: 0 }) })
  }
  const maxViews = Math.max(...dayBars.map(d => d.views), 1)

  const totalViews30 = stats30.totalViews
  const totalPct = (n: number) => totalViews30 > 0 ? Math.round((n / totalViews30) * 100) : 0

  const tabs: { key: Tab; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "7d", label: "7 Days" },
    { key: "30d", label: "30 Days" },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg ring-1 ring-orange-500/20">
              <BarChart3 className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-100">Analytics</h1>
              <p className="text-sm text-gray-500">Public page traffic only</p>
            </div>
          </div>

          {/* Period tabs */}
          <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === t.key ? "bg-orange-500 text-white" : "text-gray-400 hover:text-gray-200"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Page Views" value={stats.totalViews.toLocaleString()}
            icon={Eye} color="orange"
            sub={tab === "today" ? "today" : `last ${days} days`} />
          <StatCard title="Unique Visitors" value={stats.uniqueVisitors.toLocaleString()}
            icon={Users} color="blue"
            sub="by IP address" />
          <StatCard title="Views (30 days)" value={stats30.totalViews.toLocaleString()}
            icon={TrendingUp} color="green" />
          <StatCard title="Visitors (30 days)" value={stats30.uniqueVisitors.toLocaleString()}
            icon={Globe} color="purple" />
        </div>

        {/* Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-100">
              {tab === "today" ? "Hourly traffic — today" : `Daily traffic — last ${days} days`}
            </h2>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-orange-500/70 inline-block" />
                Page Views
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-blue-500/60 inline-block" />
                Unique Visitors
              </span>
            </div>
          </div>

          {tab === "today" ? (
            todayByHour.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No traffic recorded yet today.</p>
            ) : (
              <div className="space-y-2">
                {todayByHour.map(h => (
                  <div key={h.hour} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 w-12 flex-shrink-0 font-mono">{h.hour}:00</span>
                    <div className="flex-1 flex gap-1">
                      <div className="flex-1 h-5 bg-gray-700 rounded overflow-hidden">
                        <div className="h-full bg-orange-500/70 rounded" style={{ width: `${Math.max(2, (h.views / Math.max(...todayByHour.map(x => x.views), 1)) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-gray-300 w-16 text-right flex-shrink-0 text-xs">
                      {h.views}v · {h.visitors}u
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : stats.totalViews === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No data yet — tracking begins as soon as the site receives visitors.</p>
          ) : (
            <div className="flex items-end gap-1 h-24 pt-8">
              {dayBars.map(d => (
                <DualBar key={d.date} date={d.date} views={d.views} visitors={d.visitors} maxViews={maxViews} />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Page breakdown — wider */}
          <div className="lg:col-span-3 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="font-semibold text-gray-100">Pages</h2>
              <p className="text-xs text-gray-500 mt-0.5">Top pages by traffic in selected period</p>
            </div>
            {stats.topPages.length === 0 ? (
              <p className="text-sm text-gray-500 p-6">No data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/60">
                    <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Page</th>
                    <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Views</th>
                    <th className="text-right text-xs text-gray-500 font-medium px-6 py-3">Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topPages.map((p, i) => (
                    <tr key={p.path} className={`border-b border-gray-700/40 ${i % 2 === 0 ? "" : "bg-gray-800/50"}`}>
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-200">{pageLabel(p.path)}</div>
                        <div className="text-xs text-gray-500 font-mono">{p.path}</div>
                        <div className="mt-1.5 h-1 rounded-full bg-gray-700 overflow-hidden w-full max-w-[160px]">
                          <div className="h-full bg-orange-500/60 rounded-full" style={{ width: `${totalPct(p.views)}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-orange-300">{p.views}</td>
                      <td className="px-6 py-3 text-right font-mono text-blue-300">{p.visitors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Referrers — narrower */}
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="font-semibold text-gray-100">Where visitors come from</h2>
              <p className="text-xs text-gray-500 mt-0.5">Traffic sources in selected period</p>
            </div>
            {stats.topReferrers.length === 0 ? (
              <p className="text-sm text-gray-500 p-6">No referrer data yet.</p>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {stats.topReferrers.map(r => {
                  const label = r.referrer === "Direct" ? "Direct / Unknown" : cleanReferrer(r.referrer)
                  const pct = stats.topReferrers[0]?.count > 0 ? Math.round((r.count / stats.topReferrers[0].count) * 100) : 0
                  return (
                    <div key={r.referrer} className="px-6 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-300 truncate max-w-[160px]" title={label}>{label}</span>
                        <span className="text-sm font-mono text-orange-300 ml-2">{r.count}</span>
                      </div>
                      <div className="h-1 rounded-full bg-gray-700 overflow-hidden">
                        <div className="h-full bg-orange-500/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent visitors */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-100">Recent Visitors</h2>
              <p className="text-xs text-gray-500 mt-0.5">Last 200 unique page views (1 per IP per page per day)</p>
            </div>
            <div className="flex gap-1 bg-gray-700/60 rounded-lg p-1">
              {(["recent", "referrers"] as const).map(t => (
                <button key={t} onClick={() => setVisitorTab(t)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    visitorTab === t ? "bg-gray-600 text-gray-100" : "text-gray-400 hover:text-gray-200"
                  }`}>
                  {t === "recent" ? "Feed" : "By IP"}
                </button>
              ))}
            </div>
          </div>

          {recentViews.length === 0 ? (
            <p className="text-sm text-gray-500 p-6">No visitor data yet.</p>
          ) : visitorTab === "recent" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/60">
                    <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Time</th>
                    <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Page</th>
                    <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden md:table-cell">IP Address</th>
                    <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Came From</th>
                    <th className="text-left text-xs text-gray-500 font-medium px-6 py-3 hidden sm:table-cell">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {recentViews.map((v, i) => (
                    <tr key={i} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                        <Clock className="h-3 w-3 inline mr-1.5 -mt-0.5" />
                        {formatTime(v.created_at)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-gray-200">{pageLabel(v.path)}</span>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <span className="font-mono text-xs text-orange-300">{v.ip_address || "—"}</span>
                      </td>
                      <td className="px-4 py-2.5 hidden lg:table-cell text-gray-500 text-xs">
                        {v.referrer ? (
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            {cleanReferrer(v.referrer)}
                          </span>
                        ) : "Direct"}
                      </td>
                      <td className="px-6 py-2.5 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          deviceType(v.user_agent) === "Mobile"
                            ? "bg-blue-900/50 text-blue-300"
                            : "bg-gray-700 text-gray-400"
                        }`}>
                          {deviceType(v.user_agent)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Group by IP */
            (() => {
              const byIp: Record<string, { count: number; pages: Set<string>; last: string; ua: string | null }> = {}
              for (const v of recentViews) {
                const ip = v.ip_address || "Unknown"
                if (!byIp[ip]) byIp[ip] = { count: 0, pages: new Set(), last: v.created_at, ua: v.user_agent }
                byIp[ip].count++
                byIp[ip].pages.add(v.path)
                if (v.created_at > byIp[ip].last) byIp[ip].last = v.created_at
              }
              const rows = Object.entries(byIp).sort((a, b) => b[1].count - a[1].count)
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700/60">
                        <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">IP Address</th>
                        <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Pages Seen</th>
                        <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Pages Visited</th>
                        <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Device</th>
                        <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(([ip, data]) => (
                        <tr key={ip} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                          <td className="px-6 py-2.5 font-mono text-xs text-orange-300">{ip}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-gray-200">{data.count}</td>
                          <td className="px-4 py-2.5 hidden md:table-cell text-gray-400 text-xs">
                            {[...data.pages].map(p => pageLabel(p)).join(", ")}
                          </td>
                          <td className="px-4 py-2.5 hidden sm:table-cell">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              deviceType(data.ua) === "Mobile"
                                ? "bg-blue-900/50 text-blue-300"
                                : "bg-gray-700 text-gray-400"
                            }`}>
                              {deviceType(data.ua)}
                            </span>
                          </td>
                          <td className="px-6 py-2.5 text-gray-500 text-xs">{formatTime(data.last)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()
          )}
        </div>
      </main>
    </div>
  )
}
