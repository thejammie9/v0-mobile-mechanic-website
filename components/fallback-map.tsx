import Image from "next/image"

export default function FallbackMap() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
      <div className="absolute inset-0">
        <Image src="/placeholder.svg?height=400&width=600" alt="Service area map" fill className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-4">
        <h3 className="text-xl font-bold mb-2">Our Service Area</h3>
        <p className="text-center">
          We cover Edinburgh, Dalkeith, Musselburgh, Gorebridge, Bonnyrigg and surrounding areas (within 20 miles)
        </p>
      </div>
    </div>
  )
}
