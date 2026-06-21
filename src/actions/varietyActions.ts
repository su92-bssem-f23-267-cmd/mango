'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import db from '@/lib/db'
import { auth } from '@/lib/auth'
import { varietySchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin privilege required.')
  }
}

export async function createVariety(formData: FormData) {
  try {
    await checkAdmin()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const isActiveStr = formData.get('isActive') as string

    // Validate using Zod
    const validation = varietySchema.safeParse({
      name,
      description: description || null,
      isActive: isActiveStr,
    })

    if (!validation.success) {
      return { error: validation.error.issues[0].message }
    }

    // Check uniqueness
    const normalizedName = validation.data.name.trim()
    const existing = await db.variety.findFirst({
      where: { name: { equals: normalizedName, mode: 'insensitive' } }
    })

    if (existing) {
      return { error: 'Variety name already exists.' }
    }

    const variety = await db.variety.create({
      data: {
        name: normalizedName,
        description: validation.data.description,
        isActive: validation.data.isActive,
      }
    })

    revalidatePath('/admin/varieties')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/mangoes') // Mango form might depend on varieties
    return { success: true, varietyId: variety.id }
  } catch (err: any) {
    console.error('Error in createVariety:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function updateVariety(id: string, formData: FormData) {
  try {
    await checkAdmin()

    const variety = await db.variety.findUnique({ where: { id } })
    if (!variety) {
      return { error: 'Variety not found' }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const isActiveStr = formData.get('isActive') as string

    // Validate using Zod
    const validation = varietySchema.safeParse({
      name,
      description: description || null,
      isActive: isActiveStr,
    })

    if (!validation.success) {
      return { error: validation.error.issues[0].message }
    }

    // Check uniqueness (excluding self)
    const normalizedName = validation.data.name.trim()
    const existing = await db.variety.findFirst({
      where: {
        name: { equals: normalizedName, mode: 'insensitive' },
        NOT: { id }
      }
    })

    if (existing) {
      return { error: 'Variety name already exists.' }
    }

    const updatedVariety = await db.variety.update({
      where: { id },
      data: {
        name: normalizedName,
        description: validation.data.description,
        isActive: validation.data.isActive,
      }
    })

    revalidatePath('/admin/varieties')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/mangoes')
    return { success: true, varietyId: updatedVariety.id }
  } catch (err: any) {
    console.error('Error in updateVariety:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function deleteVariety(id: string) {
  try {
    await checkAdmin()

    const variety = await db.variety.findUnique({ where: { id } })
    if (!variety) {
      return { error: 'Variety not found' }
    }

    // Check if variety contains mangoes
    const mangoCount = await db.mango.count({ where: { varietyId: id } })
    if (mangoCount > 0) {
      return { error: 'This variety contains mangoes. Move or delete mangoes first.' }
    }

    await db.variety.delete({ where: { id } })

    revalidatePath('/admin/varieties')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/mangoes')
    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteVariety:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getVarieties(query = '', status = 'all', page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit

    const where: any = {}

    if (query) {
      where.name = { contains: query, mode: 'insensitive' }
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    const [varieties, total] = await Promise.all([
      db.variety.findMany({
        where,
        include: {
          _count: {
            select: { mangoes: true }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      db.variety.count({ where })
    ])

    return {
      success: true,
      varieties: varieties.map(v => ({
        ...v,
        mangoCount: v._count.mangoes
      })),
      total,
      pages: Math.ceil(total / limit)
    }
  } catch (err: any) {
    console.error('Error in getVarieties:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getVarietyById(id: string) {
  try {
    const variety = await db.variety.findUnique({
      where: { id },
      include: {
        mangoes: {
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!variety) {
      return { error: 'Variety not found' }
    }

    return {
      success: true,
      variety
    }
  } catch (err: any) {
    console.error('Error in getVarietyById:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}
