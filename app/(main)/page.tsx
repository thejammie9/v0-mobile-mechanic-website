import type { Metadata } from "next"
import Hero from "@/components/hero"
import ServiceArea from "@/components/service-area"
import Services from "@/components/services"
import Portfolio from "@/components/portfolio"
import BookingForm from "@/components/booking-form"
import Contact from "@/components/contact"
import Reviews from "@/components/reviews"
import Credentials from "@/components/credentials"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Mobile Mechanic Edinburgh & Lothians | Jamie's Auto Care",
  description:
    "Mobile mechanic covering Edinburgh, Gorebridge, Dalkeith, Penicuik, Bonnyrigg & Midlothian. Repairs, servicing & diagnostics at your door — no garage needed.",
  alternates: {
    canonical: "https://jamiesautocare.com",
  },
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ServiceArea />
      <Services />
      <Portfolio />
      <BookingForm />
      <Contact />
      <Reviews />
      <Credentials />
      <Footer />
    </main>
  )
}
