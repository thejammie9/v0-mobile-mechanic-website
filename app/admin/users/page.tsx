import { redirect } from "next/navigation"
import { getCurrentUser } from "../actions"
import { listAdminUsers } from "@/lib/db"
import UsersClient from "./users-client"

export default async function AdminUsersPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") redirect("/admin")

  const users = listAdminUsers()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">User Management</h1>
          <p className="text-gray-400 mt-1">Manage admin accounts and permissions</p>
        </div>
        <UsersClient users={users} currentUserId={user.userId} />
      </div>
    </div>
  )
}
