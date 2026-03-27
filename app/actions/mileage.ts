"use server"
import { addMileageEntry, deleteMileageEntry, getMileageLog } from "@/lib/db"
import { isAdminAuthenticated } from "@/app/admin/actions"

export async function createMileageEntry(data: {
  date: string
  booking_id: number | null
  customer_name: string | null
  from_location: string
  to_location: string
  miles: number
  round_trip: number
  notes: string | null
}) {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false }
  const entry = addMileageEntry(data)
  return { success: true, entry }
}

export async function removeMileageEntry(id: number) {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false }
  const ok = deleteMileageEntry(id)
  return { success: ok }
}
