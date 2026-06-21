import { NextResponse } from 'next/server'
import { addToWishlist, getWishlist } from '@/actions/wishlistActions'

export async function GET() {
  try {
    const result = await getWishlist()
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { mangoId } = await request.json()
    if (!mangoId) {
      return NextResponse.json({ error: 'mangoId is required' }, { status: 400 })
    }
    const result = await addToWishlist(mangoId)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
