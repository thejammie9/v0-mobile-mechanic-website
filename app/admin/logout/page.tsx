"use client"

import { useEffect } from "react"
import { logoutAdmin } from "@/app/actions/auth-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  useEffect(() => {
    const logout = async () => {
      await logoutAdmin()
      // Redirect happens in the server action
    }
    logout()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Logging Out</CardTitle>
          <CardDescription className="text-center">Please wait while we log you out...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    </div>
  )
}
