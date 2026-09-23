"use client"

import { ReportDashboard } from '@/components/admin/ReportDashboard'
import { useAdminData } from '../layout'

export default function ReportsPage() {
  const {
    dbCars,
    dbLeads,
    dbTransactions,
    dbExpenses,
    transactionStats,
    expenseStats,
  } = useAdminData()

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ReportDashboard
        cars={dbCars}
        leads={dbLeads}
        transactions={dbTransactions}
        expenses={dbExpenses}
        transactionStats={transactionStats}
        expenseStats={expenseStats}
      />
    </div>
  )
}
