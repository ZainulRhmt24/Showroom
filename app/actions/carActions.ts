"use server"

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { CarTransmission, CarFuel, CarType, CarCondition } from '@prisma/client'
import { requireAuth, requireManagerOrOwner } from './authActions'

async function revalidatePublicShowroom(showroomId: string, carSlug?: string) {
  const showroom = await prisma.showroom.findUnique({ where: { id: showroomId }, select: { slug: true } })
  if (!showroom) return
  const base = `/showroom/${showroom.slug}`
  revalidatePath(base)
  revalidatePath(`${base}/cars`)
  if (carSlug) revalidatePath(`${base}/cars/${carSlug}`)
}

export async function getCars() {
  try {
    const { membership } = await requireAuth()
    let whereClause: any = { showroomId: membership.showroomId }
    
    // SALES only sees cars from their assigned branch (if they have one)
    if (membership.role === 'SALES' && membership.branchId) {
      whereClause.branchId = membership.branchId
    }

    const cars = await prisma.car.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        branch: { select: { name: true } }
      }
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
  priceCredit?: number
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
  branchId?: string
  taxDate?: string
  plateNumber?: string
  ownership?: string
  serviceRecord?: string
  documents?: string[]
  isFloodFree?: boolean
  isAccidentFree?: boolean
  isOdometerVerified?: boolean
  warrantyDays?: number
  ownerId?: string // legacy, will be ignored
}) {
  try {
    const { membership } = await requireManagerOrOwner() // Only manager or owner can add cars

    // Remove ownerId from data if it exists to avoid overwriting
    const { ownerId, ...cleanData } = data as any

    const car = await prisma.car.create({
      data: {
        ...cleanData,
        priceCredit: cleanData.priceCredit || Math.round(cleanData.price * 0.95),
        gallery: cleanData.gallery || [],
        features: cleanData.features || [],
        documents: cleanData.documents || ['BPKB Asli', 'STNK Hidup', 'Faktur Resmi', 'Kunci Serep', 'Buku Servis'],
        ownership: cleanData.ownership || 'Tangan Pertama (Pribadi)',
        serviceRecord: cleanData.serviceRecord || 'Bengkel Resmi (ATPM)',
        taxDate: cleanData.taxDate || 'Oktober 2026',
        plateNumber: cleanData.plateNumber || 'B 1234 XYZ (Genap)',
        isFloodFree: cleanData.isFloodFree !== undefined ? cleanData.isFloodFree : true,
        isAccidentFree: cleanData.isAccidentFree !== undefined ? cleanData.isAccidentFree : true,
        isOdometerVerified: cleanData.isOdometerVerified !== undefined ? cleanData.isOdometerVerified : true,
        warrantyDays: cleanData.warrantyDays || 365,
        showroomId: membership.showroomId,
        branchId: cleanData.branchId || null,
        ownerId: membership.userId, // Legacy fallback
      },
    })
    revalidatePath('/')
    revalidatePath('/admin')
    await revalidatePublicShowroom(membership.showroomId, car.slug)
    return { success: true, car }
  } catch (error) {
    console.error('Error creating car:', error)
    return { success: false, error: 'Gagal menambahkan mobil' }
  }
}

export async function updateCar(id: string, data: Partial<Parameters<typeof createCar>[0]>) {
  try {
    const { membership } = await requireManagerOrOwner()
    
    // Verify ownership
    const existing = await prisma.car.findUnique({ where: { id } })
    if (!existing || existing.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak' }
    }

    const { ownerId, ...cleanData } = data as any

    if (cleanData.branchId) {
      const branch = await prisma.branch.findUnique({ where: { id: cleanData.branchId } })
      if (!branch || branch.showroomId !== membership.showroomId) {
        return { success: false, error: 'Cabang tidak valid' }
      }
    }

    const car = await prisma.car.update({
      where: { id },
      data: cleanData,
    })
    revalidatePath('/')
    revalidatePath(`/mobil/${car.slug}`)
    revalidatePath('/admin')
    await revalidatePublicShowroom(membership.showroomId, car.slug)
    return { success: true, car }
  } catch (error) {
    console.error('Error updating car:', error)
    return { success: false, error: 'Gagal memperbarui mobil' }
  }
}

export async function deleteCar(id: string) {
  try {
    const { membership } = await requireManagerOrOwner()
    
    // Verify ownership
    const existing = await prisma.car.findUnique({ where: { id } })
    if (!existing || existing.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak' }
    }

    await prisma.car.delete({
      where: { id },
    })
    revalidatePath('/')
    revalidatePath('/admin')
    await revalidatePublicShowroom(membership.showroomId, existing.slug)
    return { success: true }
  } catch (error) {
    console.error('Error deleting car:', error)
    return { success: false, error: 'Gagal menghapus mobil' }
  }
}
