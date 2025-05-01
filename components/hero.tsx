import Image from "next/image"

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-20 md:py-32 relative" id="hero">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Mobile Mechanic Services in Edinburgh</h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Quality servicing, diagnostics & repairs without the garage visit.
            </p>
            <a
              href="#booking"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded text-lg inline-block"
            >
              Book Now
            </a>
          </div>
          <div className="hidden lg:block relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/mechanic-engine-work.png"
              alt="Mobile mechanic at work"
              className="object-cover rounded-lg"
              fill
              priority
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  )
}
