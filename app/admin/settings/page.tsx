import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getAllServicePresets, getAllSiteSettings, getAllServiceAreas } from "@/lib/db"
import { SettingsClient } from "./settings-client"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const ok = await isAdminAuthenticated()
  if (!ok) redirect("/admin/login")

  const presets = getAllServicePresets()
  const siteSettings = getAllSiteSettings()
  const serviceAreas = getAllServiceAreas()

  return (
    <SettingsClient
      initialPresets={presets}
      initialSiteSettings={siteSettings}
      initialAreas={serviceAreas}
    />
  )
}
