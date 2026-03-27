import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/app/admin/actions"
import { getEmailLog } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

const typeLabels: Record<string, { label: string; colour: string }> = {
  booking_notification:    { label: "Booking (Admin)",    colour: "bg-blue-900/50 text-blue-300 border-blue-700" },
  customer_confirmation:   { label: "Booking Confirm",    colour: "bg-cyan-900/50 text-cyan-300 border-cyan-700" },
  appointment_confirmation:{ label: "Appt Confirm",       colour: "bg-indigo-900/50 text-indigo-300 border-indigo-700" },
  cancellation:            { label: "Cancellation",       colour: "bg-red-900/50 text-red-300 border-red-700" },
  invoice:                 { label: "Invoice",            colour: "bg-green-900/50 text-green-300 border-green-700" },
  quote:                   { label: "Quote",              colour: "bg-yellow-900/50 text-yellow-300 border-yellow-700" },
  service_reminder:        { label: "Service Reminder",   colour: "bg-orange-900/50 text-orange-300 border-orange-700" },
}

export default async function EmailLogPage() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const logs = getEmailLog(200)

  const sent  = logs.filter((l) => l.status === "sent").length
  const failed = logs.filter((l) => l.status === "failed").length

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Email Log</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total Emails</CardDescription>
              <CardTitle className="text-3xl text-gray-100">{logs.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Sent Successfully</CardDescription>
              <CardTitle className="text-3xl text-green-400">{sent}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Failed</CardDescription>
              <CardTitle className="text-3xl text-red-400">{failed}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Log table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Recent Emails</CardTitle>
            <CardDescription className="text-gray-400">
              Last 200 emails sent from the site (newest first)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg mb-1">No emails logged yet</p>
                <p className="text-sm">Emails will appear here as they are sent.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-400">Date / Time</TableHead>
                      <TableHead className="text-gray-400">To</TableHead>
                      <TableHead className="text-gray-400">Subject</TableHead>
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const meta = typeLabels[log.type] ?? { label: log.type, colour: "bg-gray-700 text-gray-300 border-gray-600" }
                      return (
                        <TableRow key={log.id} className="border-gray-700 hover:bg-gray-700/40">
                          <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                            {format(new Date(log.sent_at), "dd/MM/yyyy HH:mm")}
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm">{log.to_address}</TableCell>
                          <TableCell className="text-gray-300 text-sm max-w-xs truncate">
                            {log.subject}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${meta.colour}`}>{meta.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {log.status === "sent" ? (
                              <span className="flex items-center gap-1 text-green-400 text-sm">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Sent
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-400 text-sm">
                                <XCircle className="h-3.5 w-3.5" />
                                Failed
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-red-400 text-xs max-w-xs truncate">
                            {log.error ?? ""}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
