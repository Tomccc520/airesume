/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

'use client'

import { Plus } from 'lucide-react'

interface AddCardButtonProps {
  onAdd: () => void
  text: string
}

/**
 * 添加卡片按钮 - 优化版本
 * 更清晰的视觉反馈和交互体验
 */
export function AddCardButton({ onAdd, text }: AddCardButtonProps) {
  return (
    <button
      onClick={onAdd}
      className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-gray-600 hover:text-blue-600 transition-colors group"
      type="button"
    >
      <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
        <Plus className="w-4 h-4" />
      </div>
      <span className="font-medium text-sm">{text}</span>
    </button>
  )
}
