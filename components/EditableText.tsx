"use client"

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Edit2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { upsertContent } from '@/app/actions/contentActions'

interface EditableTextProps {
  contentKey: string
  defaultText: string
  className?: string
  as?: React.ElementType
  multiline?: boolean
}

export function EditableText({
  contentKey,
  defaultText,
  className,
  as: Component = 'span',
  multiline = false,
}: EditableTextProps) {
  const isAdminLoggedIn = useStore((state) => state.isAdminLoggedIn)
  const isEditMode = useStore((state) => state.isEditMode)
  const dynamicContent = useStore((state) => state.dynamicContent)
  const updateDynamicContent = useStore((state) => state.updateDynamicContent)

  const savedText = dynamicContent[contentKey]
  const displayText = savedText !== undefined ? savedText : defaultText

  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(displayText)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // Sync state if external store changes
  useEffect(() => {
    setValue(displayText)
  }, [displayText])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      // Move cursor to the end
      if ('setSelectionRange' in inputRef.current) {
        const length = inputRef.current.value.length
        inputRef.current.setSelectionRange(length, length)
      }
    }
  }, [isEditing])

  const handleSave = () => {
    updateDynamicContent(contentKey, value)
    upsertContent(contentKey, value).catch(console.error)
    setIsEditing(false)
    setIsHovered(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setValue(displayText) // revert
      setIsEditing(false)
      setIsHovered(false)
    }
  }

  if (!isAdminLoggedIn || !isEditMode) {
    return <Component className={className}>{displayText}</Component>
  }

  if (isEditing) {
    if (multiline) {
      return (
        <div className="relative inline-block w-full z-50">
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full bg-background text-foreground border-2 border-primary rounded-lg p-2 outline-none shadow-lg resize-none min-h-[100px]",
              className
            )}
          />
          <button
            onClick={handleSave}
            className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-1.5 rounded-md hover:bg-primary/90 shadow-md"
            title="Simpan"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      )
    }

    return (
      <div className="relative inline-block w-full z-50">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full bg-background text-foreground border-2 border-primary rounded-lg p-1 px-2 outline-none shadow-lg",
            className
          )}
        />
        <button
          onClick={handleSave}
          onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-1 rounded-md hover:bg-primary/90 shadow-sm"
          title="Simpan"
        >
          <Check className="w-3 h-3" />
        </button>
      </div>
    )
  }

  return (
    <Component
      className={cn(
        className,
        "relative group cursor-pointer transition-all duration-200",
        "outline outline-1 outline-dashed outline-primary/40 outline-offset-4 hover:outline-primary hover:bg-primary/5 rounded-sm"
      )}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsEditing(true)
      }}
    >
      {displayText}
      <span className="absolute -top-3 -right-3 bg-primary text-primary-foreground p-1.5 rounded-md shadow-md z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
        <Edit2 className="w-3 h-3" />
      </span>
    </Component>
  )
}
