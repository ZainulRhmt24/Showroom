"use client"

import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'

export function StoreHydrator({ initialContent }: { initialContent: Record<string, string> }) {
  const isHydrated = useRef(false)

  useEffect(() => {
    if (!isHydrated.current && Object.keys(initialContent).length > 0) {
      useStore.setState((state) => ({
        dynamicContent: {
          ...state.dynamicContent,
          ...initialContent
        }
      }))
      isHydrated.current = true
    }
  }, [initialContent])

  return null
}
