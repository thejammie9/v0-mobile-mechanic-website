import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, CheckCircle, Wrench, Zap, Shield, Car, Settings, Gauge } from "lucide-react"
import { getServiceAreaBySlug, getAllServiceAreas } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const area = getServiceAreaBySlug(slug)
  if (!area) return {}
  return {
    title: `Mobile Mechanic ${area.name} | Jamie's Auto Care`,
    description: `Looking for a mobile mechanic in ${area.name}? Jamie's Auto Care provides professional vehicle repairs, servicing, and diagnostics at your home or workplace in ${area.name}, ${area.county}.`,
    alternates: { canonical: `https://jamiesautocare.com/areas/${slug}` },
  }
}

const services = [
  { name: "Servicing", description: "Interim and full services, oil & filter changes", icon: Settings },
  { name: "Brakes", description: "Brake pads, discs, and full brake inspections", icon: Shield },
  { name: "Diagnostics", description: "Vehicle diagnostic scans and fault code reading", icon: Zap },
  { name: "Suspension", description: "Shock absorbers, drop links, anti-roll bar bushes", icon: Gauge },
  { name: "Tyres", description: "Tyre fitting and supply across all makes", icon: Car },
  { name: "Electrical", description: "Battery testing, alternator and starter checks", icon: Wrench },
]

const whyChoose = [
  "No garage visit needed — we come to you",
  "Work done at your home or workplace",
  "Fully qualified IMI technician",
  "Transparent pricing, confirmed before work begins",
  "3-month / 3,000 mile labour guarantee",
]

const countyColours: Record<string, string> = {
  "Edinburgh": "bg-blue-900/60 text-blue-300 border-blue-700",
  "East Lothian": "bg-green-900/60 text-green-300 border-green-700",
  "Midlothian": "bg-purple-900/60 text-purple-300 border-purple-700",
  "West Lothian": "bg-orange-900/60 text-orange-300 border-orange-700",
  "Scottish Borders": "bg-teal-900/60 text-teal-300 border-teal-700",
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const area = getServiceAreaBySlug(slug)
  if (!area) notFound()

  const allAreas = getAllServiceAreas()
  const nearbyNames: string[] = JSON.parse(area.nearby_areas)
  const nearbyAreaData = nearbyNames
    .map((name) => allAreas.find((a) => a.name === name && a.active))
    .filter(Boolean) as typeof allAreas
  const nearbyNoLink = nearbyNames.filter((name) => !allAreas.find((a) => a.name === name))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Jamie's Auto Care",
    description: `Mobile mechanic service in ${area.name}, ${area.county}`,
    url: "https://jamiesautocare.com",
    telephone: "07463451967",
    email: "contact@jamiesautocare.com",
    serviceArea: {
      "@type": "Place",
      name: `${area.name}, ${area.county}`,
    },
    areaServed: area.name,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-950">
        {/* Hero */}
        <section className="bg-blue-950 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-orange-400" />
                <span className={`text-xs font-medium px-2.5 py-1 rounded border ${countyColours[area.county] ?? "bg-gray-800 text-gray-300 border-gray-600"}`}>
                  {area.county}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Mobile Mechanic in {area.name}
              </h1>
              <p className="text-lg text-blue-200 leading-relaxed">{area.description}</p>
            </div>
          </div>
        </section>

        {/* Services in this area */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-100 mb-8">
              Services Available in {area.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => {
                const Icon = service.icon
                return (
                  <div key={service.name} className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100 mb-1">{service.name}</h3>
                      <p className="text-sm text-gray-400">{service.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Why choose */}
        <section className="py-14 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-100 mb-6">
                Why Choose Jamie&apos;s Auto Care in {area.name}?
              </h2>
              <ul className="space-y-3">
                {whyChoose.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Nearby areas */}
        {(nearbyAreaData.length > 0 || nearbyNoLink.length > 0) && (
          <section className="py-14">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-100 mb-6">
                Also Covering Nearby Areas
              </h2>
              <div className="flex flex-wrap gap-3">
                {nearbyAreaData.map((nearby) => (
                  <Link
                    key={nearby.slug}
                    href={`/areas/${nearby.slug}`}
                    className="bg-gray-900 border border-gray-700 hover:border-orange-500 text-gray-300 hover:text-orange-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {nearby.name}
                  </Link>
                ))}
                {nearbyNoLink.map((name) => (
                  <span
                    key={name}
                    className="bg-gray-900 border border-gray-800 text-gray-500 px-4 py-2 rounded-lg text-sm"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-14 bg-blue-950">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Book Your {area.name} Appointment
            </h2>
            <p className="text-blue-200 mb-6">
              Use the booking form on our homepage to request your appointment in {area.name}.
            </p>
            <Link
              href="/#booking"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Book Now
            </Link>
            <p className="text-blue-300/60 text-xs mt-3">
              Booking form is on the homepage — you&apos;ll be taken there to submit your details.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
