'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import db from '@/lib/db'
import { auth } from '@/lib/auth'
import { OrderStatus, PaymentMethod } from '@prisma/client'
import { revalidatePath } from 'next/cache'

interface OrderItemInput {
  mangoId: string
  quantity: number
  price: number
}

interface CreateOrderInput {
  fullName: string
  mobileNumber: string
  whatsapp?: string | null
  address: string
  city: string
  notes?: string | null
  items: OrderItemInput[]
}

export async function createOrder(data: CreateOrderInput) {
  try {
    const session = await auth()
    const userId = session?.user?.id || null

    if (!data.items || data.items.length === 0) {
      return { error: 'Your cart is empty.' }
    }

    // Process order inside a database transaction
    const order = await db.$transaction(async (tx) => {
      // 1. Create the Address record
      const address = await tx.address.create({
        data: {
          userId,
          fullName: data.fullName,
          mobileNumber: data.mobileNumber,
          whatsapp: data.whatsapp || null,
          address: data.address,
          city: data.city,
          notes: data.notes || null,
        }
      })

      let computedTotal = 0

      // 2. Verify stock and update mango inventory
      for (const item of data.items) {
        const mango = await tx.mango.findUnique({
          where: { id: item.mangoId }
        })

        if (!mango) {
          throw new Error('Mango variety not found in our catalog.')
        }

        if (mango.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${mango.name}". Only ${mango.stock} boxes available.`)
        }

        // Decrement stock
        await tx.mango.update({
          where: { id: item.mangoId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })

        computedTotal += mango.price.toNumber() * item.quantity
      }

      // 3. Create the Order in PostgreSQL
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId: address.id,
          totalAmount: computedTotal,
          status: 'PENDING',
          paymentMethod: 'COD',
          notes: data.notes || null,
          orderItems: {
            create: data.items.map((item) => ({
              mangoId: item.mangoId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          orderItems: true
        }
      })

      return newOrder
    })

    revalidatePath('/admin/orders')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/inventory')
    revalidatePath('/profile/orders')

    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error('Order checkout transaction failed:', error)
    return { error: error.message || 'Something went wrong. Please try again.' }
  }
}

export async function getAllOrders() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return { error: 'Unauthorized. Admin privilege required.' }
    }

    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        address: true,
        orderItems: {
          include: {
            mango: {
              include: {
                variety: true
              }
            }
          }
        }
      }
    })

    return { success: true, orders: JSON.parse(JSON.stringify(orders)) }
  } catch (error: any) {
    console.error('Error fetching admin orders:', error)
    return { error: error.message || 'Failed to fetch orders.' }
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, adminRemarks?: string) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return { error: 'Unauthorized. Admin privilege required.' }
    }

    const dataToUpdate: any = { status }
    if (adminRemarks !== undefined) {
      dataToUpdate.adminRemarks = adminRemarks
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: dataToUpdate,
      include: {
        user: { select: { name: true, email: true } }
      }
    })

    revalidatePath('/admin/orders')
    revalidatePath('/admin/dashboard')
    revalidatePath('/profile/orders')

    return { success: true, order: JSON.parse(JSON.stringify(order)) }
  } catch (error: any) {
    console.error('Error updating order status:', error)
    return { error: error.message || 'Failed to update order.' }
  }
}

export async function addAdminRemarks(orderId: string, remarks: string) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return { error: 'Unauthorized. Admin privilege required.' }
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: { adminRemarks: remarks }
    })

    revalidatePath('/admin/orders')
    revalidatePath('/profile/orders')

    return { success: true, order: JSON.parse(JSON.stringify(order)) }
  } catch (error: any) {
    console.error('Error updating admin remarks:', error)
    return { error: error.message || 'Failed to add remarks.' }
  }
}

export async function getUserOrders() {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return { error: 'You must be signed in to view orders.' }
    }

    const orders = await db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        orderItems: {
          include: {
            mango: {
              include: {
                variety: true
              }
            }
          }
        }
      }
    })

    return { success: true, orders: JSON.parse(JSON.stringify(orders)) }
  } catch (error: any) {
    console.error('Error fetching user orders:', error)
    return { error: error.message || 'Failed to fetch your orders.' }
  }
}
