// Google Calendar integration
// Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN in .env.local
// See README section for setup instructions

export async function addBookingToCalendar(booking: {
  name: string
  vehicle: string
  issue: string
  date: string
  time: string
  phone: string
}): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

  if (!clientId || !clientSecret || !refreshToken) {
    console.log('Google Calendar not configured - skipping')
    return { success: false, error: 'Not configured' }
  }

  try {
    // Get access token using refresh token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) throw new Error('Failed to get access token')

    // Parse date/time
    const [year, month, day] = booking.date.split('-').map(Number)
    const timeStr = booking.time || '09:00'
    const [hour, minute] = timeStr.split(':').map(Number)
    const start = new Date(year, month - 1, day, hour, minute)
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // 2 hour default

    const event = {
      summary: `${booking.name} - ${booking.vehicle}`,
      description: `Issue: ${booking.issue}\nPhone: ${booking.phone}`,
      start: { dateTime: start.toISOString(), timeZone: 'Europe/London' },
      end: { dateTime: end.toISOString(), timeZone: 'Europe/London' },
    }

    const eventRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )
    const eventData = await eventRes.json()
    if (!eventRes.ok) throw new Error(eventData.error?.message || 'Calendar API error')

    return { success: true, eventId: eventData.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Google Calendar error:', msg)
    return { success: false, error: msg }
  }
}
