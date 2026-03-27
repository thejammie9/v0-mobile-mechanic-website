import { MetadataRoute } from "next"
import { areas } from "./(main)/areas/areas-data"
import { getAllBlogPosts } from "@/lib/db"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://jamiesautocare.com"

  const publishedPosts = getAllBlogPosts(true)

  return [
    { url: base,                         lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/booking`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/pricing`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/areas`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/mot-check`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/faq`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/qualifications`,     lastModified: new Date(), changeFrequency: "yearly",  priority: 0.7 },
    { url: `${base}/what-to-expect`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/gallery`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/terms`,              lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
    { url: `${base}/privacy`,            lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
    ...areas.map(a => ({
      url: `${base}/areas/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...publishedPosts.map(p => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.published_at ? new Date(p.published_at) : new Date(p.created_at),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ]
}
