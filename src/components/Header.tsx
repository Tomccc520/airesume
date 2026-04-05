/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-26
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Menu, X, Languages, ChevronDown, Github } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

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
 * 顶部导航组件
 * 保留原有导航文案和链接结构，仅统一视觉样式到首页主风格。
 */
export default function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const { t, toggleLocale, locale } = useLanguage()

  /**
   * 导航菜单项配置
   * 保持既有内容与外链完整不变，仅用于统一渲染结构。
   */
  const navItems: NavItem[] = useMemo(() => {
    return [
      {
        id: 'homepage',
        text: t.header.home,
        link: '',
        hasSubmenu: true,
        submenu: [
          { id: 'home-main', text: t.header.homeMain, link: 'https://www.uied.cn/', external: true },
          { id: 'home-articles', text: t.header.homeArticles, link: 'https://www.uied.cn/category/wenzhang', external: true },
          { id: 'home-materials', text: t.header.homeMaterials, link: 'https://www.uied.cn/sucai', external: true },
          { id: 'home-circle', text: t.header.homeCircle, link: 'https://hot.uied.cn/', external: true },
          { id: 'home-chat', text: t.header.homeChat, link: 'https://www.uied.cn/wechat', external: true }
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
        id: 'updates',
        text: locale === 'zh' ? '更新日志' : 'Updates',
        link: '/updates',
        external: false,
        label: 'NEW',
        labelType: 'info' as const,
        order: 2,
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
          { id: 'aigc-article', text: t.header.aigcArticle, link: 'https://www.uied.cn/category/aigc/ai', external: true },
          { id: 'aigc-news', text: t.header.aigcNews, link: 'https://hot.uied.cn/ai-realtime', external: true },
          { id: 'aigc-tools', text: t.header.aigcTools, link: 'https://hao.uied.cn/ai', external: true },
          { id: 'aigc-community', text: t.header.aigcCommunity, link: 'https://www.uied.cn/wechat', external: true },
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
      { id: '7', text: t.header.submit, link: 'https://www.uied.cn/tougao', external: true, order: 7, visible: true },
      { id: '8', text: t.header.team, link: 'https://fsuied.com/', external: true, order: 8, visible: true },
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
  }, [t, locale])

  /**
   * 标签样式
   * 统一角标视觉，不改变业务含义。
   */
  const getBadgeClass = (labelType?: 'info' | 'shop') => {
    if (labelType === 'shop') {
      return 'bg-rose-100 text-rose-700'
    }
    return 'bg-sky-100 text-sky-700'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <FileText className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-slate-900">{locale === 'zh' ? '简历助手' : 'Resume Builder'}</span>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.link
              const isExternal = item.external

              if (item.hasSubmenu) {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setActiveSubmenu(item.id)}
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    <button
                      className={`relative inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{item.text}</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                      {item.label && (
                        <span
                          className={`absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${getBadgeClass(item.labelType)}`}
                        >
                          {item.label}
                        </span>
                      )}
                    </button>

                    {activeSubmenu === item.id && (
                      <div className="absolute left-0 top-full z-50 w-44 pt-2">
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                          {item.submenu?.map((subItem) => (
                            <Link
                              key={subItem.id}
                              href={subItem.link}
                              target={subItem.external ? '_blank' : undefined}
                              rel={subItem.external ? 'noopener noreferrer' : undefined}
                              className="block px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            >
                              {subItem.text}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.id}
                  href={item.link}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className={`relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{item.text}</span>
                  {item.label && (
                    <span
                      className={`absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${getBadgeClass(item.labelType)}`}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="https://github.com/Tomccc520/uied-resume"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
            >
              <Github className="h-4 w-4" />
              <span>Star</span>
            </Link>

            <button
              onClick={toggleLocale}
              className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
            >
              <Languages className="h-4 w-4" />
              <span>{t.common.language}</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 xl:hidden"
              aria-label="切换菜单"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className={`xl:hidden overflow-hidden transition-all duration-200 ${isMobileMenuOpen ? 'max-h-[680px] pb-3' : 'max-h-0'}`}>
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <nav className="space-y-1">
              {navItems.map((item) => {
                if (item.hasSubmenu) {
                  return (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <div className="mb-2 flex items-center justify-between px-2 py-1 text-sm font-semibold text-slate-900">
                        <span>{item.text}</span>
                        {item.label && (
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${getBadgeClass(item.labelType)}`}>
                            {item.label}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {item.submenu?.map((subItem) => (
                          <Link
                            key={subItem.id}
                            href={subItem.link}
                            target={subItem.external ? '_blank' : undefined}
                            rel={subItem.external ? 'noopener noreferrer' : undefined}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="rounded-md bg-white px-2 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <span>{item.text}</span>
                    {item.label && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${getBadgeClass(item.labelType)}`}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <button
                onClick={toggleLocale}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Languages className="h-4 w-4" />
                <span>{t.common.language}</span>
              </button>
              <Link
                href="https://github.com/Tomccc520/uied-resume"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
