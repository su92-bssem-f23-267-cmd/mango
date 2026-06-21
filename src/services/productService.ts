/* eslint-disable @typescript-eslint/no-explicit-any */
import db from '@/lib/db'

export async function getProducts(options?: {
  search?: string
  categorySlug?: string
  limit?: number
}) {
  try {
    const { search, categorySlug, limit } = options || {}

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug
      }
    }

    const products = await db.product.findMany({
      where,
      take: limit,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return products
  } catch (error) {
    console.error('Error fetching products from database:', error)
    return []
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        category: true
      }
    })
    return product
  } catch (error) {
    console.error(`Error fetching product by slug ${slug}:`, error)
    return null
  }
}
