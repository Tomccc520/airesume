'use client'

import React from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  count?: number
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function SectionHeader({
  title,
  description,
  count,
  icon,
  children
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-blue-600 border border-blue-100 backdrop-blur-sm">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {title}
            {count !== undefined && (
              <span className="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold 
                             px-2.5 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </h2>
          {description && (
            <p className="text-gray-500 text-sm mt-1 font-medium">{description}</p>
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
