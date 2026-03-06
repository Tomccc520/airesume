/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.27
 */

'use client'

import React from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  count?: number
  icon?: React.ReactNode
  children?: React.ReactNode
}

/**
 * 章节标题组件 - 优化版本
 * 更简洁清晰的设计，减少视觉噪音
 */
export function SectionHeader({
  title,
  description,
  count,
  icon,
  children
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-sm">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {title}
            {count !== undefined && (
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </h2>
          {description && (
            <p className="text-gray-500 text-sm mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
