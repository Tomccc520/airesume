/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-26
 */

'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowRight, FileText } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface FooterProps {
  className?: string
}

interface FooterLinkItem {
  label: string
  href: string
  external?: boolean
}

interface FooterLinkGroup {
  key: string
  title: string
  links: FooterLinkItem[]
}

/**
 * 全局底部页脚组件
 * 保留原有文案与链接内容，统一成更轻量的招聘工具风格排版。
 */
export default function Footer({ className = '' }: FooterProps) {
  const { t, locale } = useLanguage()

  /**
   * 工具快捷入口配置
   * 保留原有入口列表，仅做结构化渲染。
   */
  const quickToolGroups = useMemo<FooterLinkGroup[]>(() => {
    return [
      {
        key: 'image',
        title: t.footer.image,
        links: [
          { label: t.footer.tools.imageCompress, href: '/tools/image-compress' },
          { label: t.footer.tools.qrcode, href: '/tools/qrcode' },
          { label: t.footer.tools.imgCut, href: '/tools/img-cut' },
          { label: t.footer.tools.signImage, href: '/tools/signimage' },
          { label: t.footer.tools.gifCompress, href: '/tools/gif-compress' }
        ]
      },
      {
        key: 'pdf',
        title: t.footer.pdf,
        links: [
          { label: t.footer.tools.imgToPdf, href: '/tools/img-to-pdf' },
          { label: t.footer.tools.pdfToImages, href: '/tools/pdf-to-images' },
          { label: t.footer.tools.pdfMerge, href: '/tools/pdf-merge' },
          { label: t.footer.tools.pdfSplit, href: '/tools/pdf-split' }
        ]
      },
      {
        key: 'text',
        title: t.footer.text,
        links: [
          { label: t.footer.tools.diff, href: '/tools/diff' },
          { label: t.footer.tools.markdown, href: '/tools/markdown' },
          { label: t.footer.tools.wordCount, href: '/tools/wordcount' }
        ]
      },
      {
        key: 'dev',
        title: t.footer.dev,
        links: [
          { label: t.footer.tools.json, href: '/tools/json' },
          { label: t.footer.tools.reg, href: '/tools/reg' },
          { label: t.footer.tools.timestamp, href: '/tools/timetran' }
        ]
      },
      {
        key: 'copywriting',
        title: t.footer.copywriting,
        links: [
          { label: t.footer.tools.kfc, href: '/tools/copywriting/kfc' },
          { label: t.footer.tools.poem, href: '/tools/copywriting/daily-poem' },
          { label: t.footer.tools.dogDiary, href: '/tools/copywriting/dog-diary' },
          { label: t.footer.tools.moments, href: '/tools/copywriting/moments' }
        ]
      }
    ]
  }, [t])

  /**
   * 友情链接配置
   * 保留 AI/设计/其他 三组外链。
   */
  const friendLinkGroups = useMemo<FooterLinkGroup[]>(() => {
    return [
      {
        key: 'ai',
        title: t.footer.ai,
        links: [
          { label: t.footer.links.aiArticle, href: 'https://www.uied.cn/category/aigc/ai', external: true },
          { label: t.footer.links.aiNews, href: 'https://hot.uied.cn/ai-realtime', external: true },
          { label: t.footer.links.aiTools, href: 'https://hao.uied.cn/ai', external: true },
          { label: t.footer.links.aiChat, href: 'https://www.uied.cn/wechat', external: true }
        ]
      },
      {
        key: 'design',
        title: t.footer.design,
        links: [
          { label: t.footer.links.designArticle, href: 'https://www.uied.cn/category/wenzhang/ui-wenzhang', external: true },
          { label: t.footer.links.designNav, href: 'https://hao.uied.cn/', external: true },
          { label: t.footer.links.designTools, href: 'https://uiedtool.com/', external: true },
          { label: t.footer.links.designNews, href: 'https://hot.uied.cn/', external: true }
        ]
      },
      {
        key: 'other',
        title: t.footer.other,
        links: [
          { label: t.footer.links.aigcLearn, href: 'https://uied.cn', external: true },
          { label: t.footer.links.uiedTeam, href: 'https://fsuied.com', external: true },
          { label: t.footer.links.baibaiNav, href: 'https://www.88sheji.cn/', external: true },
          { label: t.footer.links.tomda, href: 'https://www.tomda.top/', external: true },
          { label: t.footer.links.applyLink, href: 'https://fsuied.com/contact.html', external: true }
        ]
      }
    ]
  }, [t])

  /**
   * 官方媒体配置
   * 保留知乎/小红书/微博/B站入口。
   */
  const mediaLinks: FooterLinkItem[] = useMemo(() => {
    return [
      { label: '知乎', href: 'https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi', external: true },
      { label: '小红书', href: 'https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83', external: true },
      { label: '微博', href: 'https://weibo.com/u/7542146005', external: true },
      { label: 'B站', href: 'https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0', external: true }
    ]
  }, [])

  /**
   * 链接渲染器
   * 统一处理内部/外部链接样式与跳转属性。
   */
  const renderLink = (link: FooterLinkItem, className: string) => {
    if (link.external) {
      return (
        <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
          {link.label}
        </a>
      )
    }
    return (
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    )
  }

  return (
    <footer className={`mt-auto border-t border-slate-200 bg-slate-50/70 ${className}`} role="contentinfo" aria-label="页面底部">
      <div className="app-shell-container py-8 sm:py-10">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="app-shell-brand-mark h-10 w-10 shrink-0">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <div className="text-lg font-semibold text-slate-900">UIED-Tools</div>
              <p className="mt-1 text-sm text-slate-500">AI Resume & Tools Platform</p>
              <p className="mt-1 text-xs leading-6 text-slate-500">
                {locale === 'en'
                  ? 'Resume editing, AI polishing, export delivery, and practical tools in one workspace.'
                  : '将简历编辑、AI 润色、导出投递与常用工具收在同一套工作台里。'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="app-shell-action-button">
              <span>{locale === 'en' ? 'Home' : '返回首页'}</span>
            </Link>
            <Link href="/editor" className="app-shell-action-button">
              <span>{locale === 'en' ? 'Open Editor' : '进入编辑器'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="app-shell-toolbar-surface p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900">{t.footer.quickTools}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {locale === 'en'
                  ? 'Keep tool links compact and scannable.'
                  : '保留工具入口，但降低视觉噪音，方便快速扫读。'}
              </p>
            </div>
            <div className="space-y-3">
              {quickToolGroups.map((group) => (
                <div key={group.key} className="flex flex-col gap-2 border-t border-slate-100 pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-start">
                  <span className="w-16 shrink-0 text-[11px] font-semibold tracking-[0.04em] text-slate-500">{group.title}</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-2">
                    {group.links.map((link) => (
                      <span key={link.label}>
                        {renderLink(link, 'text-sm text-slate-600 transition-colors hover:text-slate-900')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="app-shell-toolbar-surface p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900">{t.footer.friendLinks}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {locale === 'en'
                  ? 'External resources and communities stay unchanged.'
                  : '友情链接与社区入口保持原样，仅统一排版密度。'}
              </p>
            </div>
            <div className="space-y-3">
              {friendLinkGroups.map((group) => (
                <div key={group.key} className="flex flex-col gap-2 border-t border-slate-100 pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-start">
                  <span className="w-16 shrink-0 text-[11px] font-semibold tracking-[0.04em] text-slate-500">{group.title}</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-2">
                    {group.links.map((link) => (
                      <span key={link.label}>
                        {renderLink(link, 'text-sm text-slate-600 transition-colors hover:text-slate-900')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <h3 className="mb-2 text-xs font-semibold text-slate-500">{t.footer.officialMedia}</h3>
              <div className="flex flex-wrap gap-2">
                {mediaLinks.map((link) => (
                  <span key={link.label}>
                    {renderLink(link, 'inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900')}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1">
                <span className="font-medium text-slate-700">UIED-Tools</span>
                <span>是由</span>
                <a href="https://fsuied.com" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-slate-900">
                  UIED技术团队
                </a>
                <span>设计开发的在线工具平台</span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span>{t.footer.techSupport}</span>
                <a href="https://www.tomda.top/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">
                  Tomda
                </a>
                <span>&</span>
                <a href="https://fsuied.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">
                  UIED技术团队
                </a>
              </div>
            </div>

            <div className="space-y-1 text-left sm:text-right">
              <div>{t.footer.copyright}</div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">
                  粤ICP备2022056875号
                </a>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">
                  {t.footer.sitemap}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
