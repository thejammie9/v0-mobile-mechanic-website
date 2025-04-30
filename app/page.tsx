import Hero from "@/components/hero"
import Services from "@/components/services"
import Gallery from "@/components/gallery"
import TrustpilotWidget from "@/components/trustpilot"
import BookingForm from "@/components/booking-form"
import Contact from "@/components/contact"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
      <Gallery />
      <TrustpilotWidget />
      <BookingForm />
      <Contact />
      <Footer />
    </main>
  )
}
