import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative bg-blue-950 text-white overflow-hidden">
      {/* Background image - replace /images/hero.jpg with your own photo */}
      <Image
        src="/images/Banner.png"
        alt="Jamie's Auto Care - Mobile Mechanic"
        fill
        className="object-cover object-center opacity-40"
        priority
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 to-blue-950/50" />

      <div className="relative container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
            Mobile Mechanic Edinburgh &amp; Lothians — Repairs at Your Door
          </h1>
          <p className="text-base md:text-lg mb-2 text-gray-300">
            Professional servicing, diagnostics &amp; repairs at your home or workplace — no garage visit needed.
          </p>
          <p className="text-sm md:text-base mb-6 text-gray-400">
            Covering Edinburgh, Gorebridge, Dalkeith, Penicuik, Bonnyrigg, Loanhead, Lasswade &amp; all Midlothian areas.
          </p>
          <Link href="/#booking">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-900 to-transparent"></div>
    </section>
  )
}
