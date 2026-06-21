import { NextResponse } from 'next/server'
import { getMangoProduct } from '@/actions/shopActions'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await getMangoProduct(id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
