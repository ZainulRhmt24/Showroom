"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/store/useStore'
import { Edit3, X, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EditModeToggle() {
  const isAdminLoggedIn = useStore((state) => state.isAdminLoggedIn)
  const isEditMode = useStore((state) => state.isEditMode)
  const toggleEditMode = useStore((state) => state.toggleEditMode)
  const setEditMode = useStore((state) => state.setEditMode)
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
    if (searchParams?.get('edit') === 'true' && isAdminLoggedIn) {
      setEditMode(true)
    }
  }, [searchParams, isAdminLoggedIn, setEditMode])

  if (!mounted || !isAdminLoggedIn) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <Link
        href="/admin"
        className="flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl font-bold text-sm transition-all hover:scale-105 bg-slate-900 text-white hover:bg-black border border-slate-700/50"
      >
        <LayoutDashboard className="w-4 h-4" /> Kembali ke Admin
      </Link>
      <button
        onClick={toggleEditMode}
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl font-bold text-sm transition-all hover:scale-105",
          isEditMode
            ? "bg-rose-500 text-white hover:bg-rose-600"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isEditMode ? (
          <>
            <X className="w-4 h-4" /> Tutup Mode Edit
          </>
        ) : (
          <>
            <Edit3 className="w-4 h-4" /> Masuk Mode Edit
          </>
        )}
      </button>
    </div>
  )
}
