import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MangoCartItem {
  id: string
  name: string
  price: number
  image: string
  stock: number
  varietyName: string
  quantity: number
}

interface CartStore {
  items: MangoCartItem[]
  addItem: (item: Omit<MangoCartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartTotal: () => number
  totalItems: () => number
}

export const useMangoCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const currentItems = get().items
        const existingIndex = currentItems.findIndex((i) => i.id === item.id)

        if (existingIndex > -1) {
          const updatedItems = [...currentItems]
          const existing = updatedItems[existingIndex]
          const newQty = existing.quantity + quantity
          existing.quantity = item.stock > 0 ? Math.min(newQty, item.stock) : newQty
          set({ items: updatedItems })
        } else {
          const cappedQty = item.stock > 0 ? Math.min(quantity, item.stock) : quantity
          set({ items: [...currentItems, { ...item, quantity: cappedQty }] })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },
      updateQuantity: (id, quantity) => {
        const updatedItems = get().items.map((i) => {
          if (i.id === id) {
            const capped = i.stock > 0 ? Math.min(quantity, i.stock) : quantity
            return { ...i, quantity: Math.max(1, capped) }
          }
          return i
        })
        set({ items: updatedItems })
      },
      clearCart: () => set({ items: [] }),
      cartTotal: () => get().items.reduce((t, i) => t + i.price * i.quantity, 0),
      totalItems: () => get().items.reduce((t, i) => t + i.quantity, 0),
    }),
    { name: 'mango-cart-storage' }
  )
)

export default useMangoCartStore
