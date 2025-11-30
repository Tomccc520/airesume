/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

'use client'

import React from 'react'
import { ThemeContext, useThemeState } from '@/hooks/useTheme'

interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * 主题提供者组件
 * 为整个应用提供主题上下文，支持暗黑模式切换
 * @param children - 子组件
 */
const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeState = useThemeState()

  // 在客户端渲染之前显示加载状态，避免主题闪烁
  if (!themeState.mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider