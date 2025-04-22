import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Gallery() {
  // Sample gallery items - replace with your actual work examples
  const galleryItems = {
    engine: [
      {
        title: "Engine Rebuild",
        description: "Complete engine rebuild on a 2018 Ford Focus",
        imageBefore: "/placeholder.svg?height=400&width=600",
        imageAfter: "/placeholder.svg?height=400&width=600",
      },
      {
        title: "Timing Belt Replacement",
        description: "Timing belt and water pump replacement on a VW Golf",
        imageBefore: "/placeholder.svg?height=400&width=600",
        imageAfter: "/placeholder.svg?height=400&width=600",
      },
    ],
    brakes: [
      {
        title: "Brake System Overhaul",
        description: "Complete brake system replacement on a BMW 3 Series",
        imageBefore: "/placeholder.svg?height=400&width=600",
        imageAfter: "/placeholder.svg?height=400&width=600",
      },
      {
        title: "Disc and Pad Replacement",
        description: "Front and rear brake disc and pad replacement on an Audi A4",
        imageBefore: "/placeholder.svg?height=400&width=600",
        imageAfter: "/placeholder.svg?height=400&width=600",
      },
    ],
    electrical: [
      {
        title: "Electrical Fault Diagnosis",
        description: "Complex electrical issue diagnosed and repaired on a Mercedes C-Class",
        imageBefore: "/placeholder.svg?height=400&width=600",
        imageAfter: "/placeholder.svg?height=400&width=600",
      },
      {
        title: "Battery and Alternator Replacement",
        description: "Complete charging system overhaul on a Nissan Qashqai",
        imageBefore: "/placeholder.svg?height=400&width=600",
        imageAfter: "/placeholder.svg?height=400&width=600",
      },
    ],
  }

  return (
    <section className="py-16 bg-gray-100" id="gallery">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-900">Our Work</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Browse through our gallery of recent repairs and services. We take pride in our workmanship and attention to
          detail.
        </p>

        <Tabs defaultValue="engine" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="engine">Engine Work</TabsTrigger>
              <TabsTrigger value="brakes">Brake Systems</TabsTrigger>
              <TabsTrigger value="electrical">Electrical Repairs</TabsTrigger>
            </TabsList>
          </div>

          {Object.entries(galleryItems).map(([category, items]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {items.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500 ml-4 mb-1">Before</p>
                          <div className="relative h-48">
                            <Image
                              src={item.imageBefore || "/placeholder.svg"}
                              alt={`${item.title} before`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 ml-4 mb-1">After</p>
                          <div className="relative h-48">
                            <Image
                              src={item.imageAfter || "/placeholder.svg"}
                              alt={`${item.title} after`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
