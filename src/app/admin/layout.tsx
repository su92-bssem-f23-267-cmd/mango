import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'

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
    <div className="flex min-h-screen bg-secondary/15">
      {/* Sidebar navigation */}
      <AdminSidebar userName={user?.name} userEmail={user?.email} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky top-bar with Sign Out top-right */}
        <AdminHeader userName={user?.name} userEmail={user?.email} />
        
        <main className="flex-grow p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
