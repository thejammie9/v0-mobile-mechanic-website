import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const portfolioItems = [
  {
    title: "Engine Overhaul",
    vehicle: "2018 VW Golf",
    description: "Complete engine rebuild after catastrophic timing belt failure.",
    imageBefore: "/placeholder.svg?height=300&width=400",
    imageAfter: "/placeholder.svg?height=300&width=400",
    testimonial:
      "John saved my Golf when other garages quoted me thousands. Fast, professional service right on my driveway!",
    customer: "Michael S.",
  },
  {
    title: "Brake System Replacement",
    vehicle: "2020 Ford Focus",
    description: "Full brake system overhaul including discs, pads and calipers.",
    imageBefore: "/placeholder.svg?height=300&width=400",
    imageAfter: "/placeholder.svg?height=300&width=400",
    testimonial: "Incredible service! Same-day brake replacement at my office car park. Couldn't be happier.",
    customer: "Sarah T.",
  },
  {
    title: "Electrical Fault Diagnosis",
    vehicle: "2019 Audi A4",
    description: "Complex electrical issue diagnosed and repaired without dealership costs.",
    imageBefore: "/placeholder.svg?height=300&width=400",
    imageAfter: "/placeholder.svg?height=300&width=400",
    testimonial:
      "After weeks of frustration with my Audi's electrical gremlins, the problem was solved in hours. Brilliant service!",
    customer: "David M.",
  },
]

export default function Portfolio() {
  return (
    <section className="py-16 bg-gray-100" id="portfolio">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Our Recent Work</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription className="font-medium text-orange-600">{item.vehicle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{item.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Before</p>
                    <Image
                      src={item.imageBefore || "/placeholder.svg"}
                      alt={`${item.title} before`}
                      width={400}
                      height={300}
                      className="rounded-md object-cover h-32 w-full"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">After</p>
                    <Image
                      src={item.imageAfter || "/placeholder.svg"}
                      alt={`${item.title} after`}
                      width={400}
                      height={300}
                      className="rounded-md object-cover h-32 w-full"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div>
                  <p className="italic text-sm text-gray-600">"{item.testimonial}"</p>
                  <p className="text-sm font-medium mt-2">— {item.customer}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
