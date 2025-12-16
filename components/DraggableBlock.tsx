'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { ComponentType } from '@/lib/types'

interface DraggableBlockProps {
  id: ComponentType
  children: React.ReactNode
  isEnabled: boolean
  primaryColor?: string
}

export function DraggableBlock({ id, children, isEnabled, primaryColor = '#9333EA' }: DraggableBlockProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !isEnabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Make the entire block draggable
  const dragListeners = listeners

  if (!isEnabled) {
    return <div className="preview-block hidden-block">{children}</div>
  }

  // Convert hex to rgba for subtle highlight
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="preview-block relative group w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        {...attributes}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-30 bg-[#1C1C1E] rounded-lg border-2 border-purple-500/50 hover:border-purple-500/80 hover:bg-[#252528] hover:scale-110 shadow-xl pointer-events-none"
        aria-label="Drag handle indicator"
      >
        <GripVertical className="w-5 h-5 text-purple-400" />
      </div>
      <div 
        {...attributes}
        {...dragListeners}
        className="w-full relative rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing select-none"
        style={{
          borderLeft: isDragging 
            ? `3px solid ${hexToRgba(primaryColor, 0.5)}` 
            : isHovered 
            ? `3px solid ${hexToRgba(primaryColor, 0.3)}` 
            : '3px solid transparent',
          backgroundColor: isDragging 
            ? hexToRgba(primaryColor, 0.1) 
            : isHovered 
            ? hexToRgba(primaryColor, 0.05) 
            : 'transparent',
        }}
      >
        {children}
      </div>
    </div>
  )
}

