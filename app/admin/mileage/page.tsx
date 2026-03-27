import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getMileageLog } from "@/lib/db"
import MileageClient from "./mileage-client"

export const dynamic = "force-dynamic"

function getTaxYearStart(now: Date): Date {
  const year = now.getFullYear()
  const april6 = new Date(year, 3, 6)
  if (now < april6) {
    return new Date(year - 1, 3, 6)
  }
  return april6
}

export default async function MileagePage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) redirect("/admin/login")

  const entries = getMileageLog()

  const now = new Date()
  const taxYearStart = getTaxYearStart(now)
  const taxYearStartStr = taxYearStart.toISOString().slice(0, 10)

  return <MileageClient entries={entries} taxYearStartStr={taxYearStartStr} />
}
