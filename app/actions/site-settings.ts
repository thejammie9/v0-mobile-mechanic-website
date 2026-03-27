"use server"

import {
  getAllSiteSettings,
  saveSiteSetting,
  getAllServiceAreas,
  createServiceArea as dbCreateArea,
  updateServiceArea as dbUpdateArea,
  toggleServiceArea as dbToggleArea,
  deleteServiceArea as dbDeleteArea,
  type SiteSetting,
  type ServiceArea,
} from "@/lib/db"
import { isAdminAuthenticated } from "@/app/admin/actions"

export async function getSiteSettings(): Promise<SiteSetting[]> {
  return getAllSiteSettings()
}

export async function saveSiteSettings(
  updates: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false, error: "Unauthorised" }
  try {
    for (const [key, value] of Object.entries(updates)) {
      saveSiteSetting(key, value)
    }
    return { success: true }
  } catch (e) {
    console.error("saveSiteSettings error:", e)
    return { success: false, error: "Failed to save settings" }
  }
}

export async function getServiceAreas(): Promise<ServiceArea[]> {
  return getAllServiceAreas()
}

export async function createAreaAction(data: {
  name: string; slug: string; county: string; description: string; nearby_areas: string; sort_order: number
}): Promise<{ success: boolean; area?: ServiceArea; error?: string }> {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false, error: "Unauthorised" }
  try {
    const area = dbCreateArea(data)
    return { success: true, area }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create area"
    return { success: false, error: msg }
  }
}

export async function updateAreaAction(id: number, data: {
  name: string; slug: string; county: string; description: string; nearby_areas: string; sort_order: number
}): Promise<{ success: boolean; error?: string }> {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false, error: "Unauthorised" }
  try {
    const ok = dbUpdateArea(id, data)
    return { success: ok }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to update area"
    return { success: false, error: msg }
  }
}

export async function toggleAreaAction(id: number): Promise<{ success: boolean }> {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false }
  const ok = dbToggleArea(id)
  return { success: ok }
}

export async function deleteAreaAction(id: number): Promise<{ success: boolean }> {
  const authed = await isAdminAuthenticated()
  if (!authed) return { success: false }
  const ok = dbDeleteArea(id)
  return { success: ok }
}
