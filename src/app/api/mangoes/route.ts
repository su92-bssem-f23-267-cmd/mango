import { NextResponse } from 'next/server'
import { getMangoProducts } from '@/actions/shopActions'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const variety = searchParams.get('variety') || undefined
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
    const stockStatus = searchParams.get('stockStatus') as 'in-stock' | 'out-of-stock' | undefined
    const sort = (searchParams.get('sort') as any) || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const result = await getMangoProducts({ search, variety, minPrice, maxPrice, stockStatus, sort, page, limit })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
