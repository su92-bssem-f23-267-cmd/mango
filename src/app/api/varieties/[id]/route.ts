/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getVarietyById, updateVariety, deleteVariety } from '@/actions/varietyActions'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const res = await getVarietyById(id)
  if (res.error) {
    const status = res.error.includes('not found') ? 404 : 500
    return NextResponse.json({ error: res.error }, { status })
  }
  return NextResponse.json(res.variety)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const res = await updateVariety(id, actionFormData)
    if (res.error) {
      const status = res.error.includes('Unauthorized') ? 401 : res.error.includes('not found') ? 404 : 400
      return NextResponse.json({ error: res.error }, { status })
    }
    return NextResponse.json({ success: true, varietyId: res.varietyId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const res = await deleteVariety(id)
    if (res.error) {
      const status = res.error.includes('Unauthorized') ? 401 : res.error.includes('not found') ? 404 : 400
      return NextResponse.json({ error: res.error }, { status })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
