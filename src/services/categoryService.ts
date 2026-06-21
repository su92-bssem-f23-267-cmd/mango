import db from '@/lib/db'

export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories from database:', error)
    return []
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const category = await db.category.findUnique({
      where: { slug }
    })
    return category
  } catch (error) {
    console.error(`Error fetching category by slug ${slug}:`, error)
    return null
  }
}
