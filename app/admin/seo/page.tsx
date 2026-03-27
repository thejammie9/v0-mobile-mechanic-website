import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getSeoChecklist } from "@/app/actions/seo"
import SeoClient from "./seo-client"

export const dynamic = "force-dynamic"

const SITE_URL = "https://jamiesautocare.com"

const KEY_PAGES = [
  { path: "/",                  label: "Home" },
  { path: "/pricing",           label: "Pricing" },
  { path: "/faq",               label: "FAQ" },
  { path: "/gallery",           label: "Gallery" },
  { path: "/what-to-expect",    label: "What to Expect" },
  { path: "/qualifications",    label: "Qualifications" },
  { path: "/blog",              label: "Blog" },
  { path: "/areas",             label: "Service Areas" },
  { path: "/terms",             label: "Terms & Conditions" },
]

async function fetchPageMeta(path: string) {
  try {
    const res = await fetch(`${SITE_URL}${path}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JACAdmin/1.0)" },
      next: { revalidate: 0 },
    })
    const html = await res.text()
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)
    const description = descMatch?.[1]?.trim() || null
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)?.[1]?.trim() || null
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
    const h1 = h1Match?.[1]?.replace(/<[^>]+>/g, "").trim() || null
    const h2Count = (html.match(/<h2[b>]/gi) || []).length
    const imgTotal = (html.match(/<img /gi) || []).length
    const imgNoAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length
    return { title, description, canonical, h1, h2Count, imgTotal, imgNoAlt, ok: true }
  } catch {
    return { title: null, description: null, canonical: null, h1: null, h2Count: 0, imgTotal: 0, imgNoAlt: 0, ok: false }
  }
}

export default async function SeoPage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) redirect("/admin/login")

  const [checklist, ...pageMetas] = await Promise.all([
    getSeoChecklist(),
    ...KEY_PAGES.map(p => fetchPageMeta(p.path)),
  ])

  const pages = KEY_PAGES.map((p, i) => ({ ...p, ...pageMetas[i] }))

  return <SeoClient checklist={checklist} pages={pages} siteUrl={SITE_URL} />
}
