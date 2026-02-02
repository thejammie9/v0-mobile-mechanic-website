import { Camera, Plus, Quote } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// TODO: Add your portfolio items here
// Each item should have: title, vehicle, description, imageBefore, imageAfter, testimonial, customer
const portfolioItems: {
  title: string
  vehicle: string
  description: string
  imageBefore: string
  imageAfter: string
  testimonial: string
  customer: string
}[] = []

export default function Portfolio() {
  if (portfolioItems.length === 0) {
    return (
      <section className="py-16 bg-gray-100" id="portfolio">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Our Recent Work</h2>
          <div className="max-w-2xl mx-auto">
            <Card className="border-dashed border-2 border-gray-300 bg-white/50">
              <CardContent className="py-12">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Portfolio Coming Soon</h3>
                    <p className="text-gray-500 mt-2 max-w-md">
                      Photos and testimonials from completed jobs will be displayed here. Contact us to see examples of our work.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    )
  }

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
                    <img
                      src={item.imageBefore || "/placeholder.svg"}
                      alt={`${item.title} before`}
                      className="rounded-md object-cover h-32 w-full"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">After</p>
                    <img
                      src={item.imageAfter || "/placeholder.svg"}
                      alt={`${item.title} after`}
                      className="rounded-md object-cover h-32 w-full"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div>
                  <p className="italic text-sm text-gray-600">"{item.testimonial}"</p>
                  <p className="text-sm font-medium mt-2">- {item.customer}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
