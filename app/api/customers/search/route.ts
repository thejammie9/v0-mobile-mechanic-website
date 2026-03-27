import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import type { Customer, CustomerVehicle } from "@/lib/db"

export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || ""
  if (q.trim().length < 1) return NextResponse.json({ customers: [] })

  const db = getDb()
  const like = `%${q.trim()}%`
  const customers = db.prepare(
    "SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? ORDER BY name ASC LIMIT 8"
  ).all(like, like, like) as Customer[]

  const result = customers.map(c => ({
    ...c,
    vehicles: db.prepare(
      "SELECT * FROM customer_vehicles WHERE customer_id = ? ORDER BY id ASC"
    ).all(c.id) as CustomerVehicle[],
  }))

  return NextResponse.json({ customers: result })
}
