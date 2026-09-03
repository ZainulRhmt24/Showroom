"use client"

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Edit3, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EditModeToggle() {
  const isAdminLoggedIn = useStore((state) => state.isAdminLoggedIn)
  const isEditMode = useStore((state) => state.isEditMode)
  const toggleEditMode = useStore((state) => state.toggleEditMode)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isAdminLoggedIn) return null

  return (
    <button
      onClick={toggleEditMode}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl font-bold text-sm transition-all hover:scale-105",
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
  )
}
