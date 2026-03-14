/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion'
import { ChevronDown, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditableCardProps extends Omit<HTMLMotionProps<'div'>, 'title' | 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'ref'> {
  title: string
  subtitle?: string
  isExpanded?: boolean
  defaultExpanded?: boolean
  onToggle?: () => void
  onDelete?: () => void
  hasError?: boolean
  children: React.ReactNode
  dragHandle?: React.ReactNode
}

export function EditableCard({
  title,
  subtitle,
  isExpanded: controlledIsExpanded,
  defaultExpanded = true,
  onToggle: controlledOnToggle,
  onDelete,
  hasError = false,
  children,
  className = '',
  dragHandle,
  ...motionProps
}: EditableCardProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(defaultExpanded)
  
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded
  const handleToggle = controlledOnToggle || (() => setInternalIsExpanded(!isExpanded))

  return (
    <motion.div
      className={`group bg-white rounded-2xl border transition-all ${
        hasError 
          ? 'border-red-300 shadow-sm shadow-red-100' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
      } ${className}`}
      {...motionProps}
    >
      {/* 卡片头部 */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center flex-1 gap-3 overflow-hidden">
          {dragHandle}
          <button
            onClick={handleToggle} 
            className="flex items-center gap-3 flex-1 text-left overflow-hidden"
            type="button"
          >
            <div className={`p-2 rounded-lg transition-all flex-shrink-0 ${
              isExpanded 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
            }`}>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-base">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </button>
        </div>
        
        <div className="flex items-center gap-2 ml-2">
          {hasError && (
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* 卡片内容 */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-6 bg-gray-50/30">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
