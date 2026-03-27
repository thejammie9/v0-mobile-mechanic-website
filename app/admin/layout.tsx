import { getCurrentUser } from "./actions"
import AdminNav from "./admin-nav"
import { InactivityGuard } from "./inactivity-guard"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  const isAuthed = !!user

  return (
    <div>
      {isAuthed && <AdminNav role={user!.role} />}
      {isAuthed && <InactivityGuard />}
      {children}
    </div>
  )
}
