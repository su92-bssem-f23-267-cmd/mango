'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShoppingCart, Heart, Plus, Minus, ShieldCheck, Truck, RotateCcw, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import useMangoCartStore from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/actions/wishlistActions'
import { cn } from '@/lib/utils'

interface MangoDetailsClientProps {
  mango: {
    id: string
    name: string
    description: string
    price: number
    stock: number
    image: string
    variety: {
      id: string
      name: string
    }
  }
}

export default function MangoDetailsClient({ mango }: MangoDetailsClientProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const addItem = useMangoCartStore((state) => state.addItem)
  
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)

  // Verify wishlist status
  useEffect(() => {
    if (session?.user) {
      isInWishlist(mango.id).then((res) => {
        setIsFavorite(res.inWishlist)
      })
    }
  }, [session, mango.id])

  const handleIncrement = () => {
    if (mango.stock > 0 && quantity >= mango.stock) {
      toast.warning(`Sorry, only ${mango.stock} units are in stock.`)
      return
    }
    setQuantity((prev) => prev + 1)
  }

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleAddToCart = () => {
    if (mango.stock <= 0) {
      toast.error('This variety is currently out of harvest.')
      return
    }

    addItem({
      id: mango.id,
      name: mango.name,
      price: mango.price,
      image: mango.image,
      stock: mango.stock,
      varietyName: mango.variety.name
    }, quantity)

    toast.success(`${quantity} x ${mango.name} added to cart!`, {
      description: 'You can proceed to checkout in your cart.',
      action: {
        label: 'Go to Cart',
        onClick: () => router.push('/cart')
      }
    })
  }

  const handleWishlistToggle = async () => {
    if (!session?.user) {
      toast.error('Authentication Required', {
        description: 'Please sign in to add items to your wishlist.',
        action: {
          label: 'Sign In',
          onClick: () => router.push(`/login?callbackUrl=/mangoes/${mango.id}`)
        }
      })
      return
    }

    setLoadingFavorite(true)
    try {
      if (isFavorite) {
        const res = await removeFromWishlist(mango.id)
        if (res.success) {
          setIsFavorite(false)
          toast.success('Removed from wishlist')
        } else {
          toast.error(res.error || 'Failed to update wishlist')
        }
      } else {
        const res = await addToWishlist(mango.id)
        if (res.success) {
          setIsFavorite(true)
          toast.success('Added to wishlist')
        } else {
          toast.error(res.error || 'Failed to update wishlist')
        }
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoadingFavorite(false)
    }
  }

  const isOutOfStock = mango.stock <= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
      {/* Left side: Premium Image Gallery frame */}
      <div className="relative aspect-square md:aspect-4/3 rounded-3xl overflow-hidden border border-border/80 bg-secondary/15 shadow-sm group">
        <img
          src={mango.image || '/uploads/mangoes/sindhri.png'}
          alt={mango.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        />
        {isOutOfStock ? (
          <Badge variant="destructive" className="absolute top-4 left-4 font-bold text-xs px-3 py-1 rounded-full shadow">
            Out of harvest
          </Badge>
        ) : mango.stock < 10 ? (
          <Badge className="absolute top-4 left-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1 rounded-full animate-pulse shadow">
            Harvest Running Low: Only {mango.stock} left
          </Badge>
        ) : (
          <Badge className="absolute top-4 left-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow">
            Available In-Stock
          </Badge>
        )}
      </div>

      {/* Right side: Detailed Specs and actions */}
      <div className="space-y-6">
        <div className="space-y-2">
          {/* Variety and Category Tag */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
              {mango.variety.name} Variety
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight leading-tight">{mango.name}</h1>
          <p className="text-2xl font-black text-amber-600">Rs. {mango.price.toLocaleString()}</p>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {mango.description}
          </p>
        </div>

        {/* Actions panel */}
        <div className="border-t border-b border-border/50 py-6 space-y-4">
          {isOutOfStock ? (
            <div className="flex items-center gap-2 text-xs font-bold text-destructive bg-destructive/10 p-3 rounded-2xl">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              This variety is currently out of stock. Check back during the next seasonal drop!
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              {/* Quantity selector */}
              <div className="flex items-center border border-border rounded-full bg-background p-1 shadow-sm">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all rounded-full cursor-pointer hover:bg-secondary/50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-black w-8 text-center text-primary">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="p-2 text-muted-foreground hover:text-foreground transition-all rounded-full cursor-pointer hover:bg-secondary/50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 min-w-[200px] font-black tracking-tight text-sm flex items-center justify-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Basket
              </Button>
            </div>
          )}

          {/* Wishlist toggle */}
          <Button
            onClick={handleWishlistToggle}
            variant="outline"
            disabled={loadingFavorite}
            className={cn(
              "w-full font-bold text-xs flex items-center justify-center gap-2 rounded-full h-10 border-border/80 hover:bg-secondary cursor-pointer",
              isFavorite && "border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-600"
            )}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-rose-500")} />
            {isFavorite ? 'Saved in Wishlist' : 'Add to Wishlist'}
          </Button>
        </div>

        {/* Shipping / Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 bg-secondary/25 p-3 rounded-2xl border border-border/40">
            <Truck className="h-5 w-5 text-primary shrink-0" />
            <span>Temp-Controlled Shipping</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/25 p-3 rounded-2xl border border-border/40">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            <span>Quality Grading Guarantee</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/25 p-3 rounded-2xl border border-border/40">
            <RotateCcw className="h-5 w-5 text-primary shrink-0" />
            <span>Hassle-Free Replacements</span>
          </div>
        </div>
      </div>
    </div>
  )
}
