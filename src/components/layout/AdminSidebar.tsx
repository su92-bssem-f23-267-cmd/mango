'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, Leaf, Tags, Package, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  userName?: string | null
  userEmail?: string | null
}

export default function AdminSidebar({ userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Order Management',
      href: '/admin/orders',
      icon: ShoppingBag
    },
    {
      name: 'Mango Management',
      href: '/admin/mangoes',
      icon: Leaf
    },
    {
      name: 'Variety Management',
      href: '/admin/varieties',
      icon: Tags
    },
    {
      name: 'Inventory Management',
      href: '/admin/inventory',
      icon: Package
    },
    {
      name: 'Back to Store',
      href: '/',
      icon: Store
    }
  ]

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-card text-card-foreground">
      <div className="flex h-16 items-center px-6 border-b border-border/40 bg-background/30">
        <Link href="/admin/dashboard" className="flex items-center space-x-2 group">
          <span className="text-xl font-black tracking-tight text-primary transition-transform duration-300 group-hover:scale-[1.02]">
            Mango<span className="text-accent font-black">Admin</span>
          </span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                isActive
                  ? "bg-primary/10 text-primary border-l-4 border-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:translate-x-1"
              )}
            >
              <item.icon className={cn("mr-3 h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-5 border-t border-border/40 bg-secondary/10">
        <div className="text-left space-y-0.5">
          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Logged In As</p>
          <p className="text-xs font-bold text-foreground truncate">{userName || 'Administrator'}</p>
        </div>
      </div>
    </aside>
  )
}
