'use server'

import db from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function getMangoProducts(options?: {
  search?: string
  variety?: string
  minPrice?: number
  maxPrice?: number
  stockStatus?: 'in-stock' | 'out-of-stock'
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'popular'
  page?: number
  limit?: number
}) {
  try {
    const {
      search,
      variety,
      minPrice,
      maxPrice,
      stockStatus,
      sort = 'newest',
      page = 1,
      limit = 12
    } = options || {}
    const skip = (page - 1) * limit

    const where: Prisma.MangoWhereInput = { isActive: true }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { variety: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (variety) {
      where.variety = { name: { equals: variety, mode: 'insensitive' } }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) (where.price as any).gte = minPrice
      if (maxPrice !== undefined) (where.price as any).lte = maxPrice
    }

    if (stockStatus === 'in-stock') {
      where.stock = { gt: 0 }
    } else if (stockStatus === 'out-of-stock') {
      where.stock = 0
    }

    let orderBy: Prisma.MangoOrderByWithRelationInput
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'popular':
        orderBy = { stock: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    const [mangoes, total] = await Promise.all([
      db.mango.findMany({
        where,
        include: { variety: { select: { id: true, name: true } } },
        orderBy,
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
      pages: Math.ceil(total / limit),
      page
    }
  } catch (err: any) {
    console.error('Error in getMangoProducts:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getMangoProduct(id: string) {
  try {
    const mango = await db.mango.findUnique({
      where: { id },
      include: { variety: { select: { id: true, name: true } } }
    })

    if (!mango) return { error: 'Mango not found' }

    // Fetch related products of the same variety
    const related = await db.mango.findMany({
      where: { varietyId: mango.varietyId, id: { not: mango.id }, isActive: true },
      include: { variety: { select: { id: true, name: true } } },
      take: 4
    })

    return {
      success: true,
      mango: { ...mango, price: (mango.price as any).toNumber() },
      related: related.map((m: any) => ({ ...m, price: m.price.toNumber() }))
    }
  } catch (err: any) {
    console.error('Error in getMangoProduct:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getActiveVarieties() {
  try {
    const varieties = await db.variety.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, _count: { select: { mangoes: true } } }
    })
    return { success: true, varieties }
  } catch (err: any) {
    console.error('Error in getActiveVarieties:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getFeaturedMangoes() {
  try {
    const mangoes = await db.mango.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      include: { variety: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8
    })

    return {
      success: true,
      mangoes: mangoes.map((m: any) => ({ ...m, price: m.price.toNumber() }))
    }
  } catch (err: any) {
    console.error('Error in getFeaturedMangoes:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}
