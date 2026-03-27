import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, Wrench, Zap, Settings, Shield, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPricingItemsByCategory } from "@/lib/db"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent guide prices for mobile mechanic services across the Lothians. Servicing, brakes, diagnostics, suspension and more. Final price confirmed before work begins.",
  alternates: { canonical: "https://jamiesautocare.com/pricing" },
}

function getCategoryIcon(category: string) {
  const lower = category.toLowerCase()
  if (lower.includes("servic")) return Settings
  if (lower.includes("brake")) return Shield
  if (lower.includes("diagnost") || lower.includes("electric")) return Zap
  if (lower.includes("suspension") || lower.includes("steering")) return Wrench
  if (lower.includes("general")) return CheckCircle
  return Wrench
}

export default function PricingPage() {
  const grouped = getPricingItemsByCategory()
  const categories = Object.keys(grouped)

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="bg-blue-950 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Transparent Pricing</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            These are guide prices to help you budget. Your exact quote will always be confirmed
            before any work begins — no surprises, no hidden charges.
          </p>
        </div>
      </section>

      {/* Note banner */}
      <div className="bg-orange-600 py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white font-medium text-sm">
            All prices include parts and labour unless stated. Final price confirmed before work begins. No hidden charges.
          </p>
        </div>
      </div>

      {/* Pricing Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category)
              const items = grouped[category]
              return (
                <Card key={category} className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-100 text-xl">
                      <Icon className="h-5 w-5 text-orange-500" />
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {items.map((item) => (
                        <li key={item.id} className="flex justify-between items-start gap-4 border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                          <div className="flex-1">
                            <p className="text-gray-200 text-sm font-medium">{item.name}</p>
                            {item.note && (
                              <p className="text-gray-500 text-xs mt-0.5">{item.note}</p>
                            )}
                          </div>
                          <span className="text-orange-400 font-semibold text-sm whitespace-nowrap">{item.price}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Small print */}
          <p className="text-center text-gray-500 text-sm mt-10 max-w-2xl mx-auto">
            Prices shown are guide prices. Your exact quote will be confirmed before any work begins.
            We believe in being upfront — no surprises.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-3">Can&apos;t see what you need?</h2>
          <p className="text-gray-400 mb-6">
            Get in touch for a free, no-obligation quote on any job not listed here.
          </p>
          <Link
            href="/#booking"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            <Phone className="h-4 w-4" />
            Get a Free Quote
          </Link>
        </div>
      </section>
    </div>
  )
}
