"use server"

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { CarTransmission, CarFuel, CarType, CarCondition } from '@prisma/client'

export async function getCars() {
  try {
    const cars = await prisma.car.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return cars
  } catch (error) {
    console.error("Error fetching cars:", error)
    return []
  }
}

export async function createCar(data: {
  id?: string
  slug: string
  brand: string
  name: string
  year: number
  price: number
  monthly: number
  dp: number
  transmission: CarTransmission
  fuel: CarFuel
  engine: string
  mileage: number
  color: string
  type: CarType
  condition: CarCondition
  location: string
  image: string
  gallery?: string[]
  badge?: string
  isSoldOut?: boolean
  description: string
  features?: string[]
  ownerId?: string
}) {
  try {
    const targetOwnerId = data.ownerId || 'admin_owner_1';
    
    // Ensure User exists to prevent Foreign Key constraint error
    const userExists = await prisma.user.findUnique({ where: { id: targetOwnerId } });
    if (!userExists) {
      await prisma.user.create({
        data: {
          id: targetOwnerId,
          name: 'Showroom Admin',
          email: `${targetOwnerId}@denkenmotors.id`,
          role: 'OWNER'
        }
      });
    }

    const car = await prisma.car.create({
      data: {
        ...data,
        gallery: data.gallery || [],
        features: data.features || [],
        ownerId: targetOwnerId,
      },
    })
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true, car }
  } catch (error) {
    console.error('Error creating car:', error)
    return { success: false, error: 'Gagal menambahkan mobil' }
  }
}

export async function updateCar(id: string, data: Partial<Parameters<typeof createCar>[0]>) {
  try {
    const car = await prisma.car.update({
      where: { id },
      data,
    })
    revalidatePath('/')
    revalidatePath(`/mobil/${car.slug}`)
    revalidatePath('/admin')
    return { success: true, car }
  } catch (error) {
    console.error('Error updating car:', error)
    return { success: false, error: 'Gagal memperbarui mobil' }
  }
}

export async function deleteCar(id: string) {
  try {
    await prisma.car.delete({
      where: { id },
    })
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error deleting car:', error)
    return { success: false, error: 'Gagal menghapus mobil' }
  }
}
