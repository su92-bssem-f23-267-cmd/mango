'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingCart, ShoppingBag, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { removeFromWishlist } from '@/actions/wishlistActions'
import useMangoCartStore from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface WishlistItem {
  id: string
  mangoId: string
  createdAt: Date
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

interface WishlistClientProps {
  initialItems: WishlistItem[]
}

export default function WishlistClient({ initialItems }: WishlistClientProps) {
  const router = useRouter()
  const addItem = useMangoCartStore((state) => state.addItem)
  const [items, setItems] = useState<WishlistItem[]>(initialItems)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRemove = async (mangoId: string) => {
    setLoadingId(mangoId)
    try {
      const res = await removeFromWishlist(mangoId)
      if (res.success) {
        setItems((prev) => prev.filter((item) => item.mangoId !== mangoId))
        toast.success('Removed item from your wishlist')
      } else {
        toast.error(res.error || 'Failed to remove item')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoadingId(null)
    }
  }

  const handleAddToCart = (item: WishlistItem, e: React.MouseEvent) => {
    e.preventDefault()
    
    if (item.mango.stock <= 0) {
      toast.error('Sorry, this variety is out of harvest.')
      return
    }

    addItem({
      id: item.mango.id,
      name: item.mango.name,
      price: item.mango.price,
      image: item.mango.image,
      stock: item.mango.stock,
      varietyName: item.mango.variety.name
    }, 1)

    toast.success(`${item.mango.name} added to cart!`)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 max-w-md mx-auto space-y-4">
        <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center text-rose-500">
          <Heart className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Your Wishlist is Empty</h2>
          <p className="text-sm text-muted-foreground">
            Explore our fresh orchard harvests and save your absolute favorites for later!
          </p>
        </div>
        <Link href="/mangoes">
          <Button className="font-bold cursor-pointer rounded-full px-6 mt-4">
            Explore Catalogue
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const isOutOfStock = item.mango.stock <= 0

        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm flex flex-col h-full relative"
          >
            {/* Mango Image */}
            <div className="relative aspect-square overflow-hidden bg-secondary/20">
              <img
                src={item.mango.image || '/uploads/mangoes/sindhri.png'}
                alt={item.mango.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              
              {/* Variety Badge */}
              {item.mango.variety && (
                <span className="absolute bottom-3 left-3 text-[10px] uppercase font-bold tracking-wider bg-black/60 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  {item.mango.variety.name}
                </span>
              )}

              {/* Remove button (Trash Icon) */}
              <button
                onClick={() => handleRemove(item.mangoId)}
                disabled={loadingId === item.mangoId}
                className="absolute top-3 right-3 p-2 rounded-full border shadow-sm transition-all duration-300 cursor-pointer bg-white/95 border-white/40 text-muted-foreground hover:text-destructive hover:scale-110 disabled:opacity-50"
                title="Remove from Wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Info details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <Link href={`/mangoes/${item.mangoId}`} className="font-bold text-base hover:text-primary transition-colors block">
                  {item.mango.name}
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.mango.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                <span className="text-lg font-black text-primary">Rs. {item.mango.price.toLocaleString()}</span>
                
                <Button
                  onClick={(e) => handleAddToCart(item, e)}
                  disabled={isOutOfStock}
                  size="sm"
                  className="h-8 px-4 font-bold text-xs flex items-center gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
