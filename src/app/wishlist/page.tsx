import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getWishlist } from '@/actions/wishlistActions'
import WishlistClient from '@/components/wishlist/WishlistClient'
import { Button, buttonVariants } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function WishlistPage() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center max-w-md space-y-5">
        <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center text-rose-500">
          <Heart className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Your Wishlist</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please log in or create an account to view and manage your saved premium mango harvests.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login?callbackUrl=/wishlist"
            className={cn(buttonVariants({ size: "lg" }), "font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90")}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "font-bold border-primary text-primary hover:bg-primary/10 rounded-full")}
          >
            Register
          </Link>
        </div>
      </div>
    )
  }

  const res = await getWishlist()
  const items = res.success ? (res.items || []) : []

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-1.5 border-b border-border/40 pb-4">
        <h1 className="text-3xl font-black text-primary tracking-tight">Your Saved Wishlist</h1>
        <p className="text-xs text-muted-foreground">Manage your saved mango varieties or add them to your shopping cart.</p>
      </div>

      <WishlistClient initialItems={items as any} />
    </div>
  )
}
