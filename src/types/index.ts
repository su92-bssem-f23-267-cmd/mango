export interface User {
  id: string
  name?: string | null
  email: string
  role: 'ADMIN' | 'USER'
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  products?: Product[]
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  rating: number
  image: string
  categoryId: string
  category?: Category
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Product
  quantity: number
  price: number
}

export interface Order {
  id: string
  userId?: string | null
  user?: User | null
  customerName: string
  customerEmail: string
  customerAddress: string
  totalAmount: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  orderItems?: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: () => number
  totalItems: () => number
}
