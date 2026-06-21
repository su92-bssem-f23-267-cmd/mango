import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { LayoutDashboard, Store, Leaf, Tags, Package, ShoppingBag } from 'lucide-react'
import AdminSignOutButton from '@/components/layout/AdminSignOutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-secondary/15">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-background">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-tight text-primary">
              Mango<span className="text-accent font-black">Admin</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-accent/10 text-accent"
          >
            <LayoutDashboard className="mr-3 h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors"
          >
            <ShoppingBag className="mr-3 h-4 w-4" />
            Order Management
          </Link>

          <Link
            href="/admin/mangoes"
            className="flex items-center px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors"
          >
            <Leaf className="mr-3 h-4 w-4" />
            Mango Management
          </Link>

          <Link
            href="/admin/varieties"
            className="flex items-center px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors"
          >
            <Tags className="mr-3 h-4 w-4" />
            Variety Management
          </Link>

          <Link
            href="/admin/inventory"
            className="flex items-center px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors"
          >
            <Package className="mr-3 h-4 w-4" />
            Inventory Management
          </Link>
          
          <Link
            href="/"
            className="flex items-center px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors"
          >
            <Store className="mr-3 h-4 w-4" />
            Back to Store
          </Link>

          <AdminSignOutButton className="px-4 py-2.5 mt-1 hover:bg-destructive/10 hover:text-destructive" />
        </nav>
        <div className="p-4 border-t border-border">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Admin Profile</p>
            <p className="text-xs font-semibold text-foreground truncate mt-1">{session.user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{session.user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 items-center justify-between px-6 border-b border-border bg-background md:hidden">
          <span className="text-lg font-black tracking-tight text-primary">🥭 MangoAdmin</span>
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard" className="text-xs font-bold text-accent">Dashboard</Link>
            <Link href="/admin/orders" className="text-xs font-bold text-muted-foreground">Orders</Link>
            <Link href="/admin/mangoes" className="text-xs font-bold text-muted-foreground">Mangoes</Link>
            <Link href="/admin/varieties" className="text-xs font-bold text-muted-foreground">Varieties</Link>
            <Link href="/admin/inventory" className="text-xs font-bold text-muted-foreground">Inventory</Link>
            <Link href="/" className="text-xs font-bold text-muted-foreground"><Store className="h-4 w-4" /></Link>
            <AdminSignOutButton className="p-1 hover:bg-transparent" showText={false} />
          </div>
        </header>
        <main className="flex-grow p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
