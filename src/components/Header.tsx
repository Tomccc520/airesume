/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Menu, X, Languages, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  id: string
  text: string
  link: string
  label?: string
  labelType?: 'info' | 'shop'
  external?: boolean
  hasSubmenu?: boolean
  submenu?: SubMenuItem[]
  order: number
  visible: boolean
}

interface SubMenuItem {
  id: string
  text: string
  link: string
  external?: boolean
}

/**
 * 全局头部导航组件
 * 提供统一的导航体验和响应式设计
 */
export default function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t, toggleLocale, locale } = useLanguage()
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  /**
   * 导航菜单项配置
   */
  const navItems: NavItem[] = [
    {
      id: 'homepage',
      text: t.header.home,
      link: '',
      hasSubmenu: true,
      submenu: [
        {
          id: 'home-main',
          text: t.header.homeMain,
          link: 'https://www.uied.cn/',
          external: true,
        },
        {
          id: 'home-articles',
          text: t.header.homeArticles,
          link: 'https://www.uied.cn/category/wenzhang',
          external: true,
        },
        {
          id: 'home-materials',
          text: t.header.homeMaterials,
          link: 'https://www.uied.cn/sucai',
          external: true,
        },
        {
          id: 'home-circle',
          text: t.header.homeCircle,
          link: 'https://hot.uied.cn/',
          external: true,
        },
        {
          id: 'home-chat',
          text: t.header.homeChat,
          link: 'https://www.uied.cn/wechat',
          external: true,
        }
      ],
      order: 1,
      visible: true
    },
    {
      id: 'resume',
      text: t.header.resume,
      link: '/editor',
      external: false,
      order: 0,
      visible: true
    },
    {
      id: '3',
      text: t.header.news,
      link: 'https://uiedtool.com/tools/ai-news',
      external: true,
      order: 3,
      visible: true
    },
    {
      id: '4',
      text: t.header.community,
      label: t.header.communityLabel,
      labelType: 'info' as const,
      link: 'https://www.uied.cn/circle',
      external: true,
      order: 4,
      visible: true
    },
    {
      id: '5',
      text: t.header.rank,
      labelType: 'info' as const,
      link: 'https://hot.uied.cn/',
      external: true,
      order: 5,
      visible: true
    },
    {
      id: '6',
      text: t.header.aigc,
      label: t.header.aigcLabel,
      labelType: 'shop' as const,
      link: 'https://www.uied.cn/aigc',
      external: true,
      hasSubmenu: true,
      submenu: [
        {
          id: 'aigc-article',
          text: t.header.aigcArticle,
          link: 'https://www.uied.cn/category/aigc/ai',
          external: true
        },
        {
          id: 'aigc-news',
          text: t.header.aigcNews,
          link: 'https://hot.uied.cn/ai-realtime',
          external: true
        },
        {
          id: 'aigc-tools',
          text: t.header.aigcTools,
          link: 'https://hao.uied.cn/ai',
          external: true
        },
        {
          id: 'aigc-community',
          text: t.header.aigcCommunity,
          link: 'https://www.uied.cn/wechat',
          external: true
        },
        {
          id: 'aigc-wiki',
          text: t.header.aigcWiki,
          link: 'https://dfz3y4k04g.feishu.cn/wiki/ZjddwTFpWivK6ukwBoDc5DoHnVt',
          external: true
        }
      ],
      order: 6,
      visible: true
    },
    {
      id: '7',
      text: t.header.submit,
      link: 'https://www.uied.cn/tougao',
      external: true,
      order: 7,
      visible: true
    },
    {
      id: '8',
      text: t.header.team,
      link: 'https://fsuied.com/',
      external: true,
      order: 8,
      visible: true
    },
    {
      id: '9',
      text: t.header.gpt5,
      label: t.header.gpt5Label,
      labelType: 'info' as const,
      link: 'https://www.wenxiaobai.com/?forceLogin=true&source=uied&ad_source=uied',
      external: true,
      order: 9,
      visible: true
    },
    {
      id: '10',
      text: t.header.tools,
      label: t.header.toolsLabel,
      labelType: 'shop' as const,
      link: 'https://uiedtool.com/',
      external: true,
      order: 10,
      visible: true
    }
  ].sort((a, b) => a.order - b.order)

  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-white/20 shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo区域 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                简历助手
              </span>
            </Link>
          </div>

          {/* 桌面端导航菜单 */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const isExternal = item.external
              const isActive = pathname === item.link
              
              if (item.hasSubmenu) {
                return (
                  <div 
                    key={item.id}
                    className="relative group"
                    onMouseEnter={() => setActiveSubmenu(item.id)}
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    <button
                      className={`relative flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 group-hover:bg-white/60 ${
                        isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span>{item.text}</span>
                      <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-transform duration-200 group-hover:rotate-180" />
                      {item.label && (
                        <span 
                          className={`absolute -top-1 -right-2 px-1.5 py-0.5 text-[10px] leading-none rounded-full font-bold transform scale-75 origin-bottom-left ${
                            item.labelType === 'shop' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {activeSubmenu === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 w-40 pt-2 z-50"
                        >
                          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                            {item.submenu?.map((subItem) => (
                              <Link
                                key={subItem.id}
                                href={subItem.link}
                                target={subItem.external ? '_blank' : undefined}
                                rel={subItem.external ? 'noopener noreferrer' : undefined}
                                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                              >
                                {subItem.text}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              }

              return (
                <Link
                  key={item.id}
                  href={item.link}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className={`relative flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-600 shadow-sm ring-1 ring-indigo-100/50 backdrop-blur-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-sm'
                  }`}
                >
                  <span>{item.text}</span>
                  {item.label && (
                    <span 
                      className={`absolute -top-1 -right-2 px-1.5 py-0.5 text-[10px] leading-none rounded-full font-bold transform scale-75 origin-bottom-left ${
                        item.labelType === 'shop' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* 右侧工具栏 */}
          <div className="flex items-center space-x-4">
            {/* 语言切换按钮 */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Languages size={16} />
              <span>{t.common.language}</span>
            </button>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        <div className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="py-4 border-t border-gray-100/50 space-y-2 bg-white/60 backdrop-blur-xl rounded-b-2xl">
            <nav className="flex flex-col gap-2 px-2">
              {navItems.map((item) => {
                if (item.hasSubmenu) {
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="px-3 py-2 text-sm font-bold text-gray-900 flex items-center justify-between">
                        {item.text}
                        {item.label && (
                          <span 
                            className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                              item.labelType === 'shop' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {item.label}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-2">
                        {item.submenu?.map((subItem) => (
                          <Link
                            key={subItem.id}
                            href={subItem.link}
                            target={subItem.external ? '_blank' : undefined}
                            rel={subItem.external ? 'noopener noreferrer' : undefined}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white/60 transition-colors bg-gray-50/50"
                          >
                            {subItem.text}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-all duration-200"
                  >
                    <span>{item.text}</span>
                    {item.label && (
                      <span 
                        className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                          item.labelType === 'shop' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
