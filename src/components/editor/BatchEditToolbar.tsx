/**
 * @file components/editor/BatchEditToolbar.tsx
 * @description 批量编辑工具栏组件，支持批量删除、移动、复制操作
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  X, 
  CheckSquare 
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export interface BatchEditToolbarProps {
  /** 选中的条目数量 */
  selectedCount: number
  /** 批量删除回调 */
  onBatchDelete: () => void
  /** 批量移动回调 */
  onBatchMove: (direction: 'up' | 'down') => void
  /** 批量复制回调 */
  onBatchCopy: () => void
  /** 取消选择回调 */
  onClearSelection: () => void
  /** 全选回调 */
  onSelectAll: () => void
  /** 是否可以向上移动 */
  canMoveUp?: boolean
  /** 是否可以向下移动 */
  canMoveDown?: boolean
}

export function BatchEditToolbar({
  selectedCount,
  onBatchDelete,
  onBatchMove,
  onBatchCopy,
  onClearSelection,
  onSelectAll,
  canMoveUp = true,
  canMoveDown = true
}: BatchEditToolbarProps) {
  const { locale } = useLanguage()
  
  const t = {
    selected: locale === 'zh' ? '已选择' : 'Selected',
    items: locale === 'zh' ? '项' : 'items',
    selectAll: locale === 'zh' ? '全选' : 'Select All',
    clearSelection: locale === 'zh' ? '取消选择' : 'Clear',
    delete: locale === 'zh' ? '删除' : 'Delete',
    moveUp: locale === 'zh' ? '上移' : 'Move Up',
    moveDown: locale === 'zh' ? '下移' : 'Move Down',
    copy: locale === 'zh' ? '复制' : 'Copy'
  }

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
            {/* 选中数量 */}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 px-2">
              {t.selected} {selectedCount} {t.items}
            </span>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* 全选按钮 */}
            <button
              onClick={onSelectAll}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title={t.selectAll}
            >
              <CheckSquare className="w-4 h-4" />
            </button>

            {/* 取消选择按钮 */}
            <button
              onClick={onClearSelection}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title={t.clearSelection}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* 上移按钮 */}
            <button
              onClick={() => onBatchMove('up')}
              disabled={!canMoveUp}
              className={`p-2 rounded-full transition-colors ${
                canMoveUp
                  ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title={t.moveUp}
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* 下移按钮 */}
            <button
              onClick={() => onBatchMove('down')}
              disabled={!canMoveDown}
              className={`p-2 rounded-full transition-colors ${
                canMoveDown
                  ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title={t.moveDown}
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* 复制按钮 */}
            <button
              onClick={onBatchCopy}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title={t.copy}
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* 删除按钮 */}
            <button
              onClick={onBatchDelete}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
              title={t.delete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BatchEditToolbar
