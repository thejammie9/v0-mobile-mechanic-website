import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, you would fetch bookings from a database
  // For now, we'll just return some mock data
  const bookings = [
    {
      id: "booking_123",
      name: "John Smith",
      email: "john@example.com",
      phone: "07463451967",
      vehicle: "Ford Focus 2018",
      issue: "Engine making strange noise",
      date: "2023-06-15",
      timeSlot: "Morning (09:00 - 12:30)",
      status: "confirmed",
      created_at: "2023-06-10T14:30:00Z",
    },
    {
      id: "booking_456",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "07712345678",
      vehicle: "Audi A4 2020",
      issue: "Brake pads need replacing",
      date: "2023-06-16",
      timeSlot: "Afternoon (13:30 - 17:30)",
      status: "pending",
      created_at: "2023-06-11T09:15:00Z",
    },
  ]

  return NextResponse.json({ success: true, bookings })
}
