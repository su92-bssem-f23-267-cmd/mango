'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminSignOutButton from '@/components/layout/AdminSignOutButton'
import ThemeToggle from '@/components/layout/ThemeToggle'
import { adminPageTitle } from '@/components/layout/adminNav'

interface AdminHeaderProps {
  userName?: string | null
  userEmail?: string | null
}

export default function AdminHeader({ userName }: AdminHeaderProps) {
  const pathname = usePathname() || ''
  const title = adminPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: mobile brand + desktop breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/dashboard" className="flex items-center gap-2 md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-green text-sm font-black text-white shadow-sm">
              F
            </span>
            <span className="text-base font-black tracking-tight text-foreground">
              Fruit<span className="text-primary">Gala</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 min-w-0">
            <span className="rounded-full border border-border/40 bg-secondary/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Admin
            </span>
            <span className="text-sm text-muted-foreground/40">/</span>
            <h1 className="truncate text-sm font-black text-foreground">{title}</h1>
          </div>
        </div>

        {/* Right: theme + profile + sign out */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs font-black text-foreground">{userName || 'Admin'}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Administrator</span>
          </div>

          <AdminSignOutButton
            className="w-auto gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-2 sm:px-3.5 text-xs font-extrabold text-rose-600 shadow-sm transition-all duration-300 hover:bg-rose-500 hover:text-white [&_span]:hidden sm:[&_span]:inline [&_span]:ml-0 sm:[&_span]:ml-1.5"
            showText={true}
          />
        </div>
      </div>
    </header>
  )
}
