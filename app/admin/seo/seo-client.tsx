"use client"

import { useState, useTransition } from "react"
import { toggleSeoChecklistItem } from "@/app/actions/seo"
import type { ChecklistItem } from "@/app/actions/seo"
import {
  Search, CheckCircle2, Circle, AlertTriangle, ExternalLink,
  Zap, Globe, FileSearch, ListChecks, ChevronRight, Loader2,
} from "lucide-react"

// ── helpers ───────────────────────────────────────────────────────────────────

function titleScore(len: number | null) {
  if (!len) return { color: "text-red-400", bg: "bg-red-900/30", label: "Missing" }
  if (len < 30) return { color: "text-amber-400", bg: "bg-amber-900/30", label: "Too short" }
  if (len > 60) return { color: "text-amber-400", bg: "bg-amber-900/30", label: "Too long" }
  return { color: "text-green-400", bg: "bg-green-900/30", label: "Good" }
}
function descScore(len: number | null) {
  if (!len) return { color: "text-red-400", bg: "bg-red-900/30", label: "Missing" }
  if (len < 100) return { color: "text-amber-400", bg: "bg-amber-900/30", label: "Too short" }
  if (len > 160) return { color: "text-amber-400", bg: "bg-amber-900/30", label: "Too long" }
  return { color: "text-green-400", bg: "bg-green-900/30", label: "Good" }
}

