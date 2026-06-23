'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingBag, Search, Menu, X, Plus, Minus, Trash2, LogOut, Heart, User } from 'lucide-react'
import useMangoCartStore from '@/store/cart-store'
import useMounted from '@/hooks/useMounted'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet'

function HeaderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const mounted = useMounted()
  
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const cartItems = useMangoCartStore((state) => state.items)
  const updateQuantity = useMangoCartStore((state) => state.updateQuantity)
  const removeItem = useMangoCartStore((state) => state.removeItem)
  const cartTotal = useMangoCartStore((state) => state.cartTotal())
  const totalItems = useMangoCartStore((state) => state.totalItems())

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/mangoes?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/mangoes')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-tight text-primary">
            Mango<span className="text-accent font-black">Mart</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <Link href="/" className="transition hover:text-accent">Home</Link>
          <Link href="/mangoes" className="transition hover:text-accent">Browse Mangoes</Link>
          <Link href="/wishlist" className="transition hover:text-accent flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-foreground" /> Wishlist</Link>
          {session && (
            <Link href="/profile/orders" className="transition hover:text-accent flex items-center gap-1">
              Order History
            </Link>
          )}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex relative w-80">
          <Input
            type="search"
            placeholder="Search exotic mangoes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-accent"
          />
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
        </form>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* User Authentication Status */}
          {session ? (
            <div className="hidden md:flex items-center space-x-3">
              {(session.user as { role?: string })?.role === 'ADMIN' && (
                <Link href="/admin/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold border-accent/30 text-accent hover:bg-accent/10"
                  >
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Link href="/profile" className="flex items-center space-x-1.5 hover:text-accent transition">
                <User className="h-4 w-4" />
                <span className="text-xs text-muted-foreground font-medium hover:text-accent">
                  Hi, <span className="text-foreground font-semibold">{session.user?.name || 'User'}</span>
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="h-8 text-xs font-semibold flex items-center gap-1.5 hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button size="sm" variant="outline" className="h-9 font-semibold text-xs border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Sign In
              </Button>
            </Link>
          )}

          {/* Wishlist Link/Icon */}
          <Link href="/wishlist" className="relative cursor-pointer hover:bg-secondary p-2 rounded-full transition">
            <Heart className="h-5 w-5 text-foreground" />
          </Link>

          {/* Cart Icon Drawer */}
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger className="relative cursor-pointer p-2 rounded-full hover:bg-secondary focus-visible:outline-none">
              <ShoppingBag className="h-5 w-5 text-foreground" />
              {mounted && totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full bg-accent text-accent-foreground p-0 text-[10px] font-bold border-2 border-background animate-pulse">
                  {totalItems}
                </Badge>
              )}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col justify-between p-6">
              <SheetHeader className="pb-4 border-b border-border">
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-accent" />
                  Your Cart {mounted && `(${totalItems})`}
                </SheetTitle>
              </SheetHeader>

              {/* Cart List */}
              <div className="flex-1 overflow-y-auto py-4">
                {!mounted ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading cart...</p>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Your cart is empty</p>
                      <p className="text-xs text-muted-foreground mt-1">Browse our store and add some delicious mangoes!</p>
                    </div>
                    <Link
                      href="/mangoes"
                      className={cn(buttonVariants({ size: "sm" }), "mt-4 font-semibold text-xs cursor-pointer text-center justify-center flex items-center")}
                      onClick={() => setCartOpen(false)}
                    >
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center bg-secondary/30 p-3 rounded-lg border border-border/50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-md object-cover bg-secondary"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate text-foreground">{item.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.varietyName || 'Mangoes'}</p>
                          <p className="text-sm font-bold text-primary mt-1">Rs. {item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center border border-border rounded-md bg-background">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-semibold w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.stock > 0 && item.quantity >= item.stock}
                              className="px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtotal & Checkout */}
              {mounted && cartItems.length > 0 && (
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Subtotal</span>
                    <span className="text-lg font-black text-primary">Rs. {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Link
                      href="/checkout"
                      className={cn(buttonVariants(), "w-full font-bold cursor-pointer text-center justify-center flex items-center h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90")}
                      onClick={() => setCartOpen(false)}
                    >
                      Proceed to Checkout
                    </Link>
                    <SheetClose className={cn(buttonVariants({ variant: "outline" }), "w-full font-semibold text-xs cursor-pointer")}>
                      Continue Shopping
                    </SheetClose>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden hover:bg-secondary cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4 shadow-inner">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Input
              type="search"
              placeholder="Search exotic mangoes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 bg-secondary/50 border-none"
            />
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          </form>
          <nav className="flex flex-col space-y-3 text-sm font-semibold">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent py-1">Home</Link>
            <Link href="/mangoes" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent py-1">Browse Mangoes</Link>
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent py-1 flex items-center gap-1.5"><Heart className="h-4 w-4 text-foreground" /> Wishlist</Link>
            {session && (
              <>
                <Link href="/profile/orders" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent py-1 flex items-center gap-1.5"><ShoppingBag className="h-4 w-4 text-foreground" /> Order History</Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent py-1 flex items-center gap-1.5"><User className="h-4 w-4 text-foreground" /> Profile</Link>
              </>
            )}
          </nav>
          {session ? (
            <div className="border-t border-border pt-4 flex flex-col space-y-3">
              {(session.user as { role?: string })?.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-accent hover:underline py-1"
                >
                  Admin Panel
                </Link>
              )}
              <span className="text-xs text-muted-foreground">Logged in as: <strong className="text-foreground">{session.user?.email}</strong></span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full justify-center text-xs font-bold text-destructive hover:bg-destructive/10"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="border-t border-border pt-4">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full justify-center font-bold">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export function Header() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <Suspense fallback={
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-lg font-black tracking-tight text-primary">🥭 Mango Mart</span>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  )
}

export default Header
