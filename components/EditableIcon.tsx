"use client"

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Edit2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ShieldCheck,
  Sparkles,
  Calculator,
  GitCompareArrows,
  Clock,
  ThumbsUp,
  Star,
  Car as CarIcon,
  Heart,
  Award,
  CheckCircle,
  Zap,
} from 'lucide-react'

// Map of available icons for the editor
const AVAILABLE_ICONS = [
  { id: 'ShieldCheck', icon: ShieldCheck, label: 'Keamanan' },
  { id: 'Sparkles', icon: Sparkles, label: 'Menarik' },
  { id: 'Calculator', icon: Calculator, label: 'Keuangan' },
  { id: 'GitCompareArrows', icon: GitCompareArrows, label: 'Tukar Tambah' },
  { id: 'Clock', icon: Clock, label: 'Waktu' },
  { id: 'ThumbsUp', icon: ThumbsUp, label: 'Kualitas' },
  { id: 'Star', icon: Star, label: 'Bintang' },
  { id: 'CarIcon', icon: CarIcon, label: 'Mobil' },
  { id: 'Heart', icon: Heart, label: 'Hati' },
  { id: 'Award', icon: Award, label: 'Penghargaan' },
  { id: 'CheckCircle', icon: CheckCircle, label: 'Selesai' },
  { id: 'Zap', icon: Zap, label: 'Cepat' },
]

export const ICON_MAP = AVAILABLE_ICONS.reduce((acc, curr) => {
  acc[curr.id] = curr.icon
  return acc
}, {} as Record<string, React.ElementType>)

interface EditableIconProps {
  contentKey: string
  defaultIconId: string
  className?: string
}

export function EditableIcon({
  contentKey,
  defaultIconId,
  className,
}: EditableIconProps) {
  const isAdminLoggedIn = useStore((state) => state.isAdminLoggedIn)
  const isEditMode = useStore((state) => state.isEditMode)
  const dynamicContent = useStore((state) => state.dynamicContent)
  const updateDynamicContent = useStore((state) => state.updateDynamicContent)

  const savedIconId = dynamicContent[contentKey]
  const displayIconId = savedIconId || defaultIconId

  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const IconComponent = ICON_MAP[displayIconId] || ShieldCheck

  const handleSelectIcon = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateDynamicContent(contentKey, id)
    setIsEditing(false)
    setIsHovered(false)
  }

  if (!isAdminLoggedIn || !isEditMode) {
    return <IconComponent className={className} />
  }

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "relative group cursor-pointer transition-all duration-200 inline-flex",
          "outline outline-1 outline-dashed outline-primary/40 outline-offset-4 hover:outline-primary hover:bg-primary/5 rounded-sm"
        )}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsEditing(!isEditing)
        }}
      >
        <IconComponent className={className} />
        {!isEditing && (
          <span className="absolute -top-3 -right-3 bg-primary text-primary-foreground p-1.5 rounded-md shadow-md z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
            <Edit2 className="w-3 h-3" />
          </span>
        )}
      </div>

      {isEditing && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 w-64 bg-card border border-border rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pilih Ikon</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(false)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {AVAILABLE_ICONS.map((item) => (
              <button
                key={item.id}
                onClick={(e) => handleSelectIcon(item.id, e)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg hover:bg-primary/10 transition-colors group",
                  displayIconId === item.id ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-primary"
                )}
                title={item.label}
              >
                <item.icon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
