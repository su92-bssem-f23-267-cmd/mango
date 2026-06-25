'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import { toast } from 'sonner'
import useMangoCartStore from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/actions/wishlistActions'
import { cn } from '@/lib/utils'
import { use3dTilt } from '@/hooks/use3dTilt'

interface MangoCardProps {
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

export function MangoCard({ mango }: MangoCardProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const addItem = useMangoCartStore((state) => state.addItem)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const tilt = use3dTilt(10)

  // Check if this mango is in the wishlist
  useEffect(() => {
    if (session?.user) {
      isInWishlist(mango.id).then((res) => {
        setIsFavorite(res.inWishlist)
      })
    }
  }, [session, mango.id])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (mango.stock <= 0) {
      toast.error('Sorry, this mango variety is currently out of harvest.')
      return
    }

    addItem({
      id: mango.id,
      name: mango.name,
      price: mango.price,
      image: mango.image,
      stock: mango.stock,
      varietyName: mango.variety.name
    }, 1)

    toast.success(`${mango.name} added to your cart!`, {
      description: 'You can view it in the side drawer cart.',
      action: {
        label: 'Checkout',
        onClick: () => router.push('/checkout')
      }
    })
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      toast.error('Authentication Required', {
        description: 'Please sign in to add items to your wishlist.',
        action: {
          label: 'Sign In',
          onClick: () => router.push(`/login?callbackUrl=/mangoes`)
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
    <Link href={`/mangoes/${mango.id}`} className="group block">
      <div
        ref={tilt.ref}
        onMouseMove={tilt.handleMouseMove}
        onMouseLeave={tilt.handleMouseLeave}
        style={tilt.style}
        className="glow-mango glow-mango-hover overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground flex flex-col h-full relative will-change-transform"
      >
        {/* Product Image Area */}
        <div className="relative aspect-square overflow-hidden bg-secondary/20" style={{ transformStyle: 'preserve-3d' }}>
          <img
            src={mango.image || '/uploads/mangoes/sindhri.png'}
            alt={mango.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}
            loading="lazy"
          />
          
          {/* Stock Badges */}
          {isOutOfStock ? (
            <Badge variant="destructive" className="absolute top-3 left-3 font-semibold text-xs rounded-full" style={{ transform: 'translateZ(40px)' }}>
              Out of Harvest
            </Badge>
          ) : mango.stock < 10 ? (
            <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-full animate-pulse" style={{ transform: 'translateZ(40px)' }}>
              Only {mango.stock} left
            </Badge>
          ) : null}

          {/* Wishlist Button (Heart) */}
          <button
            onClick={handleWishlistToggle}
            disabled={loadingFavorite}
            style={{ transform: 'translateZ(45px)' }}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full border shadow-sm transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border-white/40 text-muted-foreground hover:text-rose-500 hover:scale-110",
              isFavorite && "text-rose-500 bg-rose-50 border-rose-100"
            )}
            title={isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-rose-500")} />
          </button>
          
          {/* Variety Tag */}
          {mango.variety && (
            <Badge variant="secondary" className="absolute bottom-3 left-3 text-[10px] uppercase font-bold tracking-wider rounded-full bg-black/60 text-white border-none backdrop-blur-sm" style={{ transform: 'translateZ(35px)' }}>
              {mango.variety.name}
            </Badge>
          )}
        </div>

        {/* Info Content Area */}
        <div className="p-5 flex-1 flex flex-col justify-between" style={{ transformStyle: 'preserve-3d' }}>
          <div className="space-y-2" style={{ transform: 'translateZ(20px)' }}>
            {/* Title */}
            <h3 className="font-bold text-base group-hover:text-primary transition-colors leading-snug">
              {mango.name}
            </h3>
            {/* Description Preview */}
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {mango.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/40" style={{ transform: 'translateZ(25px)' }}>
            <span className="text-lg font-black text-accent">Rs. {mango.price.toLocaleString()}</span>
            
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              size="sm"
              className="h-8 px-4 font-bold text-xs flex items-center gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
export default MangoCard
