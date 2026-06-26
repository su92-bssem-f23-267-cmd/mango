'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ADMIN_NAV, ADMIN_STORE_LINK, isAdminRouteActive } from '@/components/layout/adminNav'

interface AdminSidebarProps {
  userName?: string | null
  userEmail?: string | null
}

export default function AdminSidebar({ userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname() || ''

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/60 text-card-foreground backdrop-blur-xl">
      {/* Brand */}
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-green text-white shadow-md shadow-primary/25 transition-transform duration-300 group-hover:scale-105">
            <span className="text-base font-black">F</span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-black tracking-tight text-foreground">
              Fruit<span className="text-primary">Gala</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Admin Suite</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Menu</p>
        {ADMIN_NAV.map((item) => {
          const active = isAdminRouteActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-300',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
              )}
            >
              {active && (
                <motion.span
                  layoutId="adminSidebarActive"
                  className="absolute inset-0 rounded-xl bg-primary/10 ring-1 ring-primary/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  'relative h-4.5 w-4.5 shrink-0 transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className="relative">{item.name}</span>
            </Link>
          )
        })}

        <div className="my-4 border-t border-border/50" />

        <Link
          href={ADMIN_STORE_LINK.href}
          className="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:bg-secondary/70 hover:text-foreground"
        >
          <ADMIN_STORE_LINK.icon className="h-4.5 w-4.5 shrink-0 transition-colors group-hover:text-primary" />
          {ADMIN_STORE_LINK.name}
        </Link>
      </nav>

      {/* User card */}
      <div className="p-4">
        <div className="glass-card flex items-center gap-3 rounded-2xl p-3 shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-green text-xs font-black text-white shadow-sm">
            {(userName || 'A').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-foreground">{userName || 'Administrator'}</p>
            <p className="truncate text-[10px] text-muted-foreground">{userEmail || 'Signed in'}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
