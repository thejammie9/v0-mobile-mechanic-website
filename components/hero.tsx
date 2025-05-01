import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-blue-950 to-blue-900 text-white overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <Image src="/placeholder.svg?height=1080&width=1920" alt="Background" fill className="object-cover" priority />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Jamie's Auto Care – Fast, Reliable Repairs at Your Doorstep
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Quality servicing, diagnostics & repairs without the garage visit.
            </p>
            <Link href="#booking">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-6 text-lg">
                Book Now
              </Button>
            </Link>
          </div>

          <div className="hidden lg:block relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/placeholder.svg?height=800&width=600"
              alt="Mobile mechanic at work"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  )
}
