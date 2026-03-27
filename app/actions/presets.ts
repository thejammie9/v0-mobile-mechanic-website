"use server"

import {
  getAllServicePresets,
  createServicePreset,
  updateServicePreset,
  deleteServicePreset,
  type ServicePreset,
} from "@/lib/db"

export async function getPresets(): Promise<ServicePreset[]> {
  return getAllServicePresets()
}

export async function createPreset(
  data: Omit<ServicePreset, "id" | "created_at">
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const preset = createServicePreset(data)
    return { success: true, id: preset.id }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function updatePreset(
  id: number,
  data: Omit<ServicePreset, "id" | "created_at">
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = updateServicePreset(id, data)
    return { success: ok }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function deletePreset(id: number): Promise<{ success: boolean }> {
  try {
    const ok = deleteServicePreset(id)
    return { success: ok }
  } catch {
    return { success: false }
  }
}
