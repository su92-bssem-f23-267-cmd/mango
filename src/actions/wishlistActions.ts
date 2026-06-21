'use server'

import db from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('You must be logged in to manage your wishlist.')
  }
  return session.user.id
}

export async function addToWishlist(mangoId: string) {
  try {
    const userId = await getAuthUser()

    // Check if already wishlisted
    const existing = await db.wishlist.findUnique({
      where: { userId_mangoId: { userId, mangoId } }
    })

    if (existing) {
      return { error: 'Already in your wishlist.' }
    }

    await db.wishlist.create({
      data: { userId, mangoId }
    })

    revalidatePath('/wishlist')
    return { success: true }
  } catch (err: any) {
    console.error('Error in addToWishlist:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function removeFromWishlist(mangoId: string) {
  try {
    const userId = await getAuthUser()

    await db.wishlist.deleteMany({
      where: { userId, mangoId }
    })

    revalidatePath('/wishlist')
    return { success: true }
  } catch (err: any) {
    console.error('Error in removeFromWishlist:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function getWishlist() {
  try {
    const userId = await getAuthUser()

    const items = await db.wishlist.findMany({
      where: { userId },
      include: {
        mango: {
          include: { variety: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      items: items.map((w: any) => ({
        id: w.id,
        mangoId: w.mangoId,
        createdAt: w.createdAt,
        mango: {
          ...w.mango,
          price: w.mango.price.toNumber()
        }
      }))
    }
  } catch (err: any) {
    console.error('Error in getWishlist:', err)
    return { error: err.message || 'Something went wrong.' }
  }
}

export async function isInWishlist(mangoId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { inWishlist: false }

    const item = await db.wishlist.findUnique({
      where: { userId_mangoId: { userId: session.user.id, mangoId } }
    })
    return { inWishlist: !!item }
  } catch {
    return { inWishlist: false }
  }
}

export async function getWishlistCount() {
  try {
    const session = await auth()
    if (!session?.user?.id) return 0

    return await db.wishlist.count({ where: { userId: session.user.id } })
  } catch {
    return 0
  }
}
