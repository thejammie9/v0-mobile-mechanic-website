import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, ChevronRight } from "lucide-react"
import { getActiveServiceAreas } from "@/lib/db"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Areas We Cover",
  description: "Professional mobile mechanic service across Edinburgh, East Lothian, Midlothian, and West Lothian. Find your area for local pricing and booking.",
  alternates: { canonical: "https://jamiesautocare.com/areas" },
}

const countyColours: Record<string, string> = {
  "Edinburgh": "bg-blue-900/60 text-blue-300 border-blue-700",
  "East Lothian": "bg-green-900/60 text-green-300 border-green-700",
  "Midlothian": "bg-purple-900/60 text-purple-300 border-purple-700",
  "West Lothian": "bg-orange-900/60 text-orange-300 border-orange-700",
  "Scottish Borders": "bg-teal-900/60 text-teal-300 border-teal-700",
}

export default function AreasPage() {
  const areas = getActiveServiceAreas()

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="bg-blue-950 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Areas We Cover</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Professional mobile mechanic service across Edinburgh, Lothians &amp; Borders.
            We come to you — at home, at work, or wherever your vehicle is.
          </p>
        </div>
      </section>

      {/* Area grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {areas.map((area) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}`}
                className="group bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-orange-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <h2 className="text-lg font-semibold text-gray-100 group-hover:text-orange-400 transition-colors">
                      {area.name}
                    </h2>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border flex-shrink-0 ${countyColours[area.county] ?? "bg-gray-800 text-gray-300 border-gray-600"}`}>
                    {area.county}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{area.description}</p>
                <div className="flex items-center gap-1 text-orange-500 text-sm font-medium mt-3 group-hover:gap-2 transition-all">
                  View details <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>

          {/* Not listed note */}
          <div className="mt-12 text-center bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-xl mx-auto">
            <p className="text-gray-300 text-lg font-medium mb-2">Don&apos;t see your area?</p>
            <p className="text-gray-400 mb-5">
              Get in touch — we may still be able to help. We cover a wide area and are happy to discuss your location.
            </p>
            <Link
              href="/#contact"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
