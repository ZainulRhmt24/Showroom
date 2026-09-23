"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth, requireManagerOrOwner, requireOwner } from './authActions'

export async function createBranch(data: any) {
  try {
    const { membership } = await requireManagerOrOwner()

    const branch = await prisma.branch.create({
      data: {
        id: data.id,
        slug: data.slug,
        name: data.name,
        city: data.city,
        address: data.address,
        mapUrl: data.mapUrl || '',
        phone: data.phone || '',
        openDays: data.openDays || 'Senin - Sabtu',
        openHours: data.openHours || '09:00 - 18:00',
        description: data.description || '',
        showroomId: membership.showroomId,
        ownerId: membership.userId, // Legacy fallback
      },
    })
    
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true, branch }
  } catch (error) {
    console.error('Error creating branch:', error)
    return { success: false, error: 'Gagal membuat cabang' }
  }
}

export async function getBranches(ownerId?: string) {
  try {
    const { membership } = await requireAuth()
    const branches = await prisma.branch.findMany({
      where: { showroomId: membership.showroomId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: {
            cars: true,
            transactions: true,
            memberships: true,
            leads: true,
          }
        }
      }
    })
    return branches
  } catch (error) {
    console.error('Error fetching branches:', error)
    return []
  }
}

export async function updateBranch(id: string, data: any) {
  try {
    const { membership } = await requireManagerOrOwner()
    const existing = await prisma.branch.findUnique({ where: { id } })
    if (!existing || existing.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak' }
    }

    const { ownerId, showroomId, ...cleanData } = data

    const branch = await prisma.branch.update({
      where: { id },
      data: cleanData,
    })
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true, branch }
  } catch (error) {
    console.error('Error updating branch:', error)
    return { success: false, error: 'Gagal memperbarui cabang' }
  }
}

export async function deleteBranch(id: string) {
  try {
    const { membership } = await requireOwner()
    const existing = await prisma.branch.findUnique({ where: { id } })
    if (!existing || existing.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak' }
    }

    await prisma.car.updateMany({
      where: { branchId: id },
      data: { branchId: null },
    })
    
    await prisma.branch.delete({ where: { id } })
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error deleting branch:', error)
    return { success: false, error: 'Gagal menghapus cabang' }
  }
}

export async function getBranchStats(ownerId?: string) {
  try {
    const { membership } = await requireAuth()
    const branches = await prisma.branch.findMany({
      where: { showroomId: membership.showroomId },
      include: {
        cars: {
          select: {
            id: true,
            price: true,
            isSoldOut: true,
          }
        },
        _count: {
          select: {
            cars: true,
            transactions: true,
            expenses: true,
            memberships: true,
            leads: true,
          }
        }
      }
    })

    return branches.map((b) => ({
      id: b.id,
      name: b.name,
      city: b.city,
      isActive: b.isActive,
      totalCars: b._count.cars,
      readyCars: b.cars.filter(c => !c.isSoldOut).length,
      soldCars: b.cars.filter(c => c.isSoldOut).length,
      totalValuation: b.cars.filter(c => !c.isSoldOut).reduce((s, c) => s + c.price, 0),
      totalTransactions: b._count.transactions,
      totalExpenses: b._count.expenses,
    }))
  } catch (error) {
    console.error('Error fetching branch stats:', error)
    return []
  }
}
