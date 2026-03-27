import { getBookingAvailability } from "@/lib/db"
import AvailabilityClient from "./availability-client"

export const dynamic = "force-dynamic"

export default async function AvailabilityPage() {
  const config = getBookingAvailability()
  return <AvailabilityClient config={config} />
}
