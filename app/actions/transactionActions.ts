"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth, requireManagerOrOwner, requireOwner } from './authActions'

export async function createTransaction(data: any) {
  try {
    const { membership } = await requireManagerOrOwner()

    const transaction = await prisma.transaction.create({
      data: {
        type: data.type || 'Penjualan',
        carId: data.carId || null,
        carName: data.carName,
        leadId: data.leadId || null,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone || null,
        salePrice: data.salePrice,
        paymentMethod: data.paymentMethod || 'Cash',
        branchId: data.branchId || null,
        showroomId: membership.showroomId,
        ownerId: membership.userId, // Legacy fallback
        soldAt: data.soldAt ? new Date(data.soldAt) : new Date(),
        notes: data.notes || null,
      },
    })

    if (data.carId) {
      await prisma.car.update({
        where: { id: data.carId },
        data: { isSoldOut: true, badge: 'SOLD OUT' },
      }).catch(() => {})
    }

    revalidatePath('/admin')
    revalidatePath('/')
    const showroom = await prisma.showroom.findUnique({ where: { id: membership.showroomId }, select: { slug: true } })
    if (showroom) {
      revalidatePath(`/showroom/${showroom.slug}`)
      revalidatePath(`/showroom/${showroom.slug}/cars`)
      if (data.carId) {
        const car = await prisma.car.findFirst({ where: { id: data.carId, showroomId: membership.showroomId }, select: { slug: true } })
        if (car) revalidatePath(`/showroom/${showroom.slug}/cars/${car.slug}`)
      }
    }
    return { success: true, transaction }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return { success: false, error: 'Gagal mencatat transaksi' }
  }
}

export async function getTransactions(ownerId?: string) {
  try {
    const { membership } = await requireAuth()
    const transactions = await prisma.transaction.findMany({
      where: { showroomId: membership.showroomId },
      orderBy: { soldAt: 'desc' },
      include: {
        car: { select: { name: true, brand: true, image: true } },
        branch: { select: { name: true } },
      },
    })
    return transactions
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
}

export async function getTransactionStats(ownerId?: string) {
  try {
    const { membership } = await requireAuth()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [thisMonth, lastMonth, allTime] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          showroomId: membership.showroomId,
          soldAt: { gte: startOfMonth },
        },
        _sum: { salePrice: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          showroomId: membership.showroomId,
          soldAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
        _sum: { salePrice: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { showroomId: membership.showroomId },
        _sum: { salePrice: true },
        _count: true,
      }),
    ])

    const monthlyBreakdown = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const data = await prisma.transaction.aggregate({
        where: {
          showroomId: membership.showroomId,
          soldAt: { gte: start, lt: end },
        },
        _sum: { salePrice: true },
        _count: true,
      })
      const monthName = start.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
      monthlyBreakdown.push({
        month: monthName,
        revenue: data._sum.salePrice || 0,
        units: data._count || 0,
      })
    }

    return {
      thisMonth: {
        revenue: thisMonth._sum.salePrice || 0,
        units: thisMonth._count || 0,
      },
      lastMonth: {
        revenue: lastMonth._sum.salePrice || 0,
        units: lastMonth._count || 0,
      },
      allTime: {
        revenue: allTime._sum.salePrice || 0,
        units: allTime._count || 0,
      },
      monthlyBreakdown,
    }
  } catch (error) {
    console.error('Error fetching transaction stats:', error)
    return {
      thisMonth: { revenue: 0, units: 0 },
      lastMonth: { revenue: 0, units: 0 },
      allTime: { revenue: 0, units: 0 },
      monthlyBreakdown: [],
    }
  }
}

export async function deleteTransaction(id: string) {
  try {
    const { membership } = await requireOwner()
    const tx = await prisma.transaction.findUnique({ where: { id } })
    if (!tx || tx.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak' }
    }
    
    if (tx.carId) {
      await prisma.car.update({
        where: { id: tx.carId },
        data: { isSoldOut: false, badge: 'READY STOCK' },
      }).catch(() => {})
    }

    await prisma.transaction.delete({ where: { id } })
    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return { success: false, error: 'Gagal menghapus transaksi' }
  }
}
