"use client"

import { useState, useTransition } from "react"
import {
  adminCreateUser,
  adminChangePassword,
  adminUpdateRole,
  adminToggleActive,
  adminDeleteUser,
} from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, KeyRound, Trash2, ToggleLeft, ToggleRight, ShieldCheck, User, AlertCircle, CheckCircle2 } from "lucide-react"
import type { AdminUser } from "@/lib/db"
import { useRouter } from "next/navigation"

export default function UsersClient({
  users: initialUsers,
  currentUserId,
}: {
  users: AdminUser[]
  currentUserId: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [users, setUsers] = useState(initialUsers)
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState<"admin" | "staff">("staff")
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [passwordModal, setPasswordModal] = useState<{ id: number; username: string } | null>(null)
  const [newPw, setNewPw] = useState("")
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const refresh = () => router.refresh()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    setCreateSuccess(false)
    startTransition(async () => {
      const result = await adminCreateUser(newUsername, newPassword, newRole)
      if (!result.success) {
        setCreateError(result.error || "Failed to create user")
      } else {
        setCreateSuccess(true)
        setNewUsername("")
        setNewPassword("")
        setNewRole("staff")
        refresh()
      }
    })
  }

  const handleToggleActive = (id: number) => {
    startTransition(async () => {
      await adminToggleActive(id)
      refresh()
    })
  }

  const handleUpdateRole = (id: number, role: "admin" | "staff") => {
    startTransition(async () => {
      await adminUpdateRole(id, role)
      refresh()
    })
  }

  const handleDelete = (id: number, username: string) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await adminDeleteUser(id)
      if (!result.success) alert(result.error)
      else refresh()
    })
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordModal) return
    setPwError(null)
    setPwSuccess(false)
    const result = await adminChangePassword(passwordModal.id, newPw)
    if (!result.success) {
      setPwError(result.error || "Failed")
    } else {
      setPwSuccess(true)
      setNewPw("")
      setTimeout(() => {
        setPasswordModal(null)
        setPwSuccess(false)
      }, 1500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add new user */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-orange-500" />
            Add New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}
            {createSuccess && (
              <Alert className="border-green-700 bg-green-900/20">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">User created successfully</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Username</Label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. jamie"
                  required
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-1">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as "admin" | "staff")}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="admin">Admin — full access</SelectItem>
                    <SelectItem value="staff">Staff — limited access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={isPending} className="bg-orange-600 hover:bg-orange-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Role info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-orange-400" />
            <span className="font-medium text-gray-200">Admin</span>
          </div>
          <p className="text-sm text-gray-400">Full access — dashboard, jobs, customers, finance, settings, content, tools, and user management.</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-blue-400" />
            <span className="font-medium text-gray-200">Staff</span>
          </div>
          <p className="text-sm text-gray-400">Limited access — dashboard, calendar, jobs, and customers only. No finance, settings, or content.</p>
        </div>
      </div>

      {/* User list */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Existing Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-750 border border-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-200 uppercase">
                    {u.username[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-100">{u.username}</span>
                      {u.id === currentUserId && (
                        <Badge variant="outline" className="text-xs border-orange-600 text-orange-400">you</Badge>
                      )}
                      <Badge
                        className={u.role === "admin"
                          ? "bg-orange-600/20 text-orange-300 border-orange-600/30"
                          : "bg-blue-600/20 text-blue-300 border-blue-600/30"}
                      >
                        {u.role}
                      </Badge>
                      {!u.is_active && (
                        <Badge variant="destructive" className="text-xs">disabled</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Created {new Date(u.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Role selector */}
                  <Select
                    value={u.role}
                    onValueChange={(v) => handleUpdateRole(u.id, v as "admin" | "staff")}
                    disabled={u.id === currentUserId || isPending}
                  >
                    <SelectTrigger className="h-8 w-28 bg-gray-700 border-gray-600 text-gray-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Change password */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => { setPasswordModal({ id: u.id, username: u.username }); setNewPw(""); setPwError(null); setPwSuccess(false) }}
                  >
                    <KeyRound className="h-3.5 w-3.5 mr-1" />
                    Password
                  </Button>

                  {/* Toggle active */}
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-8 border-gray-600 ${u.is_active ? "text-yellow-400 hover:bg-yellow-900/20" : "text-green-400 hover:bg-green-900/20"}`}
                    onClick={() => handleToggleActive(u.id)}
                    disabled={u.id === currentUserId || isPending}
                  >
                    {u.is_active
                      ? <><ToggleRight className="h-3.5 w-3.5 mr-1" />Disable</>
                      : <><ToggleLeft className="h-3.5 w-3.5 mr-1" />Enable</>}
                  </Button>

                  {/* Delete */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-gray-600 text-red-400 hover:bg-red-900/20"
                    onClick={() => handleDelete(u.id, u.username)}
                    disabled={u.id === currentUserId || isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Change password modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100 text-lg">
                Change password for <span className="text-orange-400">{passwordModal.username}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {pwError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{pwError}</AlertDescription>
                  </Alert>
                )}
                {pwSuccess && (
                  <Alert className="border-green-700 bg-green-900/20">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300">Password updated</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    autoFocus
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                    Update Password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                    onClick={() => setPasswordModal(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
