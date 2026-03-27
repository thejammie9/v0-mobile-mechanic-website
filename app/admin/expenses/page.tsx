import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getExpenses, getRecurringExpenses } from "@/lib/db"
import ExpensesClient from "./expenses-client"

export const dynamic = "force-dynamic"

function getTaxYearStart(now: Date): Date {
  const year = now.getFullYear()
  const april6 = new Date(year, 3, 6)
  if (now < april6) {
    return new Date(year - 1, 3, 6)
  }
  return april6
}

export default async function ExpensesPage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) redirect("/admin/login")

  const expenses = getExpenses()
  const recurring = getRecurringExpenses()
  const now = new Date()
  const taxYearStart = getTaxYearStart(now)
  const taxYearStartStr = taxYearStart.toISOString().slice(0, 10)

  return <ExpensesClient expenses={expenses} recurringExpenses={recurring} taxYearStartStr={taxYearStartStr} />
}
