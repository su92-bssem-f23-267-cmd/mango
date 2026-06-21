import { NextResponse } from 'next/server'
import { getCategories } from '@/services/categoryService'

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    console.error('API error fetching categories:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
