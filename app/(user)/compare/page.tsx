"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ComparePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/mobil')
  }, [router])

  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center text-center px-5 bg-secondary/30">
      <p className="text-sm font-semibold text-muted-foreground">Mengalihkan ke Katalog Mobil...</p>
    </div>
  )
}
