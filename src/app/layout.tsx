/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

import type { Metadata, Viewport } from 'next'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import { ResumeProvider } from '@/contexts/ResumeContext'
import { ToastProvider } from '@/components/Toast'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: 'UIED Resume - 现代化在线简历制作工具',
  description: 'UIED Resume 是一个现代化的在线简历编辑器，支持实时预览、多种模板和导出功能',
  keywords: 'UIED Resume, 简历编辑器, 在线简历, 简历制作, 简历模板',
  authors: [{ name: 'UIED技术团队' }],
  icons: {
    icon: [{ url: '/avatars/img1.png', type: 'image/png' }],
    shortcut: ['/avatars/img1.png'],
    apple: ['/avatars/img1.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

/**
 * 根布局组件
 * 提供全局样式、主题支持和元数据配置
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <ResumeProvider>
              <ToastProvider>
                <div className="min-h-screen bg-white transition-colors duration-300">
                  {children}
                </div>
              </ToastProvider>
            </ResumeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
