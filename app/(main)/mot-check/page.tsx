import type { Metadata } from "next"
import Footer from "@/components/footer"
import MotCheckerClient from "./mot-checker-client"

export const metadata: Metadata = {
  title: "Free MOT Expiry Checker | Check Your MOT Date",
  description:
    "Check your MOT expiry date instantly by entering your registration. Free tool from Jamie's Auto Care — mobile mechanic covering Edinburgh & Midlothian.",
  alternates: { canonical: "https://jamiesautocare.com/mot-check" },
}

export default function MotCheckPage() {
  return (
    <>
      <section className="bg-blue-950 text-white py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Free MOT Expiry Checker</h1>
          <p className="text-blue-200 max-w-xl mx-auto">
            Enter your registration plate to instantly check when your MOT expires —
            no sign-up, completely free.
          </p>
        </div>
      </section>

      <section className="py-14 bg-gray-900 min-h-[50vh]">
        <div className="container mx-auto px-4 max-w-xl">
          <MotCheckerClient />
        </div>
      </section>

      <Footer />
    </>
  )
}
