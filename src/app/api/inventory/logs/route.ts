import { NextResponse } from 'next/server'
import { getInventoryLogs } from '@/actions/inventoryActions'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mangoId = searchParams.get('mangoId') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await getInventoryLogs(mangoId, page, limit)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
