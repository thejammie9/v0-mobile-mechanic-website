"use server"

import { updateBookingWorkDone } from "@/lib/db"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { revalidatePath } from "next/cache"

export async function saveWorkDone(bookingId: number, workDone: string) {
  const ok = await isAdminAuthenticated()
  if (!ok) return { success: false }
  updateBookingWorkDone(bookingId, workDone)
  revalidatePath("/admin/jobs")
  return { success: true }
}
