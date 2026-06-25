'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminSignOutButton from '@/components/layout/AdminSignOutButton'
import { Store, LayoutDashboard, ShoppingBag, Leaf, Tags, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  userName?: string | null
  userEmail?: string | null
}

export default function AdminHeader({ userName, userEmail }: AdminHeaderProps) {
  const pathname = usePathname()

  const mobileNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Mangoes', href: '/admin/mangoes', icon: Leaf },
    { name: 'Varieties', href: '/admin/varieties', icon: Tags },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
    { name: 'Store', href: '/', icon: Store }
  ]

  // Determine page title based on current pathname
  const getPageTitle = () => {
    if (pathname.startsWith('/admin/dashboard')) return 'Dashboard Overview'
    if (pathname.startsWith('/admin/orders')) return 'Order Management'
    if (pathname.startsWith('/admin/mangoes')) return 'Mango Management'
    if (pathname.startsWith('/admin/varieties')) return 'Variety Management'
    if (pathname.startsWith('/admin/inventory')) return 'Inventory Management'
    return 'Admin Panel'
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm flex flex-col justify-center">
      {/* Top Bar (Universal Desktop Header / Mobile Header Top Row) */}
      <div className="flex h-16 items-center justify-between px-6 w-full">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          {/* Logo only visible on mobile (since sidebar contains it on desktop) */}
          <Link href="/admin/dashboard" className="flex items-center space-x-1.5 md:hidden group">
            <span className="text-lg font-black tracking-tight text-primary">
              Mango<span className="text-accent font-black">Admin</span>
            </span>
          </Link>

          {/* Desktop Breadcrumbs/Page Context */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary/80 px-3 py-1 rounded-full border border-border/30">
              Admin Area
            </span>
            <span className="text-muted-foreground/40 text-sm">/</span>
            <span className="text-sm font-black text-foreground">{getPageTitle()}</span>
          </div>
        </div>

        {/* Right Side: Profile & Top-Right Sign Out Button */}
        <div className="flex items-center gap-4">
          {/* Desktop Admin Profile summary details */}
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-black text-foreground">{userName || 'Admin'}</span>
          </div>

          {/* Sign Out option positioned on top-right */}
          <div className="flex items-center justify-center">
            <AdminSignOutButton 
              className="px-3.5 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-full border border-rose-500/20 shadow-sm transition-all duration-300 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer w-auto" 
              showText={true} 
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Row (Swipeable tabs) - Visible only on mobile screens */}
      <div className="md:hidden border-t border-border/30 bg-secondary/5 overflow-x-auto scrollbar-none flex items-center px-4 h-11 w-full">
        <nav className="flex space-x-2.5 py-1.5 flex-nowrap min-w-max">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm scale-102"
                    : "text-muted-foreground bg-card hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-3 w-3" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
