"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'

export default function RootRedirect() {
  const router = useRouter()
  const branches = useStore((state) => state.branches)

  useEffect(() => {
    if (branches && branches.length > 0) {
      const defaultBranch = branches[0]
      const cityPath = defaultBranch.slug || defaultBranch.city.toLowerCase().replace(/\s+/g, '-')
      router.replace(`/${cityPath}`)
    } else {
      router.replace('/jakarta')
    }
  }, [branches, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="animate-pulse text-muted-foreground font-bold">Mengarahkan ke cabang terdekat...</p>
    </div>
  )
}
