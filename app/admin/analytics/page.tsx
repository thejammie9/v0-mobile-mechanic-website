import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getPageViewStats, getRecentPageViews, getDb } from "@/lib/db"
import AnalyticsClient from "./analytics-client"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) redirect("/admin/login")

  const statsToday = getPageViewStats(1)
  const stats7 = getPageViewStats(7)
  const stats30 = getPageViewStats(30)

  const db = getDb()

  const todayByHour = db.prepare(`
    SELECT strftime('%H', created_at) as hour,
           COUNT(*) as views,
           COUNT(DISTINCT ip_address) as visitors
    FROM page_views
    WHERE date(created_at) = date('now')
    GROUP BY hour
    ORDER BY hour ASC
  `).all() as { hour: string; views: number; visitors: number }[]

  const recentViews = getRecentPageViews(200)

  return (
    <AnalyticsClient
      statsToday={statsToday}
      stats7={stats7}
      stats30={stats30}
      todayByHour={todayByHour}
      recentViews={recentViews}
    />
  )
}
