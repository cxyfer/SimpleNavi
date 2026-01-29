import { useState } from 'react'
import type { ViewMode } from '@/lib/types'

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('viewMode') as ViewMode) || 'grid'
  })

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('viewMode', mode)
  }

  return [viewMode, updateViewMode] as const
}
