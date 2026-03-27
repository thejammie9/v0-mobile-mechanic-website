import type { Metadata } from "next"
import Image from "next/image"
import BookingForm from "@/components/booking-form"
import { Shield, PhoneCall, MapPin, CreditCard } from "lucide-react"

export const metadata: Metadata = {
  title: "Book a Mobile Mechanic | Jamie's Auto Care",
  description:
    "Book your mobile mechanic appointment online. Jamie's Auto Care covers Edinburgh, Gorebridge, Dalkeith, Penicuik, Bonnyrigg & Midlothian.",
  robots: { index: false, follow: false },
}

const trust = [
  { icon: Shield,    label: "Fully Insured"       },
  { icon: PhoneCall, label: "No Call-Out Fee"      },
  { icon: MapPin,    label: "Comes to You"         },
  { icon: CreditCard,label: "Cash & Card Accepted" },
]

export default function StandaloneBookingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">

      {/* ── Header ── */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/Logo.png"
              alt="Jamie's Auto Care"
              width={44}
              height={44}
              className="rounded-lg"
            />
            <div>
              <p className="font-semibold text-gray-100 text-sm leading-tight">Jamie's Auto Care</p>
              <p className="text-xs text-gray-400 leading-tight">Mobile Mechanic · Edinburgh & Lothians</p>
            </div>
          </div>
          <a
            href="tel:07463451967"
            className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors text-sm font-medium"
          >
            <PhoneCall className="h-4 w-4" />
            <span className="hidden sm:inline">07463 451967</span>
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-2 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2">
          Book Your Appointment
        </h1>
        <p className="text-gray-400 text-base mb-7">
          Fill in the form below and Jamie will be in touch to confirm. No garage visit needed — we come to you.
        </p>

        {/* Trust badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
          {trust.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 bg-gray-800/60 border border-gray-700 rounded-lg py-3 px-2"
            >
              <Icon className="h-5 w-5 text-orange-400" />
              <span className="text-xs text-gray-300 font-medium text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Booking Form ── */}
      <BookingForm />

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 mt-4">
        <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© 2025 Jamie's Auto Care</span>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="/terms"   className="hover:text-gray-300 transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
