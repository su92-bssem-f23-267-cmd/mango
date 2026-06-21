import { NextResponse } from 'next/server'
import { addStock } from '@/actions/inventoryActions'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const formData = new FormData()
    if (body.mangoId) formData.set('mangoId', body.mangoId)
    if (body.quantity !== undefined) formData.set('quantity', body.quantity.toString())
    if (body.note) formData.set('note', body.note)

    const result = await addStock(formData)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
