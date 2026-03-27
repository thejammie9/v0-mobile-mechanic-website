"use server"

import {
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from "@/lib/db"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { unlink } from "fs/promises"
import path from "path"

export async function savePortfolioItem(data: {
  id?: number
  title: string
  vehicle: string
  description: string
  image_before: string
  image_after: string
  testimonial: string
  customer: string
  active: number
  sort_order: number
}): Promise<{ success: boolean; id?: number; error?: string }> {
  if (!await isAdminAuthenticated()) return { success: false, error: "Unauthorized" }
  if (!data.title.trim()) return { success: false, error: "Title is required" }

  if (data.id) {
    updatePortfolioItem(data.id, data)
    return { success: true, id: data.id }
  } else {
    const id = createPortfolioItem(data)
    return { success: true, id }
  }
}

export async function removePortfolioItem(
  id: number,
  imageBefore: string,
  imageAfter: string,
): Promise<{ success: boolean }> {
  if (!await isAdminAuthenticated()) return { success: false }
  deletePortfolioItem(id)

  // Delete uploaded images (skip hardcoded /images/ paths)
  for (const imgPath of [imageBefore, imageAfter]) {
    if (imgPath.startsWith("/uploads/")) {
      try { await unlink(path.join(process.cwd(), "public", imgPath)) } catch {}
    }
  }
  return { success: true }
}

export async function reorderPortfolioItems(
  ids: number[],
): Promise<{ success: boolean }> {
  if (!await isAdminAuthenticated()) return { success: false }
  const { getDb } = await import("@/lib/db")
  const db = getDb()
  const update = db.prepare("UPDATE portfolio_items SET sort_order = ? WHERE id = ?")
  ids.forEach((id, i) => update.run(i + 1, id))
  return { success: true }
}
