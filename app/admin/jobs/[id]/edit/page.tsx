import { redirect, notFound } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getBookingById } from "@/lib/db"
import EditJobClient from "./edit-job-client"

export const dynamic = "force-dynamic"

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) redirect("/admin/login")

  const id = parseInt(params.id, 10)
  if (isNaN(id)) notFound()

  const booking = getBookingById(id)
  if (!booking) notFound()

  return <EditJobClient booking={booking} />
}
