'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { inventoryActionSchema, inventoryUpdateSchema } from '@/lib/validations'
import { auth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required')
  }
  return session.user.id
}

export async function addStock(formData: FormData) {
  try {
    const adminId = await checkAdmin()
    
    const data = Object.fromEntries(formData.entries())
    const validation = inventoryActionSchema.safeParse(data)

    if (!validation.success) {
      return { error: (validation.error as any).errors[0].message }
    }

    const { mangoId, quantity, note } = validation.data

    // We use a transaction to ensure stock update and log are atomic
    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const mango = await tx.mango.findUnique({ where: { id: mangoId } })
      if (!mango) throw new Error('Mango not found')

      const oldStock = mango.stock
      const newStock = oldStock + quantity

      const updatedMango = await tx.mango.update({
        where: { id: mangoId },
        data: { stock: newStock }
      })

      await tx.inventoryLog.create({
        data: {
          mangoId,
          actionType: 'ADD',
          oldStock,
          newStock,
          quantity,
          note,
          adminId
        }
      })

      return updatedMango
    })

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/inventory/logs')
    revalidatePath('/admin/dashboard')
    
    return { success: true, newStock: result.stock }
  } catch (err: any) {
    console.error('Error in addStock:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function removeStock(formData: FormData) {
  try {
    const adminId = await checkAdmin()
    
    const data = Object.fromEntries(formData.entries())
    const validation = inventoryActionSchema.safeParse(data)

    if (!validation.success) {
      return { error: (validation.error as any).errors[0].message }
    }

    const { mangoId, quantity, note } = validation.data

    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const mango = await tx.mango.findUnique({ where: { id: mangoId } })
      if (!mango) throw new Error('Mango not found')

      if (mango.stock < quantity) {
        throw new Error(`Cannot remove ${quantity}. Current stock is only ${mango.stock}.`)
      }

      const oldStock = mango.stock
      const newStock = oldStock - quantity

      const updatedMango = await tx.mango.update({
        where: { id: mangoId },
        data: { stock: newStock }
      })

      await tx.inventoryLog.create({
        data: {
          mangoId,
          actionType: 'REMOVE',
          oldStock,
          newStock,
          quantity,
          note,
          adminId
        }
      })

      return updatedMango
    })

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/inventory/logs')
    revalidatePath('/admin/dashboard')
    
    return { success: true, newStock: result.stock }
  } catch (err: any) {
    console.error('Error in removeStock:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function updateStock(formData: FormData) {
  try {
    const adminId = await checkAdmin()
    
    const data = Object.fromEntries(formData.entries())
    const validation = inventoryUpdateSchema.safeParse(data)

    if (!validation.success) {
      return { error: (validation.error as any).errors[0].message }
    }

    const { mangoId, quantity, note } = validation.data

    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const mango = await tx.mango.findUnique({ where: { id: mangoId } })
      if (!mango) throw new Error('Mango not found')

      const oldStock = mango.stock
      const newStock = quantity
      
      if (oldStock === newStock) {
        throw new Error('New stock is identical to current stock.')
      }

      const updatedMango = await tx.mango.update({
        where: { id: mangoId },
        data: { stock: newStock }
      })

      await tx.inventoryLog.create({
        data: {
          mangoId,
          actionType: 'UPDATE',
          oldStock,
          newStock,
          quantity: Math.abs(newStock - oldStock),
          note,
          adminId
        }
      })

      return updatedMango
    })

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/inventory/logs')
    revalidatePath('/admin/dashboard')
    
    return { success: true, newStock: result.stock }
  } catch (err: any) {
    console.error('Error in updateStock:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getInventory(
  query = '',
  statusFilter: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock' = 'all',
  page = 1,
  limit = 10
) {
  try {
    await checkAdmin()
    const skip = (page - 1) * limit

    const where: Prisma.MangoWhereInput = {}

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { variety: { name: { contains: query, mode: 'insensitive' } } }
      ]
    }

    if (statusFilter === 'in-stock') {
      where.stock = { gt: 0 }
    } else if (statusFilter === 'low-stock') {
      where.stock = { gt: 0, lte: 10 }
    } else if (statusFilter === 'out-of-stock') {
      where.stock = 0
    }

    const [mangoes, total] = await Promise.all([
      db.mango.findMany({
        where,
        include: { variety: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      db.mango.count({ where })
    ])

    return {
      success: true,
      mangoes: mangoes.map((m: any) => ({
        ...m,
        price: m.price.toNumber()
      })),
      total,
      pages: Math.ceil(total / limit)
    }
  } catch (err: any) {
    console.error('Error in getInventory:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getInventoryLogs(
  mangoId?: string,
  page = 1,
  limit = 10
) {
  try {
    await checkAdmin()
    const skip = (page - 1) * limit

    const where: Prisma.InventoryLogWhereInput = {}
    if (mangoId) {
      where.mangoId = mangoId
    }

    const [logs, total] = await Promise.all([
      db.inventoryLog.findMany({
        where,
        include: { 
          mango: { select: { name: true, variety: { select: { name: true } } } },
          admin: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.inventoryLog.count({ where })
    ])

    return {
      success: true,
      logs,
      total,
      pages: Math.ceil(total / limit)
    }
  } catch (err: any) {
    console.error('Error in getInventoryLogs:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getInventoryDashboardStats() {
  try {
    await checkAdmin()
    
    const [totalMangoesCount, inventoryStats, lowStockCount, outOfStockCount, activeProducts] = await Promise.all([
      db.mango.count(),
      db.mango.aggregate({ _sum: { stock: true } }),
      db.mango.count({ where: { stock: { gt: 0, lte: 10 } } }),
      db.mango.count({ where: { stock: 0 } }),
      db.mango.count({ where: { isActive: true } })
    ])

    return {
      success: true,
      stats: {
        totalMangoes: totalMangoesCount,
        totalInventoryUnits: inventoryStats._sum.stock || 0,
        lowStockItems: lowStockCount,
        outOfStock: outOfStockCount,
        activeProducts
      }
    }
  } catch (err: any) {
    console.error('Error in getInventoryDashboardStats:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}
