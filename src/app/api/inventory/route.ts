import { NextResponse } from 'next/server'
import { getInventory } from '@/actions/inventoryActions'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const statusFilter = (searchParams.get('statusFilter') as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await getInventory(query, statusFilter, page, limit)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
