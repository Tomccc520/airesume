/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-14
 */

'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUp,
  Bot,
  Building2,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  Github,
  GraduationCap,
  LayoutTemplate,
  Shield,
  Sparkles,
  Star,
  Target,
  Wand2,
  Workflow,
  Zap
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollFadeIn, { StaggerFadeIn } from '@/components/ScrollFadeIn'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * 模板展示卡片
 * 使用统一结构渲染模板卖点，保持样式一致
 */
function TemplateShowcaseCard({
  title,
  desc,
  tags,
  gradient
}: {
  title: string
  desc: string
  tags: string[]
  gradient: string
}) {
  return (
    <motion.article className="group border-t border-slate-300 pt-5">
      <div className="mb-5 overflow-hidden rounded-[22px] border border-slate-200 bg-[#eef1f6] p-5">
        <div className="resume-paper-shadow mx-auto aspect-[0.72] max-w-[220px] overflow-hidden rounded-sm bg-white p-4">
          <div className={`h-1.5 w-12 rounded-full ${gradient}`} />
          <div className="mt-3 h-2.5 w-20 rounded-full bg-slate-900" />
          <div className="mt-1.5 h-1.5 w-28 rounded-full bg-slate-300" />
          <div className="mt-5 grid grid-cols-[0.34fr,0.66fr] gap-3">
            <div className="space-y-3 border-r border-slate-200 pr-3">
              <div className="h-1.5 w-8 rounded-full bg-slate-400" />
              <div className="space-y-1.5">
                <div className="h-1 rounded-full bg-slate-200" />
                <div className="h-1 rounded-full bg-slate-200" />
                <div className="h-1 w-4/5 rounded-full bg-slate-200" />
              </div>
              <div className="h-1.5 w-10 rounded-full bg-slate-400" />
              <div className="grid grid-cols-2 gap-1">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="h-3 rounded bg-slate-100" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[0, 1, 2].map((item) => (
                <div key={item}>
                  <div className="h-1.5 w-16 rounded-full bg-slate-500" />
                  <div className="mt-2 space-y-1.5">
                    <div className="h-1 rounded-full bg-slate-200" />
                    <div className="h-1 rounded-full bg-slate-200" />
                    <div className="h-1 w-5/6 rounded-full bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
        {tags.map((tag, index) => (
          <React.Fragment key={tag}>
            {index > 0 && <span className="text-slate-300">/</span>}
            <span>{tag}</span>
          </React.Fragment>
        ))}
      </div>
    </motion.article>
  )
}

/**
 * 首页章节标题组件
 * 统一首页功能区的标题层级、说明文案与操作按钮密度。
 */
function HomeSectionHeader({
  badge,
  icon,
  title,
  desc,
  align = 'left',
  actions
}: {
  badge: string
  icon: React.ReactNode
  title: string
  desc: string
  align?: 'left' | 'center'
  actions?: React.ReactNode
}) {
  const isCenter = align === 'center'

  return (
    <div className={`flex flex-col gap-4 ${isCenter ? 'items-center text-center' : 'lg:flex-row lg:items-end lg:justify-between'}`}>
      <div className={isCenter ? 'max-w-3xl' : 'max-w-3xl'}>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#2554ff]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2554ff]/10">{icon}</span>
          <span>{badge}</span>
        </div>
        <h2 className="mt-4 text-[30px] font-semibold tracking-tight text-slate-900 sm:text-[36px]">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{desc}</p>
      </div>
      {actions && (
        <div className={`flex flex-wrap gap-2 ${isCenter ? 'justify-center' : 'lg:justify-end'}`}>
          {actions}
        </div>
      )}
    </div>
  )
}

/**
 * 首页能力卡片组件
 * 将功能区卡片统一成更像招聘工具工作台的紧凑信息结构。
 */
function HomeFeatureCard({
  icon,
  title,
  desc,
  highlights,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  highlights: string[]
}) {
  return (
    <article className="border-t border-slate-300 pt-5">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2554ff]/10 text-[#2554ff]">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
      <ul className="mt-4 space-y-2 text-[13px] leading-6 text-slate-500">
        {highlights.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

/**
 * 首页指标卡片组件
 * 统一首屏统计信息块的密度与数字层级。
 */
function HeroMetricCard({
  value,
  label
}: {
  value: string
  label: string
}) {
  return (
    <div className="border-l border-slate-300 pl-4 first:border-l-0 first:pl-0">
      <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
    </div>
  )
}

/**
 * 首页辅助标签组件
 * 统一首屏与底部 CTA 中的能力提示标签，保持同一套信息密度。
 */
function HeroSupportPill({
  icon,
  label,
  dark = false
}: {
  icon: React.ReactNode
  label: string
  dark?: boolean
}) {
  return (
    <span
      className={
        dark
          ? 'inline-flex items-center gap-2 text-xs font-medium text-white/80'
          : 'inline-flex items-center gap-2 text-xs font-medium text-slate-600'
      }
    >
      {icon}
      {label}
    </span>
  )
}

type HomeEditorEntry = 'campus' | 'engineering' | 'product' | 'general'
type HomeEditorFocus = 'personal' | 'experience' | 'education' | 'skills' | 'projects'
type HomeEditorPanel = 'template' | 'ai'
type HomeEditorAISection = 'summary' | 'experience' | 'education' | 'skills' | 'projects'

interface EditorEntryHrefOptions {
  entry?: HomeEditorEntry
  focus?: HomeEditorFocus
  panel?: HomeEditorPanel
  template?: string
  aiSection?: HomeEditorAISection
}

/**
 * 构建首页到编辑器的入口链接
 * 用统一函数生成场景化跳转参数，避免页面里散落手写 query 字符串。
 */
function buildEditorEntryHref({
  entry,
  focus,
  panel,
  template,
  aiSection
}: EditorEntryHrefOptions = {}) {
  const params = new URLSearchParams()

  if (entry) {
    params.set('entry', entry)
  }
  if (focus) {
    params.set('focus', focus)
  }
  if (panel) {
    params.set('panel', panel)
  }
  if (template) {
    params.set('template', template)
  }
  if (aiSection) {
    params.set('aiSection', aiSection)
  }

  const queryString = params.toString()
  return queryString ? `/editor?${queryString}` : '/editor'
}

/**
 * 首页首屏简历预览组件
 * 用更接近真实投递简历的缩略图替换占位示意卡，强化招聘工具感知。
 */
function HeroResumePreview({ locale }: { locale: string }) {
  const isEn = locale === 'en'
  const summaryPoints = isEn
    ? ['5 years in web product delivery', 'ATS-first resume structure', 'AI rewrite and export ready']
    : ['5年 Web 产品交付经验', 'ATS 优先的简历结构', '支持 AI 润色与导出投递']
  const experiencePoints = isEn
    ? ['Led design system upgrade and reduced delivery time by 32%', 'Built resume workflow with AI assistance and export fallback']
    : ['主导设计系统升级，需求交付周期缩短 32%', '搭建 AI 协作简历工作流，补齐导出与配置闭环']
  const projectPoints = isEn
    ? ['Refined three hiring-ready templates', 'Added JD match and content quality checks']
    : ['精修 3 套招聘投递模板', '加入 JD 匹配与内容质量检查']
  const skillGroups = isEn
    ? ['React / Next.js', 'TypeScript', 'Design Systems', 'Prompt UX']
    : ['React / Next.js', 'TypeScript', '设计系统', 'Prompt UX']
  const headerMeta = isEn
    ? ['Shanghai', 'resume@uied.dev', 'portfolio / GitHub']
    : ['上海', 'resume@uied.dev', '作品集 / GitHub']
  const insightTitle = isEn ? 'AI delivery review' : 'AI 投递检查'
  const insightItems = isEn
    ? [
        { label: 'ATS', value: '98%' },
        { label: 'Readability', value: '94%' },
        { label: 'Keyword Fit', value: '91%' }
      ]
    : [
        { label: 'ATS', value: '98%' },
        { label: '可读性', value: '94%' },
        { label: '关键词匹配', value: '91%' }
      ]

  return (
    <div className="relative mx-auto w-full max-w-[560px] pb-8 pt-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: 1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="resume-paper-shadow relative overflow-hidden rounded-[6px] border border-slate-200 bg-white"
      >
        <div className="h-2 bg-[#2554ff]" />
        <div className="p-6 sm:p-8">
          <header className="border-b border-slate-200 pb-5">
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                  {isEn ? 'Tomda Chen' : 'Tomda 陈'}
                </div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2554ff]">
                  {isEn ? 'Product Designer / Frontend Lead' : '产品设计师 / 前端负责人'}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                TC
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
              {headerMeta.map((item) => <span key={item}>{item}</span>)}
            </div>
          </header>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_130px] gap-6">
            <main className="space-y-5">
              <section>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {isEn ? 'Profile' : '个人摘要'}
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-600">{summaryPoints.join(' · ')}</p>
              </section>

              <section>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {isEn ? 'Experience' : '工作经历'}
                </div>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {isEn ? 'Resume Product Lead' : '简历产品负责人'}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-500">UIED Resume</div>
                  </div>
                  <div className="text-[10px] font-medium text-slate-400">2023 — Now</div>
                </div>
                <div className="mt-2 space-y-1.5">
                  {experiencePoints.map((item) => (
                    <div key={item} className="flex gap-2 text-[11px] leading-5 text-slate-600">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#2554ff]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {isEn ? 'Selected Projects' : '项目经验'}
                </div>
                <div className="mt-2 space-y-2">
                  {projectPoints.map((item) => (
                    <div key={item} className="border-l-2 border-slate-200 pl-3 text-[11px] leading-5 text-slate-600">
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <aside className="border-l border-slate-200 pl-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {isEn ? 'Core Skills' : '核心技能'}
              </div>
              <div className="mt-3 space-y-2 text-[10px] font-medium text-slate-600">
                {skillGroups.map((item) => (
                  <div key={item} className="border-b border-slate-100 pb-2">{item}</div>
                ))}
              </div>

              <div className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {insightTitle}
              </div>
              <div className="mt-3 space-y-3">
                {insightItems.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-800">{item.value}</span>
                    </div>
                    <div className="mt-1 h-1 bg-slate-100">
                      <div className="h-full bg-[#2554ff]" style={{ width: item.value }} />
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
        className="absolute -bottom-1 right-0 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-white sm:right-[-18px]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2554ff]">
          <Bot className="h-4 w-4" />
        </span>
        <div>
          <div className="text-xs font-semibold">{isEn ? 'Ready to apply' : '已具备投递条件'}</div>
          <div className="mt-0.5 text-[10px] text-white/60">{isEn ? 'AI review passed 3/3' : 'AI 检查通过 3/3'}</div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * 首页
 * 重构为“模板展示 + AI能力 + 工作流”三段式落地页
 */
export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { t, locale } = useLanguage()

  /**
   * 监听滚动位置
   * 控制右下角返回顶部按钮显隐
   */
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      window.requestAnimationFrame(() => {
        setShowScrollTop(window.scrollY > 520)
        ticking = false
      })
      ticking = true
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /**
   * 模板展示数据
   * 根据语言环境提供简短可读的模板定位文案
   */
  const templateHighlights = useMemo(() => {
    if (locale === 'en') {
      return [
        {
          title: 'Metro Sidebar',
          desc: 'A strong two-column hierarchy for recruiters who scan quickly.',
          tags: ['Two Column', 'ATS Friendly', 'Modern'],
          gradient: 'bg-[#2554ff]'
        },
        {
          title: 'Editorial Center',
          desc: 'Serif-led one-column structure for elegant storytelling resumes.',
          tags: ['One Column', 'Premium Tone', 'Readable'],
          gradient: 'bg-slate-900'
        },
        {
          title: 'Creative Cards',
          desc: 'Modular blocks for portfolios, project-heavy and product roles.',
          tags: ['Card Layout', 'Visual', 'Project First'],
          gradient: 'bg-[#2554ff]/55'
        }
      ]
    }

    return [
      {
        title: '都会侧栏',
        desc: '深色侧栏 + 明亮内容区，适合招聘方快速扫描关键经历。',
        tags: ['双栏', 'ATS友好', '现代感'],
        gradient: 'bg-[#2554ff]'
      },
      {
        title: '叙事居中',
        desc: '衬线排版单栏结构，兼顾专业感与阅读舒适度。',
        tags: ['单栏', '高级感', '可读性'],
        gradient: 'bg-slate-900'
      },
      {
        title: '创意卡片',
        desc: '模块化信息块，适合项目驱动型岗位与作品导向型候选人。',
        tags: ['卡片', '视觉化', '项目优先'],
        gradient: 'bg-[#2554ff]/55'
      }
    ]
  }, [locale])

  /**
   * 招聘场景入口
   * 提供面向真实投递场景的快捷入口，帮助用户直接进入对应编辑路径。
   */
  const workflowEntries = useMemo(() => {
    if (locale === 'en') {
      return [
        {
          title: 'Campus Application',
          desc: 'Start from education and projects, then complete skills and summary.',
          href: buildEditorEntryHref({ entry: 'campus', focus: 'education', template: 'banner-layout' }),
          icon: GraduationCap
        },
        {
          title: 'Engineering Role',
          desc: 'Jump to experience and skills first, keep technical highlights concise.',
          href: buildEditorEntryHref({
            entry: 'engineering',
            focus: 'experience',
            panel: 'ai',
            aiSection: 'experience',
            template: 'banner-layout'
          }),
          icon: Workflow
        },
        {
          title: 'Product / Operation',
          desc: 'Build project impact first, then polish wording with AI panel.',
          href: buildEditorEntryHref({
            entry: 'product',
            focus: 'projects',
            panel: 'ai',
            aiSection: 'projects',
            template: 'card-layout-executive'
          }),
          icon: Target
        },
        {
          title: 'Universal Delivery',
          desc: 'Open template panel directly and choose ATS-friendly layout first.',
          href: buildEditorEntryHref({
            entry: 'general',
            panel: 'template',
            template: 'banner-layout'
          }),
          icon: Building2
        }
      ]
    }

    return [
      {
        title: '校招应届投递',
        desc: '优先完善教育、项目与技能模块，再补个人总结。',
        href: buildEditorEntryHref({ entry: 'campus', focus: 'education', template: 'banner-layout' }),
        icon: GraduationCap
      },
      {
        title: '技术岗社招',
        desc: '先写工作经历与核心技能，突出复杂项目与性能指标。',
        href: buildEditorEntryHref({
          entry: 'engineering',
          focus: 'experience',
          panel: 'ai',
          aiSection: 'experience',
          template: 'banner-layout'
        }),
        icon: Workflow
      },
      {
        title: '产品/运营岗位',
        desc: '先整理项目成果，再打开 AI 面板打磨表达与关键词。',
        href: buildEditorEntryHref({
          entry: 'product',
          focus: 'projects',
          panel: 'ai',
          aiSection: 'projects',
          template: 'card-layout-executive'
        }),
        icon: Target
      },
      {
        title: '通用模板起步',
        desc: '直接打开模板面板，先定 ATS 友好的版式再填内容。',
        href: buildEditorEntryHref({
          entry: 'general',
          panel: 'template',
          template: 'banner-layout'
        }),
        icon: Building2
      }
    ]
  }, [locale])

  /**
   * 返回顶部
   * 用平滑滚动提升页面交互体验
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <Header />

      <main>
        <section className="resume-grid-surface resume-hero-glow relative flex min-h-[calc(100svh-68px)] items-center overflow-hidden border-b border-slate-300 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr,1.08fr]">
            <ScrollFadeIn direction="up">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2554ff]">
                  <span className="h-2 w-2 rounded-full bg-[#2554ff]" />
                  UIED Resume · {locale === 'en' ? 'Open Source' : '开源项目'}
                </div>
                <h1 className="mt-6 text-[42px] font-semibold leading-[1.08] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[72px]">
                  {locale === 'en' ? (
                    <>Turn real work into a resume worth sending.</>
                  ) : (
                    <>把真实经历，<br />整理成一份敢投的简历。</>
                  )}
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-slate-600 lg:mx-0 lg:text-lg">
                  {locale === 'en'
                    ? 'A local-first AI resume workspace for writing, matching, previewing and exporting one hiring-ready document.'
                    : '一个本地优先的 AI 简历工作台，把内容编辑、JD 匹配、实时预览与导出投递放在同一条路径里。'}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 lg:justify-start">
                  <HeroSupportPill
                    icon={<CheckCircle2 className="h-3.5 w-3.5 text-[#2554ff]" />}
                    label={locale === 'en' ? 'Hiring-ready templates' : '招聘投递模板'}
                  />
                  <HeroSupportPill
                    icon={<CheckCircle2 className="h-3.5 w-3.5 text-[#2554ff]" />}
                    label={locale === 'en' ? 'AI rewrite with review' : 'AI 润色可对比'}
                  />
                  <HeroSupportPill
                    icon={<CheckCircle2 className="h-3.5 w-3.5 text-[#2554ff]" />}
                    label={locale === 'en' ? 'Local data ownership' : '本地数据自主'}
                  />
                </div>

                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <Link
                    href={buildEditorEntryHref({ entry: 'general', focus: 'personal', template: 'banner-layout' })}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2554ff] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1745e8]"
                  >
                    {t.home.hero.start}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="https://github.com/Tomccc520/airesume"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-6 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-white"
                  >
                    <Github className="h-4 w-4" />
                    {locale === 'en' ? 'View on GitHub' : 'GitHub 开源仓库'}
                  </Link>
                </div>

                <div className="mt-9 grid grid-cols-3 gap-4 border-t border-slate-300 pt-6">
                  <HeroMetricCard
                    value="5"
                    label={locale === 'en' ? 'Core Templates' : '核心模板'}
                  />
                  <HeroMetricCard
                    value="3"
                    label={locale === 'en' ? 'AI Workflows' : 'AI 工作流'}
                  />
                  <HeroMetricCard
                    value={locale === 'en' ? 'Local' : '本地'}
                    label={locale === 'en' ? 'Browser-first Storage' : '浏览器优先存储'}
                  />
                </div>
              </div>
            </ScrollFadeIn>

            <ScrollFadeIn direction="up">
              <HeroResumePreview locale={locale} />
            </ScrollFadeIn>
          </div>
        </section>

        <section className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto w-full max-w-7xl">
            <ScrollFadeIn direction="up">
              <div className="mb-6">
                <HomeSectionHeader
                  badge={locale === 'en' ? 'Quick Start Paths' : '快速开始路径'}
                  icon={<Workflow className="h-3.5 w-3.5" />}
                  title={locale === 'en' ? 'Start by Hiring Scenario' : '按投递场景快速开始'}
                  desc={locale === 'en'
                    ? 'Choose one entry and land directly on the right editing path.'
                    : '从真实招聘流程出发，直接进入对应模块，减少无效点击。'}
                  actions={
                    <>
                      <Link
                        href={buildEditorEntryHref({
                          entry: 'general',
                          focus: 'personal',
                          template: 'banner-layout'
                        })}
                        className="app-shell-action-button"
                      >
                        <span>{locale === 'en' ? 'Open Editor' : '打开编辑器'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href={buildEditorEntryHref({
                          entry: 'general',
                          panel: 'template',
                          template: 'banner-layout'
                        })}
                        className="app-shell-action-button"
                      >
                        <span>{locale === 'en' ? 'Pick Template' : '选择模板'}</span>
                      </Link>
                    </>
                  }
                />
              </div>
            </ScrollFadeIn>

            <StaggerFadeIn className="grid overflow-hidden border-y border-slate-300 md:grid-cols-2 xl:grid-cols-4" staggerDelay={0.08} direction="up">
              {workflowEntries.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group border-b border-slate-200 p-5 transition-colors hover:bg-slate-50 md:border-r xl:border-b-0 [&:last-child]:border-r-0"
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2554ff]/10 text-[#2554ff]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#2554ff]">
                      {locale === 'en' ? 'Open editor' : '进入编辑器'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                )
              })}
            </StaggerFadeIn>
          </div>
        </section>

        <section id="template-showcase" className="resume-grid-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <ScrollFadeIn direction="up">
              <div className="mb-10">
                <HomeSectionHeader
                  align="center"
                  badge={locale === 'en' ? 'Template Library' : '模板库升级'}
                  icon={<LayoutTemplate className="h-3.5 w-3.5" />}
                  title={locale === 'en' ? 'Not Generic Templates, But Hiring-Focused Layouts' : '不是“套模板”，而是面向招聘筛选的版式'}
                  desc={locale === 'en'
                    ? 'Each template now has a stronger hierarchy, clearer section rhythm, and faster readability for HR and ATS systems.'
                    : '每套模板都强调信息层级、章节节奏和快速可扫读性，让 HR 与 ATS 都更容易抓到你的关键价值。'}
                />
              </div>
            </ScrollFadeIn>

            <StaggerFadeIn className="grid gap-5 md:grid-cols-3" staggerDelay={0.1} direction="up">
              {templateHighlights.map((template) => (
                <TemplateShowcaseCard
                  key={template.title}
                  title={template.title}
                  desc={template.desc}
                  tags={template.tags}
                  gradient={template.gradient}
                />
              ))}
            </StaggerFadeIn>
          </div>
        </section>

        <section id="features" className="border-y border-slate-300 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <ScrollFadeIn direction="up">
              <div className="mb-10">
                <HomeSectionHeader
                  badge={locale === 'en' ? 'Core Workspace' : '核心工作台能力'}
                  icon={<Target className="h-3.5 w-3.5" />}
                  title={t.home.features.title}
                  desc={t.home.features.desc}
                  actions={
                    <>
                      <Link
                        href={buildEditorEntryHref({
                          entry: 'engineering',
                          panel: 'ai',
                          aiSection: 'experience',
                          template: 'banner-layout'
                        })}
                        className="app-shell-action-button"
                      >
                        <Bot className="h-4 w-4" />
                        <span>{locale === 'en' ? 'Open AI Panel' : '打开 AI 面板'}</span>
                      </Link>
                      <Link
                        href={buildEditorEntryHref({
                          entry: 'general',
                          panel: 'template',
                          template: 'banner-layout'
                        })}
                        className="app-shell-action-button"
                      >
                        <LayoutTemplate className="h-4 w-4" />
                        <span>{locale === 'en' ? 'Browse Templates' : '查看模板'}</span>
                      </Link>
                    </>
                  }
                />
              </div>
            </ScrollFadeIn>

            <StaggerFadeIn className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" staggerDelay={0.08} direction="up">
              <HomeFeatureCard
                icon={<Bot className="h-4 w-4" />}
                title={t.home.features.ai.title}
                desc={t.home.features.ai.desc}
                highlights={[t.home.features.ai.list1, t.home.features.ai.list2]}
              />

              <HomeFeatureCard
                icon={<Zap className="h-4 w-4" />}
                title={t.home.features.realtime.title}
                desc={t.home.features.realtime.desc}
                highlights={[t.home.features.realtime.list1, t.home.features.realtime.list2]}
              />

              <HomeFeatureCard
                icon={<FileCheck2 className="h-4 w-4" />}
                title={t.home.features.export.title}
                desc={t.home.features.export.desc}
                highlights={[t.home.features.export.list1, t.home.features.export.list2]}
              />

              <HomeFeatureCard
                icon={<Shield className="h-4 w-4" />}
                title={t.home.features.privacy.title}
                desc={t.home.features.privacy.desc}
                highlights={[t.home.features.privacy.list1, t.home.features.privacy.list2]}
              />
            </StaggerFadeIn>
          </div>
        </section>

        <section className="resume-grid-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-6xl">
            <ScrollFadeIn direction="up">
              <div className="mb-10">
                <HomeSectionHeader
                  align="center"
                  badge={locale === 'en' ? 'Editing Workflow' : '编辑工作流'}
                  icon={<Workflow className="h-3.5 w-3.5" />}
                  title={locale === 'en' ? 'Three-Step Editing Workflow' : '三步完成高质量简历编辑'}
                  desc={locale === 'en'
                    ? 'Designed for speed and quality: structure first, language next, then export.'
                    : '先结构、再语言、后导出。减少来回返工，把编辑节奏固定下来。'}
                />
              </div>
            </ScrollFadeIn>

            <StaggerFadeIn className="grid gap-4 md:grid-cols-3" staggerDelay={0.1} direction="up">
              {[
                {
                  title: locale === 'en' ? '1. Build Structure' : '1. 先搭结构',
                  desc: locale === 'en' ? 'Fill core sections with quick template switch.' : '先确定模板，再填核心模块，减少后续返工。',
                  icon: LayoutTemplate,
                  number: '01'
                },
                {
                  title: locale === 'en' ? '2. AI Polish' : '2. AI润色',
                  desc: locale === 'en' ? 'Use AI panel to rewrite and boost keyword relevance.' : '使用 AI 面板提升表达和关键词匹配度。',
                  icon: Wand2,
                  number: '02'
                },
                {
                  title: locale === 'en' ? '3. Export Delivery' : '3. 导出交付',
                  desc: locale === 'en' ? 'Finalize as PDF/PNG/JSON for delivery and backup.' : '导出 PDF/PNG/JSON，兼顾投递与备份。',
                  icon: FileCheck2,
                  number: '03'
                }
              ].map((step) => (
                <article key={step.title} className="border-t border-slate-300 pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-4xl font-semibold tracking-[-0.06em] text-slate-200">{step.number}</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2554ff]/10 text-[#2554ff]">
                      <step.icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">{step.desc}</p>
                </article>
              ))}
            </StaggerFadeIn>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <ScrollFadeIn direction="up">
              <div className="mb-10">
                <HomeSectionHeader
                  align="center"
                  badge={locale === 'en' ? 'Feedback' : '用户反馈'}
                  icon={<Star className="h-3.5 w-3.5" />}
                  title={t.home.testimonials.title}
                  desc={t.home.testimonials.desc}
                />
              </div>
            </ScrollFadeIn>

            <StaggerFadeIn className="grid gap-5 md:grid-cols-3" staggerDelay={0.08} direction="up">
              {[t.home.testimonials.user1, t.home.testimonials.user2, t.home.testimonials.user3].map((user) => (
                <article key={user.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-3 flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, index) => (
                      <Star key={`${user.name}-${index}`} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm leading-6 text-slate-700">“{user.text}”</p>
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.role}</div>
                  </div>
                </article>
              ))}
            </StaggerFadeIn>
          </div>
        </section>

        <section className="bg-[#f8fafc] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto w-full max-w-4xl">
            <ScrollFadeIn direction="up">
              <div className="mb-8">
                <HomeSectionHeader
                  align="center"
                  badge={locale === 'en' ? 'FAQ' : '常见问题'}
                  icon={<ChevronDown className="h-3.5 w-3.5" />}
                  title={t.home.faq.title}
                  desc={t.home.faq.desc}
                />
              </div>
            </ScrollFadeIn>

            <StaggerFadeIn className="space-y-3" staggerDelay={0.06} direction="up">
              {[
                { q: t.home.faq.q1, a: t.home.faq.a1 },
                { q: t.home.faq.q2, a: t.home.faq.a2 },
                { q: t.home.faq.q3, a: t.home.faq.a3 },
                { q: t.home.faq.q4, a: t.home.faq.a4 },
                { q: t.home.faq.q5, a: t.home.faq.a5 }
              ].map((item, index) => (
                <article key={item.q} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-900 sm:text-base">{item.q}</span>
                    <motion.div animate={{ rotate: openFaqIndex === index ? 180 : 0 }}>
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24 }}
                      >
                        <div className="border-t border-slate-100 px-5 py-4 text-sm leading-7 text-slate-600">{item.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              ))}
            </StaggerFadeIn>
          </div>
        </section>

        <section className="relative overflow-hidden bg-slate-900 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-cyan-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                    <Sparkles className="h-3.5 w-3.5" />
                    {locale === 'en' ? 'Ready to Deliver' : '准备开始投递'}
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t.home.cta.title}</h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{t.home.cta.desc}</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                    <HeroSupportPill
                      dark
                      icon={<LayoutTemplate className="h-3.5 w-3.5" />}
                      label={locale === 'en' ? 'Template first' : '模板先行'}
                    />
                    <HeroSupportPill
                      dark
                      icon={<Bot className="h-3.5 w-3.5" />}
                      label={locale === 'en' ? 'AI polish' : 'AI 润色'}
                    />
                    <HeroSupportPill
                      dark
                      icon={<FileCheck2 className="h-3.5 w-3.5" />}
                      label={locale === 'en' ? 'Export delivery' : '导出投递'}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href={buildEditorEntryHref({
                      entry: 'general',
                      focus: 'personal',
                      template: 'banner-layout'
                    })}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t.home.cta.button}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={buildEditorEntryHref({
                        entry: 'general',
                        panel: 'template',
                        template: 'banner-layout'
                      })}
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {locale === 'en' ? 'Choose Template' : '选择模板'}
                    </Link>
                    <Link
                      href={buildEditorEntryHref({
                        entry: 'engineering',
                        panel: 'ai',
                        aiSection: 'experience',
                        template: 'banner-layout'
                      })}
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {locale === 'en' ? 'Open AI' : '打开 AI'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-7 right-7 z-50 rounded-xl bg-slate-900 p-3 text-white transition hover:bg-slate-800"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
