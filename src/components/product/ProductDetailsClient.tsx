'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Minus, ShieldCheck, Heart } from 'lucide-react'
import { toast } from 'sonner'
import useCartStore from '@/store/useCartStore'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'

interface ProductDetailsClientProps {
  product: Product
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Sorry, this product is currently out of stock.')
      return
    }

    addItem(product, quantity)
    toast.success(`${quantity} x ${product.name} added to cart!`)
  }

  const isOutOfStock = product.stock <= 0

  return (
    <div className="space-y-6">
      {/* Price and Stock Status */}
      <div className="flex items-center justify-between border-y border-border py-4">
        <span className="text-3xl font-black text-primary">${product.price.toFixed(2)}</span>
        <div>
          {isOutOfStock ? (
            <span className="text-xs font-bold text-destructive bg-destructive/10 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          ) : product.stock < 10 ? (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full animate-pulse">
              Only {product.stock} items left in stock
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              In Stock (Ready to Ship)
            </span>
          )}
        </div>
      </div>

      {/* Quantity Selector and Action Buttons */}
      {!isOutOfStock && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Quantity</label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-border rounded-lg bg-secondary/20">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-50 transition"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-bold text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => (product.stock > 0 ? Math.min(product.stock, q + 1) : q + 1))}
                disabled={product.stock > 0 && quantity >= product.stock}
                className="p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-50 transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="flex-1 font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
            >
              <ShoppingCart className="h-5 w-5" />
              Add {quantity > 1 ? `(${quantity})` : ''} to Cart
            </Button>

            <Button variant="outline" size="icon" className="h-11 w-11 border-border shrink-0 hover:text-accent cursor-pointer">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Sourcing details list */}
      <div className="bg-secondary/20 p-4 rounded-xl space-y-3 text-xs border border-border/50">
        <h4 className="font-bold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Our Harvesting Promise
        </h4>
        <ul className="space-y-2 text-muted-foreground">
          <li>• Hand-harvested at optimal maturity levels by our expert farmers.</li>
          <li>• Cooled immediately to arrest excessive ripening and locked in moisture.</li>
          <li>• Free of synthetic ripening agents (carbide-free guarantee).</li>
          <li>• Protected during shipping inside specialized shock-absorbent pulpy sleeves.</li>
        </ul>
      </div>
    </div>
  )
}
export default ProductDetailsClient
