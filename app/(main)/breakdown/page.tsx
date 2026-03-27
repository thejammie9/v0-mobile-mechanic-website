import type { Metadata } from "next"
import Link from "next/link"
import { getSiteSetting } from "@/lib/db"
import { Phone, MessageCircle, BatteryWarning, CircleAlert, MapPin, Clock, CheckCircle, XCircle } from "lucide-react"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Roadside Battery & Tyre Assistance | Edinburgh & Midlothian",
  description:
    "Stuck in Edinburgh or Midlothian with a dead battery or flat tyre? Jamie's Auto Care provides mobile battery replacement and tyre-change assistance at your location.",
  alternates: { canonical: "https://jamiesautocare.com/breakdown" },
}

export default function BreakdownPage() {
  const phone        = getSiteSetting("phone") || "07463 451967"
  const whatsapp     = getSiteSetting("whatsapp_number") || ""
  const phoneClean   = phone.replace(/\s/g, "")
  const whatsappUrl  = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi Jamie, I need roadside assistance — ")}`
    : null

  return (
    <>
      {/* Hero */}
      <section className="bg-red-950 text-white py-14">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-red-800/60 text-red-200 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
            <CircleAlert className="h-4 w-4" />
            Roadside Assistance — Edinburgh &amp; Midlothian Only
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Dead Battery or Flat Tyre?<br className="hidden sm:block" /> We Come to You.
          </h1>
          <p className="text-lg text-red-200 max-w-2xl mx-auto mb-8">
            If you&apos;re stuck in the Edinburgh or Midlothian area with a dead battery or a flat tyre,
            call or message Jamie now — mobile roadside assistance, no recovery truck needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`tel:${phoneClean}`}
              className="inline-flex items-center justify-center gap-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors shadow-lg"
            >
              <Phone className="h-5 w-5" />
              Call Jamie Now — {phone}
            </a>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-green-700 hover:bg-green-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp Jamie
              </a>
            )}
          </div>
        </div>
      </section>

      {/* What we cover */}
      <section className="py-14 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-100 mb-10">
            Roadside Services Offered
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Battery */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-600/20 p-3 rounded-xl">
                  <BatteryWarning className="h-7 w-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-100">Dead Battery</h3>
              </div>
              <p className="text-gray-400 mb-4 leading-relaxed">
                Whether your car won&apos;t start or your battery has completely given up, Jamie can come to
                you and test the battery on the spot. If it needs replacing, a new battery can usually
                be fitted there and then.
              </p>
              <ul className="space-y-2">
                {["Battery test & diagnosis", "Battery supply and fit at your location", "Covers most car makes and models", "Checks charging system (alternator) too"].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tyre */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600/20 p-3 rounded-xl">
                  <svg className="h-7 w-7 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="12" y1="2" x2="12" y2="8" />
                    <line x1="12" y1="16" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="8" y2="12" />
                    <line x1="16" y1="12" x2="22" y2="12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-100">Flat Tyre</h3>
              </div>
              <p className="text-gray-400 mb-4 leading-relaxed">
                Got a puncture or a slow leak? If you have a spare tyre Jamie can swap it on at
                your location. If you don&apos;t have a spare, a replacement tyre can usually be sourced
                and fitted the same day.
              </p>
              <ul className="space-y-2">
                {["Spare tyre fitting at your location", "Replacement tyre supply and fit", "Tyre pressure check on all four wheels", "Advice on whether the tyre can be repaired"].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NOT offered — important honesty section */}
      <section className="py-10 bg-gray-800 border-y border-gray-700">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 text-center">Important — What This Service Doesn&apos;t Cover</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Vehicle recovery or towing",
              "Accident or collision damage",
              "Engine failures or major mechanical faults",
              "Fuel delivery",
              "Lockouts / keys locked in car",
              "Areas outside Edinburgh & Midlothian",
            ].map(item => (
              <div key={item} className="flex items-start gap-2 text-sm text-gray-400">
                <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center mt-5">
            For recovery or major breakdowns, contact your breakdown cover provider (AA, RAC, Green Flag) or a local recovery company.
          </p>
        </div>
      </section>

      {/* Area & response */}
      <section className="py-14 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex items-start gap-4">
              <MapPin className="h-6 w-6 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-100 mb-1">Area Covered</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Edinburgh, Dalkeith, Bonnyrigg, Penicuik, Gorebridge, Loanhead,
                  Newtongrange, Lasswade, Musselburgh and surrounding Midlothian areas.
                </p>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex items-start gap-4">
              <Clock className="h-6 w-6 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-100 mb-1">When to Call</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Available during normal working hours. Call or WhatsApp first to confirm
                  availability — Jamie will give you an honest ETA before you commit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 bg-orange-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Stuck Right Now?</h2>
          <p className="text-orange-200 mb-6">Call or WhatsApp — Jamie will let you know if he can get to you.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`tel:${phoneClean}`}
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-700 hover:bg-orange-50 font-bold px-8 py-3.5 rounded-xl transition-colors text-lg"
            >
              <Phone className="h-5 w-5" />
              {phone}
            </a>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-lg"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
