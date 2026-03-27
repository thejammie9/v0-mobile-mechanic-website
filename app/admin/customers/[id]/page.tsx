import { redirect, notFound } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import {
  getCustomerById,
  getCustomerVehicles,
  getCustomerBookings,
  getCustomerInvoices,
  getUnlinkedBookings,
  getUnlinkedInvoices,
} from "@/app/actions/customers"
import { CustomerDetailClient } from "./customer-detail-client"

export const dynamic = "force-dynamic"

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const { id } = await params
  const customerId = parseInt(id, 10)
  if (isNaN(customerId)) notFound()

  const [customer, vehicles, bookings, invoices, unlinkedBookings, unlinkedInvoices] =
    await Promise.all([
      getCustomerById(customerId),
      getCustomerVehicles(customerId),
      getCustomerBookings(customerId),
      getCustomerInvoices(customerId),
      getUnlinkedBookings(),
      getUnlinkedInvoices(),
    ])

  if (!customer) notFound()

  return (
    <CustomerDetailClient
      customer={customer}
      vehicles={vehicles}
      bookings={bookings}
      invoices={invoices}
      unlinkedBookings={unlinkedBookings}
      unlinkedInvoices={unlinkedInvoices}
    />
  )
}
