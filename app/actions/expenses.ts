"use server"
import {
  addExpense,
  deleteExpense,
  getRecurringExpenses,
  addRecurringExpense,
  toggleRecurringExpense as dbToggleRecurring,
  deleteRecurringExpense as dbDeleteRecurring,
  type RecurringExpense,
} from "@/lib/db"
import { isAdminAuthenticated } from "@/app/admin/actions"

export async function createExpense(data: {
  date: string
  category: string
  description: string
  amount: number
  receipt_ref: string | null
  notes: string | null
}) {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false }
  const expense = addExpense(data)
  return { success: true, expense }
}

export async function createExpenseBatch(items: {
  date: string
  category: string
  description: string
  amount: number
  receipt_ref: string | null
  notes: string | null
}[]) {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false, expenses: [] }
  const expenses = items.map((item) => addExpense(item))
  return { success: true, expenses }
}

export async function removeExpense(id: number) {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false }
  const ok = deleteExpense(id)
  return { success: ok }
}

export async function listRecurringExpenses(): Promise<RecurringExpense[]> {
  return getRecurringExpenses()
}

export async function createRecurringExpense(data: {
  category: string
  description: string
  amount: number
  day_of_month: number
  receipt_ref: string | null
  notes: string | null
}): Promise<{ success: boolean; expense?: RecurringExpense }> {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false }
  const expense = addRecurringExpense({ ...data, active: 1 })
  return { success: true, expense }
}

export async function toggleRecurring(id: number): Promise<{ success: boolean }> {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false }
  const ok = dbToggleRecurring(id)
  return { success: ok }
}

export async function removeRecurringExpense(id: number): Promise<{ success: boolean }> {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false }
  const ok = dbDeleteRecurring(id)
  return { success: ok }
}
