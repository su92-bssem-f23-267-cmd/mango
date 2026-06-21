/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getVarieties, createVariety } from '@/actions/varietyActions'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const query = searchParams.get('query') || ''
  const status = searchParams.get('status') || 'all'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const res = await getVarieties(query, status, page, limit)
  if (res.error) {
    return NextResponse.json({ error: res.error }, { status: 500 })
  }
  return NextResponse.json(res)
}

export async function POST(req: NextRequest) {
  try {
    let name = ''
    let description = ''
    let isActive = 'true'

    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await req.json()
      name = body.name || ''
      description = body.description || ''
      isActive = body.isActive !== undefined ? String(body.isActive) : 'true'
    } else {
      const formData = await req.formData()
      name = (formData.get('name') as string) || ''
      description = (formData.get('description') as string) || ''
      isActive = (formData.get('isActive') as string) || 'true'
    }

    const actionFormData = new FormData()
    actionFormData.set('name', name)
    actionFormData.set('description', description)
    actionFormData.set('isActive', isActive)

    const res = await createVariety(actionFormData)
    if (res.error) {
      const status = res.error.includes('Unauthorized') ? 401 : 400
      return NextResponse.json({ error: res.error }, { status })
    }
    return NextResponse.json(res, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
