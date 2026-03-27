"use server"

import {
  createCustomer as dbCreateCustomer,
  getAllCustomers as dbGetAllCustomers,
  getCustomerById as dbGetCustomerById,
  updateCustomer as dbUpdateCustomer,
  deleteCustomer as dbDeleteCustomer,
  addVehicle as dbAddVehicle,
  deleteVehicle as dbDeleteVehicle,
  getCustomerVehicles as dbGetCustomerVehicles,
  linkBookingToCustomer as dbLinkBooking,
  linkInvoiceToCustomer as dbLinkInvoice,
  getCustomerBookings as dbGetCustomerBookings,
  getCustomerInvoices as dbGetCustomerInvoices,
  getUnlinkedBookings as dbGetUnlinkedBookings,
  getUnlinkedInvoices as dbGetUnlinkedInvoices,
  setServiceReminder as dbSetServiceReminder,
  setLastServiceOverride as dbSetLastServiceOverride,
  type Customer,
  type CustomerWithCounts,
  type CustomerVehicle,
  type Booking,
  type Invoice,
} from "@/lib/db"
import { sendReviewRequestEmail } from "@/lib/email"

export async function createCustomer(data: {
  name: string
  email: string
  phone?: string | null
  address?: string | null
  notes?: string | null
}): Promise<{ success: boolean; customerId?: number; error?: string }> {
  try {
    const customer = dbCreateCustomer(data)
    return { success: true, customerId: customer.id }
  } catch (error) {
    console.error("createCustomer error:", error)
    return { success: false, error: "Failed to create customer" }
  }
}

export async function getAllCustomers(): Promise<CustomerWithCounts[]> {
  return dbGetAllCustomers()
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  return dbGetCustomerById(id)
}

export async function updateCustomer(
  id: number,
  data: {
    name: string
    email: string
    phone?: string | null
    address?: string | null
    notes?: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = dbUpdateCustomer(id, data)
    return { success: ok }
  } catch (error) {
    console.error("updateCustomer error:", error)
    return { success: false, error: "Failed to update customer" }
  }
}

export async function deleteCustomer(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = dbDeleteCustomer(id)
    return { success: ok }
  } catch (error) {
    console.error("deleteCustomer error:", error)
    return { success: false, error: "Failed to delete customer" }
  }
}

export async function addVehicle(
  customerId: number,
  data: {
    make_model: string
    reg?: string | null
    year?: string | null
    notes?: string | null
  }
): Promise<{ success: boolean; vehicle?: CustomerVehicle; error?: string }> {
  try {
    const vehicle = dbAddVehicle(customerId, data)
    return { success: true, vehicle }
  } catch (error) {
    console.error("addVehicle error:", error)
    return { success: false, error: "Failed to add vehicle" }
  }
}

export async function deleteVehicle(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = dbDeleteVehicle(id)
    return { success: ok }
  } catch (error) {
    console.error("deleteVehicle error:", error)
    return { success: false, error: "Failed to delete vehicle" }
  }
}

export async function getCustomerVehicles(customerId: number): Promise<CustomerVehicle[]> {
  return dbGetCustomerVehicles(customerId)
}

export async function linkBookingToCustomer(
  bookingId: number,
  customerId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = dbLinkBooking(bookingId, customerId)
    return { success: ok }
  } catch (error) {
    console.error("linkBookingToCustomer error:", error)
    return { success: false, error: "Failed to link booking" }
  }
}

export async function linkInvoiceToCustomer(
  invoiceId: number,
  customerId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = dbLinkInvoice(invoiceId, customerId)
    return { success: ok }
  } catch (error) {
    console.error("linkInvoiceToCustomer error:", error)
    return { success: false, error: "Failed to link invoice" }
  }
}

export async function getCustomerBookings(customerId: number): Promise<Booking[]> {
  return dbGetCustomerBookings(customerId)
}

export async function getCustomerInvoices(customerId: number): Promise<Invoice[]> {
  return dbGetCustomerInvoices(customerId)
}

export async function getUnlinkedBookings(): Promise<Booking[]> {
  return dbGetUnlinkedBookings()
}

export async function getUnlinkedInvoices(): Promise<Invoice[]> {
  return dbGetUnlinkedInvoices()
}

export async function setServiceReminder(
  customerId: number,
  enabled: boolean
): Promise<{ success: boolean }> {
  try {
    const ok = dbSetServiceReminder(customerId, enabled)
    return { success: ok }
  } catch (error) {
    console.error("setServiceReminder error:", error)
    return { success: false }
  }
}

export async function setLastServiceOverride(
  customerId: number,
  date: string | null
): Promise<{ success: boolean }> {
  try {
    const ok = dbSetLastServiceOverride(customerId, date)
    return { success: ok }
  } catch (error) {
    console.error("setLastServiceOverride error:", error)
    return { success: false }
  }
}

export async function sendReviewRequest(customerId: number): Promise<{ success: boolean }> {
  try {
    const customer = dbGetCustomerById(customerId)
    if (!customer) return { success: false }
    const ok = await sendReviewRequestEmail({ name: customer.name, email: customer.email })
    return { success: ok }
  } catch (error) {
    console.error("sendReviewRequest error:", error)
    return { success: false }
  }
}
