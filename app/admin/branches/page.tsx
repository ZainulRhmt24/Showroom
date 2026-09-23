"use client"

import { BranchManagement } from '@/components/admin/BranchManagement'
import { useAdminData } from '../layout'
import { createBranch, updateBranch, deleteBranch } from '@/app/actions/branchActions'

export default function BranchesPage() {
  const { sessionUser, dbBranches, dbCars, loadFreshData } = useAdminData()

  const handleCreateBranch = async (data: any) => {
    const ownerId = sessionUser?.userId || null
    await createBranch({ ...data, ownerId })
    loadFreshData()
  }

  const handleUpdateBranch = async (id: string, data: any) => {
    await updateBranch(id, data)
    loadFreshData()
  }

  const handleDeleteBranch = async (id: string) => {
    await deleteBranch(id)
    loadFreshData()
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <BranchManagement
        branches={dbBranches}
        allCars={dbCars}
        onCreateBranch={handleCreateBranch}
        onUpdateBranch={handleUpdateBranch}
        onDeleteBranch={handleDeleteBranch}
      />
    </div>
  )
}
