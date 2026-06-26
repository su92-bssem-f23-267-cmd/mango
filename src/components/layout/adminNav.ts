import { LayoutDashboard, ShoppingBag, Leaf, Tags, Package, Store } from 'lucide-react'

export type AdminNavItem = {
  /** Full label used in the desktop sidebar */
  name: string
  /** Short label used in the compact mobile bottom navigation */
  short: string
  href: string
  icon: typeof LayoutDashboard
}

/** Primary admin modules — mapped to real, existing routes only. */
export const ADMIN_NAV: AdminNavItem[] = [
  { name: 'Dashboard', short: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Order Management', short: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Product Management', short: 'Products', href: '/admin/mangoes', icon: Leaf },
  { name: 'Variety Management', short: 'Varieties', href: '/admin/varieties', icon: Tags },
  { name: 'Inventory Management', short: 'Inventory', href: '/admin/inventory', icon: Package },
]

/** Link back to the public storefront. */
export const ADMIN_STORE_LINK: AdminNavItem = {
  name: 'Back to Store',
  short: 'Store',
  href: '/',
  icon: Store,
}

/** Items shown directly in the mobile bottom bar; the rest collapse into "More". */
export const ADMIN_BOTTOM_PRIMARY: AdminNavItem[] = ADMIN_NAV.slice(0, 4)
export const ADMIN_BOTTOM_MORE: AdminNavItem[] = [
  ...ADMIN_NAV.slice(4),
  ADMIN_STORE_LINK,
]

/** Active-route detection that also matches nested routes (e.g. /admin/varieties/create). */
export function isAdminRouteActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Resolve a human page title for the current admin route. */
export function adminPageTitle(pathname: string): string {
  const match = ADMIN_NAV.find((item) => isAdminRouteActive(pathname, item.href))
  return match?.name ?? 'Admin Panel'
}
