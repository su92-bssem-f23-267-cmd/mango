'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import useMangoCartStore from '@/store/cart-store'
import useMounted from '@/hooks/useMounted'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const mounted = useMounted()

  const cartItems = useMangoCartStore((state) => state.items)
  const updateQuantity = useMangoCartStore((state) => state.updateQuantity)
  const removeItem = useMangoCartStore((state) => state.removeItem)
  const cartTotal = useMangoCartStore((state) => state.cartTotal())
  const clearCart = useMangoCartStore((state) => state.clearCart)

  const handleCheckoutRedirect = () => {
    router.push('/checkout')
  }

  // Handle SSR Hydration Limits
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <p className="text-sm text-muted-foreground font-semibold">Loading your basket...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center max-w-md space-y-4">
        <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Your Cart is Empty</h1>
          <p className="text-sm text-muted-foreground">
            Browse our fresh orchard varieties and add some delicious mangoes to your cart!
          </p>
        </div>
        <Link
          href="/mangoes"
          className={cn(buttonVariants({ size: "lg" }), "font-bold cursor-pointer rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 mt-4")}
        >
          Explore Catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-1 border-b border-border/40 pb-4">
        <h1 className="text-3xl font-black text-primary tracking-tight">Your Shopping Cart</h1>
        <p className="text-xs text-muted-foreground">Review your reserved mango varieties before checking out.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart items table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-3 px-2">
            <span>Harvest Items</span>
            <button onClick={clearCart} className="text-destructive hover:underline flex items-center gap-1 cursor-pointer">
              Clear All Items
            </button>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border/60 p-4 rounded-2xl shadow-sm"
              >
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover bg-secondary"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.varietyName || 'Mangoes'}</p>
                    <p className="text-xs font-bold text-amber-600 mt-1">${item.price.toFixed(2)} / unit</p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:justify-end">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-border rounded-full bg-background p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-full"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center text-primary">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.stock > 0 && item.quantity >= item.stock}
                      className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-full"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="font-bold text-primary text-sm min-w-[70px] text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive p-2 rounded-full transition-colors cursor-pointer hover:bg-secondary/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link href="/mangoes" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-amber-600 transition">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-bold text-primary tracking-tight">Basket Summary</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/40 pt-0 text-xs">
              <div className="py-4 space-y-2">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold uppercase tracking-wider text-[10px]">Free Shipping</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Estimated Taxes</span>
                  <span className="font-semibold text-foreground">$0.00</span>
                </div>
                <div className="flex justify-between items-center text-base font-black text-primary pt-3 border-t border-border/30 mt-2">
                  <span>Estimated Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="py-4 space-y-4">
                <Button
                  onClick={handleCheckoutRedirect}
                  className="w-full font-black text-sm cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11"
                >
                  Proceed to Checkout
                </Button>

                <div className="flex items-start gap-2 bg-secondary/30 border border-border/60 p-3 rounded-2xl">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    By proceeding to checkout, your seasonal harvest reservations will be held for up to 30 minutes. Delivery options can be customized on the shipping page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
