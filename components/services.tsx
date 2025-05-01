import { DiscIcon as BrakeDisc, BatteryIcon as CarBattery, SprayCanIcon as OilCan, Wrench } from "lucide-react"

const services = [
  {
    title: "Engine Repair",
    description: "Comprehensive engine diagnostics and repairs for all makes and models.",
    icon: Wrench,
  },
  {
    title: "Brake Servicing",
    description: "Complete brake system inspection, repair and replacement.",
    icon: BrakeDisc,
  },
  {
    title: "Battery Replacement",
    description: "On-the-spot battery testing and replacement services.",
    icon: CarBattery,
  },
  {
    title: "Oil Changes",
    description: "Full vehicle servicing performed at your home or workplace.",
    icon: OilCan,
  },
]

export default function Services() {
  return (
    <section className="py-16 bg-white" id="services">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col items-center">
                <service.icon className="h-10 w-10 text-blue-800 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-center">{service.title}</h3>
                <p className="text-center text-gray-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
