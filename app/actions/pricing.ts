"use server"

import { createPricingItem, updatePricingItem, deletePricingItem, togglePricingItemActive } from "@/lib/db"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { revalidatePath } from "next/cache"

export async function savePricingItem(data: {
  id?: number
  category: string
  name: string
  price: string
  note: string | null
  sort_order: number
  active: number
}) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized")

  const { id, ...rest } = data

  if (id) {
    updatePricingItem(id, rest)
  } else {
    createPricingItem(rest)
  }

  revalidatePath("/admin/pricing")
  revalidatePath("/pricing")
}

export async function removePricingItem(id: number) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized")
  deletePricingItem(id)
  revalidatePath("/admin/pricing")
  revalidatePath("/pricing")
}

export async function togglePricingActive(id: number) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized")
  togglePricingItemActive(id)
  revalidatePath("/admin/pricing")
  revalidatePath("/pricing")
}
