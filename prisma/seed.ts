import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean database
  await prisma.inventoryLog.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.mango.deleteMany()
  await prisma.variety.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('Database cleaned.')

  // Create demo user
  const customerPassword = await bcrypt.hash('User123@', 12)
  const customerUser = await prisma.user.create({
    data: {
      name: 'Demo Customer',
      email: 'user@mangomart.com',
      password: customerPassword,
      role: 'USER'
    }
  })

  const adminPassword = await bcrypt.hash('Admin123@', 12)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'jamsubhasadiq125@gmail.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  })

  console.log('Demo users created:', customerUser.email, adminUser.email)

  // Seed Varieties
  const vSindhri = await prisma.variety.create({
    data: { name: 'Sindhri', description: 'Fiberless, sweet, oval-shaped premium variety.', isActive: true }
  })
  const vWhiteChaunsa = await prisma.variety.create({
    data: { name: 'White Chaunsa', description: 'Premium late-season White Chaunsa, highly sweet.', isActive: true }
  })
  const vAnwarRatol = await prisma.variety.create({
    data: { name: 'Anwar Ratol', description: 'Miniature, highly fragrant and intensely sweet.', isActive: true }
  })
  const v12NumberRatol = await prisma.variety.create({
    data: { name: '12 Number Ratol', description: 'Fragrant, special selection of Ratol variety.', isActive: true }
  })
  const vLangra = await prisma.variety.create({
    data: { name: 'Langra', description: 'Distinctive greenish-yellow skin and rich aroma.', isActive: true }
  })
  const vDusehri = await prisma.variety.create({
    data: { name: 'Dusehri', description: 'Famous sweet variety with thin skin and aromatic pulp.', isActive: true }
  })
  const vNawabpuriChaunsa = await prisma.variety.create({
    data: { name: 'Nawabpuri Chaunsa', description: 'Special Nawabpuri region Chaunsa mango.', isActive: true }
  })
  const vBlackChaunsa = await prisma.variety.create({
    data: { name: 'Black Chaunsa', description: 'Exquisite late-season Black Chaunsa variety.', isActive: true }
  })

  console.log('Varieties created.')

  // Seed Mangoes
  const mangoesToSeed = [
    {
      name: 'Sindhri 10KG Box',
      description: 'Hand-picked premium Sindhri mangoes in a 10KG box. Fiberless, sweet, and aromatic.',
      price: 2500,
      stock: 100,
      image: '/uploads/mangoes/sindhri.png',
      varietyId: vSindhri.id,
      isActive: true,
    },
    {
      name: 'White Chaunsa 10KG Box',
      description: 'Premium White Chaunsa 10KG box. Known for its succulent texture and sweet nectar.',
      price: 3500,
      stock: 80,
      image: '/uploads/mangoes/white-chaunsa.png',
      varietyId: vWhiteChaunsa.id,
      isActive: true,
    },
    {
      name: 'Anwar Ratol 10KG Box',
      description: 'Intensely sweet and fragrant Anwar Ratol mangoes in a standard 10KG box.',
      price: 3000,
      stock: 75,
      image: '/uploads/mangoes/anwar-ratol.png',
      varietyId: vAnwarRatol.id,
      isActive: true,
    },
    {
      name: '12 Number Ratol 10KG Box',
      description: 'Special 12 Number Ratol mangoes in a 10KG box. Fragrant, premium quality.',
      price: 3000,
      stock: 60,
      image: '/uploads/mangoes/ratol-12.png',
      varietyId: v12NumberRatol.id,
      isActive: true,
    },
    {
      name: 'Langra 10KG Box',
      description: 'Traditional Langra mangoes with unique greenish skin and sweet, aromatic pulp (10KG box).',
      price: 3000,
      stock: 90,
      image: '/uploads/mangoes/langra.png',
      varietyId: vLangra.id,
      isActive: true,
    },
    {
      name: 'Dusehri 10KG Box',
      description: 'Aromatic and sweet Dusehri mangoes in a 10KG box. Thin skin and rich fiberless pulp.',
      price: 3000,
      stock: 95,
      image: '/uploads/mangoes/sindhri.png',
      varietyId: vDusehri.id,
      isActive: true,
    },
    {
      name: 'Nawabpuri Chaunsa 10KG Box',
      description: 'Exquisite Nawabpuri Chaunsa mangoes, packed in a protective 10KG box.',
      price: 3200,
      stock: 85,
      image: '/uploads/mangoes/white-chaunsa.png',
      varietyId: vNawabpuriChaunsa.id,
      isActive: true,
    },
    {
      name: 'Black Chaunsa 10KG Box',
      description: 'Premium Black Chaunsa mangoes in a 10KG box. Rich, deep sweet tropical flavor.',
      price: 2800,
      stock: 70,
      image: '/uploads/mangoes/langra.png',
      varietyId: vBlackChaunsa.id,
      isActive: true,
    }
  ]

  for (const m of mangoesToSeed) {
    await prisma.mango.create({
      data: m
    })
  }

  console.log('Mangoes seeded.')

  // Create Initial Inventory Logs
  const allMangoes = await prisma.mango.findMany()
  if (allMangoes.length > 0) {
    const inventoryLogs = allMangoes.map((mango) => ({
      mangoId: mango.id,
      actionType: 'ADD' as const,
      oldStock: 0,
      newStock: mango.stock,
      quantity: mango.stock,
      note: 'Initial stock from system seed.',
      adminId: adminUser.id,
    }))
    await prisma.inventoryLog.createMany({
      data: inventoryLogs,
    })
    console.log('Inventory logs seeded.')
  }

  // Create Categories (Minimal to avoid crashes)
  const freshMangoes = await prisma.category.create({
    data: {
      name: 'Fresh Mangoes',
      slug: 'fresh-mangoes',
      description: 'Hand-picked premium mango varieties.',
      image: '/uploads/mangoes/hero-mangoes.png'
    }
  })

  // Create Products (Minimal to avoid crashes)
  await prisma.product.create({
    data: {
      name: 'Alphonso Mango Box',
      slug: 'alphonso-mango',
      description: 'Alphonso Premium Mangoes',
      price: 24.99,
      stock: 100,
      rating: 4.9,
      image: '/uploads/mangoes/hero-mangoes.png',
      categoryId: freshMangoes.id
    }
  })

  console.log('Products created.')
  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
