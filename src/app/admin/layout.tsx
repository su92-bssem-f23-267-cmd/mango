import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import AdminBottomNav from '@/components/layout/AdminBottomNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const user = session.user

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-secondary/25 via-background to-background">
      {/* Sidebar navigation (desktop) */}
      <AdminSidebar userName={user?.name} userEmail={user?.email} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky top-bar with theme toggle + Sign Out */}
        <AdminHeader userName={user?.name} userEmail={user?.email} />

        <main className="flex-grow p-4 sm:p-6 md:p-8 pb-28 md:pb-8">
          {children}
        </main>
      </div>

      {/* App-style fixed bottom navigation (mobile) */}
      <AdminBottomNav />
    </div>
  )
}
