'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Store, ShoppingBag, Package, User } from 'lucide-react'
import useMangoCartStore from '@/store/cart-store'
import useMounted from '@/hooks/useMounted'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: typeof Home
  badge?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/mangoes', label: 'Shop', icon: Store },
  { href: '/cart', label: 'Cart', icon: ShoppingBag, badge: true },
  { href: '/profile/orders', label: 'Orders', icon: Package },
  { href: '/profile', label: 'Profile', icon: User },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function BottomNav() {
  const pathname = usePathname() || '/'
  const mounted = useMounted()
  const totalItems = useMangoCartStore((state) => state.totalItems())

  // Hide on the admin panel — it has its own layout
  if (pathname.startsWith('/admin')) return null

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-safe"
    >
      <div className="mx-3 mb-3 rounded-3xl border border-border/60 bg-background/70 backdrop-blur-2xl shadow-[0_8px_30px_-6px_rgba(0,0,0,0.18)]">
        <ul className="flex items-stretch justify-between px-2 py-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            const Icon = item.icon
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.label}
                  className="relative flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-2xl"
                >
                  {active && (
                    <motion.span
                      layoutId="bottomNavActive"
                      className="absolute inset-0 rounded-2xl bg-primary/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors duration-300',
                        active ? 'text-primary' : 'text-muted-foreground'
                      )}
                      strokeWidth={active ? 2.4 : 1.9}
                    />
                    {item.badge && mounted && totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 flex items-center justify-center rounded-full gradient-amber text-[10px] font-bold text-white shadow-sm">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'relative text-[10px] font-semibold tracking-tight transition-colors duration-300',
                      active ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export default BottomNav