function ScorePill({ color, bg, label, value }: { color: string; bg: string; label: string; value?: string | number }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${color}`}>
      {value !== undefined ? `${value} chars — ` : ""}{label}
    </span>
  )
}

function SpeedScore({ score }: { score: number }) {
  const color = score >= 90 ? "text-green-400" : score >= 50 ? "text-amber-400" : "text-red-400"
  const ring  = score >= 90 ? "ring-green-500/40" : score >= 50 ? "ring-amber-500/40" : "ring-red-500/40"
  const bg    = score >= 90 ? "bg-green-900/20"   : score >= 50 ? "bg-amber-900/20"   : "bg-red-900/20"
  return (
    <div className={`flex items-center justify-center w-16 h-16 rounded-full ring-4 ${ring} ${bg}`}>
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
    </div>
  )
}

// ── category colour ───────────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  "Technical": "bg-blue-900/40 text-blue-300 ring-blue-500/20",
  "Local SEO": "bg-purple-900/40 text-purple-300 ring-purple-500/20",
  "Reviews":   "bg-yellow-900/40 text-yellow-300 ring-yellow-500/20",
  "Content":   "bg-green-900/40 text-green-300 ring-green-500/20",
  "Links":     "bg-orange-900/40 text-orange-300 ring-orange-500/20",
}

// ── types ─────────────────────────────────────────────────────────────────────
type PageMeta = {
  path: string; label: string
  title: string | null; description: string | null
  canonical: string | null; h1: string | null
  imgTotal: number; imgNoAlt: number; ok: boolean
}

type LhrAudit = { score: number | null; displayValue?: string; title: string }

// ── main ──────────────────────────────────────────────────────────────────────
export default function SeoClient({
  checklist, pages, siteUrl,
}: {
  checklist: ChecklistItem[]
  pages: PageMeta[]
  siteUrl: string
}) {
  const [tab, setTab] = useState<"checklist" | "audit" | "speed" | "tools">("checklist")
  const [items, setItems] = useState(checklist)
  const [, startTransition] = useTransition()

  // Speed test state
  const [speedPage, setSpeedPage] = useState(siteUrl)
  const [speedStrategy, setSpeedStrategy] = useState<"mobile" | "desktop">("mobile")
  const [speedLoading, setSpeedLoading] = useState(false)
  const [speedResult, setSpeedResult] = useState<null | {
    perf: number; seo: number
    fcp: LhrAudit; lcp: LhrAudit; cls: LhrAudit; tbt: LhrAudit
    opportunities: { title: string; displayValue: string }[]
  }>(null)
  const [speedError, setSpeedError] = useState<string | null>(null)

  function toggleItem(id: string, done: boolean) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done } : i))
    startTransition(async () => {
      await toggleSeoChecklistItem(id, done)
    })
  }

  async function runSpeedTest() {
    setSpeedLoading(true)
    setSpeedResult(null)
    setSpeedError(null)
    try {
      const res = await fetch(`/api/admin/pagespeed?url=${encodeURIComponent(speedPage)}&strategy=${speedStrategy}`)
      const data = await res.json()
      if (data.error) { setSpeedError(data.error); return }

      const cats = data.lighthouseResult?.categories
      const audits = data.lighthouseResult?.audits
      const getAudit = (key: string): LhrAudit => ({
        score: audits?.[key]?.score ?? null,
        displayValue: audits?.[key]?.displayValue,
        title: audits?.[key]?.title || key,
      })

      const opps = Object.values(audits || {})
        .filter((a: any) => a.score !== null && a.score < 0.9 && a.details?.type === "opportunity" && a.displayValue)
        .map((a: any) => ({ title: a.title, displayValue: a.displayValue }))
        .slice(0, 6)

      setSpeedResult({
        perf: Math.round((cats?.performance?.score ?? 0) * 100),
        seo:  Math.round((cats?.seo?.score ?? 0) * 100),
        fcp:  getAudit("first-contentful-paint"),
        lcp:  getAudit("largest-contentful-paint"),
        cls:  getAudit("cumulative-layout-shift"),
        tbt:  getAudit("total-blocking-time"),
        opportunities: opps as any,
      })
    } catch (e) {
      setSpeedError("Failed to reach PageSpeed API. Try again in a moment.")
    } finally {
      setSpeedLoading(false)
    }
  }

  // Checklist stats
  const categories = [...new Set(items.map(i => i.category))]
  const doneCount = items.filter(i => i.done).length
  const pct = Math.round((doneCount / items.length) * 100)

  const tabs = [
    { key: "checklist" as const, label: "Checklist",  icon: ListChecks },
    { key: "audit"     as const, label: "Page Audit", icon: FileSearch },
    { key: "speed"     as const, label: "Speed Test", icon: Zap },
    { key: "tools"     as const, label: "Tools",      icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8 max-w-5xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-green-500/10 rounded-lg ring-1 ring-green-500/20">
            <Search className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">SEO Tools</h1>
            <p className="text-sm text-gray-500">Track and improve your Google rankings</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1 mb-8">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200"
                }`}>
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── Checklist ── */}
        {tab === "checklist" && (
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-100">Overall Progress</span>
                <span className="text-lg font-bold text-gray-100">{doneCount} / {items.length}</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-orange-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{pct}% complete — {items.length - doneCount} tasks remaining</p>
            </div>

            {categories.map(cat => {
              const catItems = items.filter(i => i.category === cat)
              const catDone = catItems.filter(i => i.done).length
              return (
                <div key={cat} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${CAT_COLOR[cat] || "bg-gray-700 text-gray-300 ring-gray-600"}`}>
                      {cat}
                    </span>
                    <span className="text-xs text-gray-500">{catDone}/{catItems.length}</span>
                  </div>
                  <div className="divide-y divide-gray-700/50">
                    {catItems.map(item => (
                      <label key={item.id} className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors hover:bg-gray-700/30 ${item.done ? "opacity-60" : ""}`}>
                        <button
                          onClick={() => toggleItem(item.id, !item.done)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {item.done
                            ? <CheckCircle2 className="h-5 w-5 text-green-400" />
                            : <Circle className="h-5 w-5 text-gray-500" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${item.done ? "line-through text-gray-500" : "text-gray-200"}`}>
                            {item.label}
                          </span>
                          {item.note && (
                            <span className="ml-2 text-xs text-green-400">{item.note}</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Page Audit ── */}
        {tab === "audit" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Live check of your key pages — title tags, meta descriptions, H1s and more.</p>
            {pages.map(p => {
              const tLen = p.title?.length ?? null
              const dLen = p.description?.length ?? null
              const ts = titleScore(tLen)
              const ds = descScore(dLen)
              const issues = [
                !p.h1 && "No H1 tag",
                !p.canonical && "No canonical URL",
                p.imgNoAlt > 0 && `${p.imgNoAlt} image${p.imgNoAlt > 1 ? "s" : ""} missing alt text`,
              ].filter(Boolean) as string[]

              return (
                <div key={p.path} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-100">{p.label}</span>
                      <span className="ml-2 text-xs text-gray-500 font-mono">{p.path}</span>
                    </div>
                    {!p.ok ? (
                      <span className="text-xs text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full">Fetch failed</span>
                    ) : issues.length === 0 ? (
                      <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> All good
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {issues.length} issue{issues.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-4 space-y-3 text-sm">
                    {/* Title */}
                    <div className="flex items-start gap-3">
                      <span className="w-28 flex-shrink-0 text-gray-500 text-xs pt-0.5">Title tag</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 leading-snug">{p.title || <span className="italic text-red-400">Missing</span>}</p>
                        <ScorePill {...ts} value={tLen ?? undefined} />
                      </div>
                    </div>
                    {/* Description */}
                    <div className="flex items-start gap-3">
                      <span className="w-28 flex-shrink-0 text-gray-500 text-xs pt-0.5">Description</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 leading-snug">{p.description || <span className="italic text-red-400">Missing</span>}</p>
                        <ScorePill {...ds} value={dLen ?? undefined} />
                      </div>
                    </div>
                    {/* H1 */}
                    <div className="flex items-start gap-3">
                      <span className="w-28 flex-shrink-0 text-gray-500 text-xs pt-0.5">H1 heading</span>
                      <p className={`flex-1 ${p.h1 ? "text-gray-200" : "italic text-red-400"}`}>
                        {p.h1 || "Missing"}
                      </p>
                    </div>
                    {/* Canonical */}
                    <div className="flex items-start gap-3">
                      <span className="w-28 flex-shrink-0 text-gray-500 text-xs pt-0.5">Canonical</span>
                      <p className={`flex-1 text-xs font-mono truncate ${p.canonical ? "text-green-400" : "italic text-amber-400"}`}>
                        {p.canonical || "Not set"}
                      </p>
                    </div>
                    {/* Images */}
                    {p.imgTotal > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="w-28 flex-shrink-0 text-gray-500 text-xs pt-0.5">Images</span>
                        <p className={`flex-1 text-sm ${p.imgNoAlt > 0 ? "text-amber-400" : "text-green-400"}`}>
                          {p.imgTotal} total — {p.imgNoAlt > 0 ? `${p.imgNoAlt} missing alt` : "all have alt text ✓"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Speed Test ── */}
        {tab === "speed" && (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-gray-100">Google PageSpeed Insights</h2>
              <p className="text-sm text-gray-400">Test any page on your site. Scores are from Google's own tool — higher is better (90+ is good).</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={speedPage}
                  onChange={e => setSpeedPage(e.target.value)}
                  placeholder="https://jamiesautocare.com"
                  className="flex-1 bg-gray-900 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex gap-2">
                  {(["mobile", "desktop"] as const).map(s => (
                    <button key={s} onClick={() => setSpeedStrategy(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        speedStrategy === s ? "bg-orange-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={runSpeedTest} disabled={speedLoading || !speedPage}
                  className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors">
                  {speedLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Testing…</> : <><Zap className="h-4 w-4" /> Run Test</>}
                </button>
              </div>
            </div>

            {speedError && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-sm text-red-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                {speedError}
              </div>
            )}

            {speedResult && (
              <div className="space-y-4">
                {/* Score cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center gap-5">
                    <SpeedScore score={speedResult.perf} />
                    <div>
                      <p className="text-gray-400 text-sm">Performance</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {speedResult.perf >= 90 ? "Excellent — keep it up" : speedResult.perf >= 50 ? "Needs some work" : "Needs improvement"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center gap-5">
                    <SpeedScore score={speedResult.seo} />
                    <div>
                      <p className="text-gray-400 text-sm">SEO</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {speedResult.seo >= 90 ? "Well optimised" : speedResult.seo >= 50 ? "Room to improve" : "Needs attention"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Core Web Vitals */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-700">
                    <h3 className="font-semibold text-gray-100 text-sm">Core Web Vitals</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-700">
                    {[speedResult.fcp, speedResult.lcp, speedResult.cls, speedResult.tbt].map(v => {
                      const s = v.score ?? 0
                      const col = s >= 0.9 ? "text-green-400" : s >= 0.5 ? "text-amber-400" : "text-red-400"
                      return (
                        <div key={v.title} className="p-4 text-center">
                          <p className={`text-lg font-bold ${col}`}>{v.displayValue || "—"}</p>
                          <p className="text-xs text-gray-500 mt-1">{v.title}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Opportunities */}
                {speedResult.opportunities.length > 0 && (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-700">
                      <h3 className="font-semibold text-gray-100 text-sm">Opportunities to improve</h3>
                    </div>
                    <div className="divide-y divide-gray-700/50">
                      {speedResult.opportunities.map((o, i) => (
                        <div key={i} className="px-5 py-3 flex items-center justify-between">
                          <span className="text-sm text-gray-300">{o.title}</span>
                          <span className="text-xs text-amber-400 ml-4 flex-shrink-0">{o.displayValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tools ── */}
        {tab === "tools" && (
          <div className="space-y-6">

            {/* Google tools */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-700">
                <h2 className="font-semibold text-gray-100">Google Tools</h2>
                <p className="text-xs text-gray-500 mt-0.5">Essential free tools from Google</p>
              </div>
              <div className="divide-y divide-gray-700/50">
                {[
                  {
                    title: "Google Search Console",
                    desc: "See which search queries bring people to your site, fix indexing issues, submit your sitemap.",
                    url: "https://search.google.com/search-console",
                    badge: "Must have",
                    badgeColor: "bg-green-900/50 text-green-300",
                  },
                  {
                    title: "Google Business Profile",
                    desc: "Manage how your business appears on Google Search and Maps. Critical for local SEO.",
                    url: "https://business.google.com",
                    badge: "Must have",
                    badgeColor: "bg-green-900/50 text-green-300",
                  },
                  {
                    title: "PageSpeed Insights",
                    desc: "Check your site speed and Core Web Vitals directly on Google's tool.",
                    url: "https://pagespeed.web.dev",
                    badge: "Useful",
                    badgeColor: "bg-blue-900/50 text-blue-300",
                  },
                  {
                    title: "Rich Results Test",
                    desc: "Test your structured data (Schema.org) to see how Google reads your pages.",
                    url: "https://search.google.com/test/rich-results",
                    badge: "Useful",
                    badgeColor: "bg-blue-900/50 text-blue-300",
                  },
                  {
                    title: "Google's Mobile-Friendly Test",
                    desc: "Check if Google considers your site mobile-friendly.",
                    url: "https://search.google.com/test/mobile-friendly",
                    badge: "Useful",
                    badgeColor: "bg-blue-900/50 text-blue-300",
                  },
                ].map(tool => (
                  <a key={tool.url} href={tool.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-4 px-5 py-4 hover:bg-gray-700/30 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-100 group-hover:text-orange-400 transition-colors">{tool.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tool.badgeColor}`}>{tool.badge}</span>
                      </div>
                      <p className="text-sm text-gray-400">{tool.desc}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-orange-400 flex-shrink-0 mt-0.5 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Local directories */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-700">
                <h2 className="font-semibold text-gray-100">Local Directory Listings</h2>
                <p className="text-xs text-gray-500 mt-0.5">Submit to these free directories to build local citations (NAP consistency matters)</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-x-0 sm:divide-x divide-y divide-gray-700/50">
                {[
                  { name: "Bing Places",     url: "https://www.bingplaces.com",          priority: "High" },
                  { name: "Apple Business Connect", url: "https://register.apple.com",   priority: "High" },
                  { name: "Yell.com",        url: "https://www.yell.com/business-owner", priority: "High" },
                  { name: "Thomson Local",   url: "https://www.thomsonlocal.com",         priority: "Medium" },
                  { name: "Checkatrade",     url: "https://www.checkatrade.com",          priority: "High" },
                  { name: "FreeIndex",       url: "https://www.freeindex.co.uk",          priority: "Medium" },
                  { name: "Cylex UK",        url: "https://www.cylex.co.uk",              priority: "Medium" },
                  { name: "Scoot",           url: "https://www.scoot.co.uk",              priority: "Medium" },
                  { name: "Hotfrog UK",      url: "https://www.hotfrog.co.uk",            priority: "Low" },
                  { name: "Nextdoor",        url: "https://business.nextdoor.com",        priority: "Medium" },
                ].map(d => {
                  const pc = d.priority === "High" ? "text-red-400 bg-red-900/30" : d.priority === "Medium" ? "text-amber-400 bg-amber-900/30" : "text-gray-400 bg-gray-700"
                  return (
                    <a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-700/30 transition-colors group">
                      <span className="text-sm font-medium text-gray-200 group-hover:text-orange-400 transition-colors">{d.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${pc}`}>{d.priority}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-gray-100">Quick Tips for Local SEO</h2>
              {[
                "Make sure your business name, address and phone number are identical everywhere online — Google uses this to verify you're a real local business.",
                "Ask every happy customer for a Google review. Even just 20 genuine reviews will put you ahead of most local competitors.",
                "Post to your Google Business Profile regularly — photos of jobs, updates, offers. It signals activity to Google.",
                "Use location-specific phrases in your page content naturally, e.g. 'mobile mechanic in Dalkeith' rather than just 'mobile mechanic'.",
                "A blog post like 'Top 5 signs your car needs a service in Edinburgh' targets real search queries and brings in organic traffic.",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <ChevronRight className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
