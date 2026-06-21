'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import db from '@/lib/db'
import { auth } from '@/lib/auth'
import { promises as fs } from 'fs'
import path from 'path'
import { mangoFormSchema, mangoUpdateFormSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin privilege required.')
  }
}

async function saveUploadedImage(imageFile: File): Promise<string> {
  const bytes = await imageFile.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'mangoes')
  await fs.mkdir(uploadDir, { recursive: true })

  const extension = path.extname(imageFile.name) || '.jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${extension}`
  const filepath = path.join(uploadDir, filename)

  await fs.writeFile(filepath, buffer)
  return `/uploads/mangoes/${filename}`
}

async function deleteImageFile(imageUrl: string) {
  try {
    if (imageUrl.startsWith('/uploads/mangoes/')) {
      const filepath = path.join(process.cwd(), 'public', imageUrl)
      await fs.unlink(filepath)
    }
  } catch (err) {
    console.error('Failed to delete image file:', err)
  }
}

export async function createMango(formData: FormData) {
  try {
    await checkAdmin()

    const name = formData.get('name') as string
    const varietyId = formData.get('varietyId') as string
    const description = formData.get('description') as string
    const priceStr = formData.get('price') as string
    const stockStr = formData.get('stock') as string
    const isActiveStr = formData.get('isActive') as string
    const imageFile = formData.get('image') as File

    // Validate using Zod form schema
    const validation = mangoFormSchema.safeParse({
      name,
      varietyId,
      description,
      price: priceStr,
      stock: stockStr,
      isActive: isActiveStr,
      image: imageFile,
    })

    if (!validation.success) {
      return { error: validation.error.issues[0].message }
    }

    const imageUrl = await saveUploadedImage(imageFile)

    const mango = await db.mango.create({
      data: {
        name: validation.data.name,
        description: validation.data.description,
        price: validation.data.price,
        stock: validation.data.stock,
        isActive: validation.data.isActive,
        varietyId: validation.data.varietyId,
        image: imageUrl,
      }
    })

    revalidatePath('/admin/mangoes')
    revalidatePath('/admin/dashboard')
    return { success: true, mangoId: mango.id }
  } catch (err: any) {
    console.error('Error in createMango:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function updateMango(id: string, formData: FormData) {
  try {
    await checkAdmin()

    const mango = await db.mango.findUnique({ where: { id } })
    if (!mango) {
      return { error: 'Mango not found' }
    }

    const name = formData.get('name') as string
    const varietyId = formData.get('varietyId') as string
    const description = formData.get('description') as string
    const priceStr = formData.get('price') as string
    const stockStr = formData.get('stock') as string
    const isActiveStr = formData.get('isActive') as string
    const imageFile = formData.get('image') as File

    const hasNewImage = imageFile && imageFile.size > 0

    // Validate using update Zod schema
    const validation = mangoUpdateFormSchema.safeParse({
      name,
      varietyId,
      description,
      price: priceStr,
      stock: stockStr,
      isActive: isActiveStr,
      image: hasNewImage ? imageFile : undefined,
    })

    if (!validation.success) {
      return { error: validation.error.issues[0].message }
    }

    let imageUrl = mango.image
    if (hasNewImage) {
      // Delete old image
      await deleteImageFile(mango.image)
      // Save new image
      imageUrl = await saveUploadedImage(imageFile)
    }

    const updatedMango = await db.mango.update({
      where: { id },
      data: {
        name: validation.data.name,
        description: validation.data.description,
        price: validation.data.price,
        stock: validation.data.stock,
        isActive: validation.data.isActive,
        varietyId: validation.data.varietyId,
        image: imageUrl,
      }
    })

    revalidatePath('/admin/mangoes')
    revalidatePath('/admin/dashboard')
    return { success: true, mangoId: updatedMango.id }
  } catch (err: any) {
    console.error('Error in updateMango:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function deleteMango(id: string) {
  try {
    await checkAdmin()

    const mango = await db.mango.findUnique({ where: { id } })
    if (!mango) {
      return { error: 'Mango not found' }
    }

    // Delete image file first
    await deleteImageFile(mango.image)

    await db.mango.delete({ where: { id } })

    revalidatePath('/admin/mangoes')
    revalidatePath('/admin/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteMango:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function toggleMangoStatus(id: string) {
  try {
    await checkAdmin()

    const mango = await db.mango.findUnique({ where: { id } })
    if (!mango) {
      return { error: 'Mango not found' }
    }

    await db.mango.update({
      where: { id },
      data: { isActive: !mango.isActive }
    })

    revalidatePath('/admin/mangoes')
    revalidatePath('/admin/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Error in toggleMangoStatus:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getMangoes(query = '', page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit

    const where: any = {}

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { variety: { name: { contains: query, mode: 'insensitive' } } }
      ]
    }

    const [mangoes, total] = await Promise.all([
      db.mango.findMany({
        where,
        include: { variety: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.mango.count({ where })
    ])

    return {
      success: true,
      mangoes: mangoes.map(m => ({
        ...m,
        price: m.price.toNumber() // Convert decimal to number
      })),
      total,
      pages: Math.ceil(total / limit)
    }
  } catch (err: any) {
    console.error('Error in getMangoes:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getMangoById(id: string) {
  try {
    const mango = await db.mango.findUnique({
      where: { id },
      include: { variety: true }
    })

    if (!mango) {
      return { error: 'Mango not found' }
    }

    return {
      success: true,
      mango: {
        ...mango,
        price: mango.price.toNumber() // Convert decimal to number
      }
    }
  } catch (err: any) {
    console.error('Error in getMangoById:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getVarieties(activeOnly = false) {
  try {
    const where = activeOnly ? { isActive: true } : {}
    const varieties = await db.variety.findMany({
      where,
      orderBy: { name: 'asc' }
    })
    return { success: true, varieties }
  } catch (err: any) {
    console.error('Error in getVarieties:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}
