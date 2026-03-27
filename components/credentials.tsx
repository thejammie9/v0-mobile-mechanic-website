import Image from "next/image"
import { ShieldCheck, Award, Clock, Wrench } from "lucide-react"

const trustPoints = [
  {
    icon: <Award className="h-6 w-6 text-orange-500" />,
    title: "IMI Accredited",
    description: "Fully accredited by the Institute of the Motor Industry — the UK's leading automotive professional body.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-orange-500" />,
    title: "Fully Insured",
    description: "Fully insured for your peace of mind on every job, whether at home or at your workplace.",
  },
  {
    icon: <Clock className="h-6 w-6 text-orange-500" />,
    title: "Fast Turnaround",
    description: "Most repairs completed same-day, so you're back on the road as quickly as possible.",
  },
  {
    icon: <Wrench className="h-6 w-6 text-orange-500" />,
    title: "All Makes & Models",
    description: "Experienced working on all vehicle makes and models, from small hatchbacks to large 4x4s.",
  },
]

export default function Credentials() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-blue-300">Why Choose Jamie's Auto Care?</h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Qualified, accredited, and trusted by customers across Edinburgh and the surrounding areas.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* IMI Badge */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-sm">
              <div className="border-b border-gray-600 pb-6 mb-6">
                <div className="relative h-16 w-full mx-auto">
                  <Image
                    src="/images/imi-badge.png"
                    alt="IMI - Institute of the Motor Industry"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/40 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <ShieldCheck className="h-3 w-3" /> Accredited Professional
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">Institute of the Motor Industry</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                IMI accreditation is the mark of a qualified, competent, and professional vehicle technician.
              </p>
            </div>
          </div>

          {/* Trust Points */}
          <div className="space-y-6">
            {trustPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-4 bg-gray-800 border border-gray-700 rounded-xl p-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  {point.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-100 mb-1">{point.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
