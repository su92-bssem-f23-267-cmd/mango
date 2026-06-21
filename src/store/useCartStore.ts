import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartState, Product } from '@/types'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product, quantity = 1) => {
        const currentItems = get().items
        const existingIndex = currentItems.findIndex((item) => item.product.id === product.id)

        if (existingIndex > -1) {
          const updatedItems = [...currentItems]
          const existingItem = updatedItems[existingIndex]
          const newQuantity = existingItem.quantity + quantity
          
          // Cap quantity at product stock if stock is available
          existingItem.quantity = product.stock > 0 ? Math.min(newQuantity, product.stock) : newQuantity
          
          set({ items: updatedItems })
        } else {
          set({ items: [...currentItems, { product, quantity: product.stock > 0 ? Math.min(quantity, product.stock) : quantity }] })
        }
      },
      removeItem: (productId: string) => {
        const updatedItems = get().items.filter((item) => item.product.id !== productId)
        set({ items: updatedItems })
      },
      updateQuantity: (productId: string, quantity: number) => {
        const updatedItems = get().items.map((item) => {
          if (item.product.id === productId) {
            const cappedQuantity = item.product.stock > 0 ? Math.min(quantity, item.product.stock) : quantity
            return { ...item, quantity: Math.max(1, cappedQuantity) }
          }
          return item
        })
        set({ items: updatedItems })
      },
      clearCart: () => {
        set({ items: [] })
      },
      cartTotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      }
    }),
    {
      name: 'mango-mart-cart-storage',
    }
  )
)
export default useCartStore
