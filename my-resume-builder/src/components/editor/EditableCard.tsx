'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion'
import { ChevronDown, ChevronUp, Trash2, AlertCircle } from 'lucide-react'

interface EditableCardProps extends Omit<HTMLMotionProps<'div'>, 'title' | 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'ref'> {
  title: string
  subtitle?: string
  isExpanded?: boolean
  defaultExpanded?: boolean
  onToggle?: () => void
  onDelete?: () => void
  hasError?: boolean
  children: React.ReactNode
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
  ...motionProps
}: EditableCardProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(defaultExpanded)
  
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded
  const handleToggle = controlledOnToggle || (() => setInternalIsExpanded(!isExpanded))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-300 ${
        hasError 
          ? 'border border-red-500/50 ring-1 ring-red-500/20' 
          : 'border border-gray-200/60 hover:border-blue-500/50 hover:bg-white/80'
      } ${className}`}
      {...motionProps}
    >
      {/* 卡片头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100/60">
        <motion.button 
          whileTap={{ scale: 0.99 }}
          onClick={handleToggle} 
          className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
          type="button"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
            className="p-1.5 rounded-md bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </motion.div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </motion.button>
        
        <div className="flex items-center gap-2">
          {hasError && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center"
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
            </motion.div>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
      
      {/* 卡片内容 */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: 'auto', 
              opacity: 1,
              transition: {
                height: { duration: 0.3, ease: 'easeInOut' },
                opacity: { duration: 0.2, delay: 0.1 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.3, ease: 'easeInOut' },
                opacity: { duration: 0.2 }
              }
            }}
            className="overflow-hidden"
          >
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
