import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const reg = req.nextUrl.searchParams.get("reg")?.toUpperCase().replace(/\s/g, "")
  if (!reg) return NextResponse.json({ error: "No registration provided" }, { status: 400 })

  const apiKey = process.env.DVLA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "DVLA_API_KEY not configured" }, { status: 503 })
  }

  try {
    const res = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationNumber: reg }),
      }
    )

    if (res.status === 404) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: "DVLA lookup failed", detail: text }, { status: res.status })
    }

    const data = await res.json()

    return NextResponse.json({
      make: data.make ?? null,
      colour: data.colour ?? null,
      yearOfManufacture: data.yearOfManufacture ?? null,
      engineCapacity: data.engineCapacity ?? null,
      fuelType: data.fuelType ?? null,
      motExpiryDate: data.motExpiryDate ?? null,
      taxStatus: data.taxStatus ?? null,
    })
  } catch (e) {
    return NextResponse.json({ error: "Network error" }, { status: 500 })
  }
}
