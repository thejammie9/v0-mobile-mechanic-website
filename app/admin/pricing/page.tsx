import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getAllPricingItems } from "@/lib/db"
import PricingManager from "./pricing-manager"

export const dynamic = "force-dynamic"

export default async function AdminPricingPage() {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) redirect("/admin/login")

  const items = getAllPricingItems()

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Pricing Management</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage pricing items shown on the public pricing page. Changes take effect immediately.
        </p>
      </div>
      <PricingManager initialItems={items} />
    </div>
  )
}
