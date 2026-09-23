"use client"

import { ExpenseTracker } from '@/components/admin/ExpenseTracker'
import { useAdminData } from '../layout'
import { createExpense, deleteExpense } from '@/app/actions/expenseActions'

export default function ExpensesPage() {
  const { sessionUser, dbExpenses, dbCars, dbBranches, loadFreshData } = useAdminData()

  const handleCreateExpense = async (data: any) => {
    const ownerId = sessionUser?.userId || null
    await createExpense({ ...data, ownerId })
    loadFreshData()
  }

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id)
    loadFreshData()
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ExpenseTracker
        expenses={dbExpenses}
        cars={dbCars}
        branches={dbBranches}
        onCreateExpense={handleCreateExpense}
        onDeleteExpense={handleDeleteExpense}
      />
    </div>
  )
}
