import { PrismaClient } from '@prisma/client'
import { CARS } from '../data/cars'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Insert default owner user for relations
  await prisma.user.upsert({
    where: { email: 'admin@denkenmotors.id' },
    update: { id: 'admin_owner_1', role: 'OWNER' },
    create: {
      id: 'admin_owner_1',
      email: 'admin@denkenmotors.id',
      name: 'Owner Denken Motors',
      password: 'AdminDenken2026!',
      role: 'OWNER',
    }
  })

  // Insert all cars from static file
  for (const car of CARS) {
    const existing = await prisma.car.findUnique({ where: { slug: car.slug } })
    if (!existing) {
      const { id, isSoldOut, badge, ...carData } = car
      await prisma.car.create({
        data: {
          id: id,
          badge: badge || null,
          isSoldOut: isSoldOut || false,
          ownerId: carData.ownerId || 'admin_owner_1',
          ...carData
        }
      })
      console.log(`Created car: ${car.name}`)
    } else {
      console.log(`Car already exists: ${car.name}`)
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
