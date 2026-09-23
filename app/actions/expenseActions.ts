"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ExpenseCategory } from '@prisma/client'
import { requireAuth, requireManagerOrOwner } from './authActions'

export async function createExpense(data: any) {
  try {
    const { membership } = await requireManagerOrOwner()

    const expense = await prisma.expense.create({
      data: {
        category: data.category,
        description: data.description,
        amount: data.amount,
        date: data.date ? new Date(data.date) : new Date(),
        carId: data.carId || null,
        branchId: data.branchId || null,
        showroomId: membership.showroomId,
        ownerId: membership.userId, // Legacy fallback
      },
    })
    revalidatePath('/admin')
    return { success: true, expense }
  } catch (error) {
    console.error('Error creating expense:', error)
    return { success: false, error: 'Gagal mencatat pengeluaran' }
  }
}

export async function getExpenses(ownerId?: string) {
  try {
    const { membership } = await requireAuth()
    const expenses = await prisma.expense.findMany({
      where: { showroomId: membership.showroomId },
      orderBy: { date: 'desc' },
      include: {
        car: { select: { name: true, brand: true } },
        branch: { select: { name: true } },
      },
    })
    return expenses
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
}

export async function getExpenseStats(ownerId?: string) {
  try {
    const { membership } = await requireAuth()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [allExpenses, monthlyExpenses] = await Promise.all([
      prisma.expense.aggregate({
        where: { showroomId: membership.showroomId },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: {
          showroomId: membership.showroomId,
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    const byCategory = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        showroomId: membership.showroomId,
        date: { gte: startOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    })

    return {
      totalAll: allExpenses._sum.amount || 0,
      totalMonth: monthlyExpenses._sum.amount || 0,
      countMonth: monthlyExpenses._count || 0,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        total: c._sum.amount || 0,
        count: c._count,
      })),
    }
  } catch (error) {
    console.error('Error fetching expense stats:', error)
    return { totalAll: 0, totalMonth: 0, countMonth: 0, byCategory: [] }
  }
}

export async function deleteExpense(id: string) {
  try {
    const { membership } = await requireManagerOrOwner()
    const existing = await prisma.expense.findUnique({ where: { id } })
    if (!existing || existing.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak' }
    }

    await prisma.expense.delete({ where: { id } })
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error deleting expense:', error)
    return { success: false, error: 'Gagal menghapus pengeluaran' }
  }
}
