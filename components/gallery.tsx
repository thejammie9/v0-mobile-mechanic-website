import Image from "next/image"

const galleryItems = [
  {
    title: "Engine Overhaul",
    description: "Complete engine rebuild after catastrophic timing belt failure.",
    beforeImage: "/damaged-car-engine.png",
    afterImage: "/repaired-car-engine.png",
    testimonial:
      "John saved my Golf when other garages quoted me thousands. Fast, professional service right on my driveway!",
    customer: "Michael S.",
  },
  {
    title: "Brake System Replacement",
    description: "Full brake system overhaul including discs, pads and calipers.",
    beforeImage: "/worn-brake-system.png",
    afterImage: "/new-brake-system.png",
    testimonial: "Incredible service! Same-day brake replacement at my office car park. Couldn't be happier.",
    customer: "Sarah T.",
  },
  {
    title: "Electrical Fault Diagnosis",
    description: "Complex electrical issue diagnosed and repaired without dealership costs.",
    beforeImage: "/car-electrical-problem.png",
    afterImage: "/fixed-car-electronics.png",
    testimonial:
      "After weeks of frustration with my Audi's electrical gremlins, the problem was solved in hours. Brilliant service!",
    customer: "David M.",
  },
]

export default function Gallery() {
  return (
    <section className="py-16 bg-gray-100" id="gallery">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-900">Our Work</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Browse through our gallery of recent repairs and services. We take pride in our workmanship and attention to
          detail.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow">
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Before</p>
                  <div className="relative h-32 w-full">
                    <Image
                      src={item.beforeImage || "/placeholder.svg"}
                      alt={`${item.title} before`}
                      className="rounded-md object-cover"
                      fill
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">After</p>
                  <div className="relative h-32 w-full">
                    <Image
                      src={item.afterImage || "/placeholder.svg"}
                      alt={`${item.title} after`}
                      className="rounded-md object-cover"
                      fill
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border-t p-4">
                <p className="italic text-sm text-gray-600">"{item.testimonial}"</p>
                <p className="text-sm font-medium mt-2">— {item.customer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
