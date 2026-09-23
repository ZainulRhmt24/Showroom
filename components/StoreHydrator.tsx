"use client"

import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'

export function StoreHydrator({ initialContent, initialCars, initialBranches }: { initialContent: Record<string, string>, initialCars?: any[], initialBranches?: any[] }) {
  const isHydrated = useRef(false)

  useEffect(() => {
    if (!isHydrated.current && Object.keys(initialContent).length > 0) {
      useStore.setState((state) => ({
        dynamicContent: {
          ...state.dynamicContent,
          ...initialContent
        },
        ...(initialCars ? { cars: initialCars } : {}),
        ...(initialBranches ? { branches: initialBranches } : {})
      }))
      isHydrated.current = true
    }
  }, [initialContent])

  return null
}
