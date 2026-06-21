'use client'

import Link from 'next/link'
import { Star, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import useCartStore from '@/store/useCartStore'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (product.stock <= 0) {
      toast.error('Sorry, this product is currently out of stock.')
      return
    }

    addItem(product, 1)
    toast.success(`${product.name} added to cart!`)
  }

  const isOutOfStock = product.stock <= 0

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition hover:shadow-md flex flex-col h-full">
        {/* Product Image Area */}
        <div className="relative aspect-square overflow-hidden bg-secondary/30">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Stock Badges */}
          {isOutOfStock ? (
            <Badge variant="destructive" className="absolute top-3 left-3 font-semibold text-xs">
              Out of Stock
            </Badge>
          ) : product.stock < 10 ? (
            <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs animate-pulse">
              Only {product.stock} left
            </Badge>
          ) : null}
          
          {/* Category Tag */}
          {product.category && (
            <Badge variant="secondary" className="absolute bottom-3 left-3 text-[10px] uppercase font-bold tracking-wider">
              {product.category.name}
            </Badge>
          )}
        </div>

        {/* Info Content Area */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            {/* Rating */}
            <div className="flex items-center space-x-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              <span className="text-xs font-bold">{product.rating.toFixed(1)}</span>
            </div>
            {/* Title */}
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {product.name}
            </h3>
            {/* Description Preview */}
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 mt-auto">
            <span className="text-base font-black text-primary">${product.price.toFixed(2)}</span>
            
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              size="sm"
              className="h-8 px-3 font-semibold text-xs flex items-center gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
export default ProductCard
