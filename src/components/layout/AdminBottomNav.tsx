'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ADMIN_BOTTOM_PRIMARY,
  ADMIN_BOTTOM_MORE,
  isAdminRouteActive,
} from '@/components/layout/adminNav'
import ThemeToggle from '@/components/layout/ThemeToggle'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'

export default function AdminBottomNav() {
  const pathname = usePathname() || ''
  const [moreOpen, setMoreOpen] = useState(false)

  const moreActive = ADMIN_BOTTOM_MORE.some(
    (item) => item.href !== '/' && isAdminRouteActive(pathname, item.href)
  )

  return (
    <nav
      aria-label="Admin"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe"
    >
      <div className="mx-3 mb-3 rounded-3xl border border-border/60 bg-background/80 backdrop-blur-2xl shadow-[0_8px_30px_-6px_rgba(0,0,0,0.22)]">
        <ul className="flex items-stretch justify-between px-1.5 py-1.5">
          {ADMIN_BOTTOM_PRIMARY.map((item) => {
            const active = isAdminRouteActive(pathname, item.href)
            const Icon = item.icon
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.short}
                  className="relative flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5"
                >
                  {active && (
                    <motion.span
                      layoutId="adminBottomNavActive"
                      className="absolute inset-0 rounded-2xl bg-primary/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'relative h-5 w-5 transition-colors duration-300',
                      active ? 'text-primary' : 'text-muted-foreground'
                    )}
                    strokeWidth={active ? 2.4 : 1.9}
                  />
                  <span
                    className={cn(
                      'relative text-[10px] font-semibold tracking-tight transition-colors duration-300',
                      active ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {item.short}
                  </span>
                </Link>
              </li>
            )
          })}

          {/* More menu */}
          <li className="flex-1">
            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
              <SheetTrigger
                aria-label="More options"
                className="relative flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 focus-visible:outline-none"
              >
                {moreActive && (
                  <span className="absolute inset-0 rounded-2xl bg-primary/10" />
                )}
                <MoreHorizontal
                  className={cn(
                    'relative h-5 w-5 transition-colors duration-300',
                    moreActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  strokeWidth={moreActive ? 2.4 : 1.9}
                />
                <span
                  className={cn(
                    'relative text-[10px] font-semibold tracking-tight',
                    moreActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  More
                </span>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="rounded-t-3xl pb-safe"
                showCloseButton={false}
              >
                <SheetHeader className="flex-row items-center justify-between pb-2">
                  <SheetTitle className="text-base font-black">More options</SheetTitle>
                  <ThemeToggle />
                </SheetHeader>
                <div className="grid grid-cols-2 gap-3 p-4 pt-0">
                  {ADMIN_BOTTOM_MORE.map((item) => {
                    const active = isAdminRouteActive(pathname, item.href)
                    const Icon = item.icon
                    return (
                      <SheetClose
                        key={item.href}
                        render={
                          <Link
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 rounded-2xl border p-4 text-sm font-bold transition-colors',
                              active
                                ? 'border-primary/30 bg-primary/10 text-primary'
                                : 'border-border/60 bg-card text-foreground hover:bg-secondary/60'
                            )}
                          />
                        }
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </SheetClose>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </div>
    </nav>
  )
}
