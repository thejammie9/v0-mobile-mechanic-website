import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getPortfolioItems } from "@/lib/db"
import PortfolioAdminClient from "./portfolio-admin-client"

export default async function AdminPortfolioPage() {
  if (!await isAdminAuthenticated()) redirect("/admin/login")

  const items = getPortfolioItems()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Our Work</h1>
          <p className="text-gray-400 mt-1">Add and manage before/after job photos shown on the website</p>
        </div>
        <PortfolioAdminClient items={items} />
      </div>
    </div>
  )
}
