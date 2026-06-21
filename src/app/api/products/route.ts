import { NextResponse } from 'next/server'
import { getProducts } from '@/services/productService'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : undefined

    const products = await getProducts({
      search,
      categorySlug: category,
      limit
    })

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('API error fetching products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
