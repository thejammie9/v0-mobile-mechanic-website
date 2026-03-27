"use server"

import { getSiteSetting, saveSiteSetting } from "@/lib/db"

export type ChecklistItem = {
  id: string
  label: string
  category: string
  done: boolean
  note?: string
}

const DEFAULT_CHECKLIST: Omit<ChecklistItem, "done">[] = [
  // Technical
  { id: "gsc",          category: "Technical", label: "Google Search Console set up and verified" },
  { id: "sitemap_sub",  category: "Technical", label: "Sitemap submitted to Google Search Console" },
  { id: "bing_wmt",     category: "Technical", label: "Bing Webmaster Tools connected" },
  { id: "ssl",          category: "Technical", label: "SSL certificate active (https://)", note: "Already done ✓" },
  { id: "schema",       category: "Technical", label: "Schema.org LocalBusiness markup added", note: "Already done ✓" },
  { id: "canonical",    category: "Technical", label: "Canonical URLs set on all pages", note: "Already done ✓" },
  { id: "robots",       category: "Technical", label: "Robots.txt configured", note: "Already done ✓" },
  { id: "mobile",       category: "Technical", label: "Mobile-friendly design", note: "Already done ✓" },
  { id: "sitemap_xml",  category: "Technical", label: "Sitemap.xml in place at /sitemap.xml", note: "Already done ✓" },

  // Local SEO
  { id: "gmb_claimed",  category: "Local SEO", label: "Google Business Profile claimed and verified" },
  { id: "gmb_complete", category: "Local SEO", label: "Google Business Profile fully filled out (hours, description, photos)" },
  { id: "gmb_photos",   category: "Local SEO", label: "At least 10 photos on Google Business Profile" },
  { id: "bing_places",  category: "Local SEO", label: "Bing Places for Business listing created" },
  { id: "apple_maps",   category: "Local SEO", label: "Apple Maps listing claimed (via Apple Business Connect)" },
  { id: "yell",         category: "Local SEO", label: "Yell.com business listing created" },
  { id: "thomson",      category: "Local SEO", label: "Thomson Local listing created" },
  { id: "facebook_biz", category: "Local SEO", label: "Facebook Business Page set up" },
  { id: "nap_consist",  category: "Local SEO", label: "Business name, address, phone consistent everywhere (NAP)" },

  // Reviews
  { id: "google_10",    category: "Reviews", label: "10+ Google reviews" },
  { id: "google_20",    category: "Reviews", label: "20+ Google reviews" },
  { id: "review_reply", category: "Reviews", label: "Responding to all Google reviews" },
  { id: "checkatrade",  category: "Reviews", label: "Checkatrade profile set up" },
  { id: "trustpilot",   category: "Reviews", label: "Trustpilot profile set up" },

  // Content
  { id: "blog_1",       category: "Content", label: "First blog post published (local/car-related topic)" },
  { id: "blog_5",       category: "Content", label: "5+ blog posts published" },
  { id: "faq_done",     category: "Content", label: "FAQ page live with local keywords", note: "Already done ✓" },
  { id: "location_pgs", category: "Content", label: "Location pages for key service areas", note: "Already done ✓" },
  { id: "testimonials", category: "Content", label: "Customer testimonials shown on site" },
  { id: "gallery_imgs", category: "Content", label: "Gallery updated with recent job photos" },

  // Links & Citations
  { id: "fb_groups",    category: "Links", label: "Listed in local Facebook community groups" },
  { id: "nextdoor",     category: "Links", label: "Nextdoor business listing created" },
  { id: "freeindex",    category: "Links", label: "FreeIndex.co.uk listing created" },
  { id: "hotfrog",      category: "Links", label: "Hotfrog.co.uk listing created" },
  { id: "cylex",        category: "Links", label: "Cylex.co.uk listing created" },
]

export async function getSeoChecklist(): Promise<ChecklistItem[]> {
  const raw = getSiteSetting("seo_checklist")
  let saved: Record<string, boolean> = {}
  try { saved = JSON.parse(raw) } catch {}
  return DEFAULT_CHECKLIST.map(item => ({ ...item, done: saved[item.id] ?? false }))
}

export async function toggleSeoChecklistItem(id: string, done: boolean): Promise<void> {
  const { isAdminAuthenticated } = await import("@/app/admin/actions")
  if (!(await isAdminAuthenticated())) return
  const raw = getSiteSetting("seo_checklist")
  let saved: Record<string, boolean> = {}
  try { saved = JSON.parse(raw) } catch {}
  saved[id] = done
  saveSiteSetting("seo_checklist", JSON.stringify(saved))
}
