import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/booking", "/blog/", "/pricing", "/faq", "/gallery", "/areas/", "/terms", "/privacy", "/qualifications", "/what-to-expect"],
        disallow: ["/admin/", "/api/", "/confirm/", "/cancel/", "/quote/"],
      },
    ],
    sitemap: "https://jamiesautocare.com/sitemap.xml",
    host: "https://jamiesautocare.com",
  }
}
