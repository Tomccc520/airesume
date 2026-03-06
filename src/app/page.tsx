'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { FileText, Sparkles, ArrowRight, Zap, Shield, Download, Star, Clock, ChevronDown, ArrowUp, Code2, Cpu, Bot, LineChart, Layout } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import React, { useState, useEffect, useRef } from 'react'
import RotatingText from '@/components/RotatingText'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollFadeIn, { StaggerFadeIn } from '@/components/ScrollFadeIn'
import { AnimatedBackgroundSkeleton } from '@/components/LoadingStates'
import { useLanguage } from '@/contexts/LanguageContext'

// 动态导入 AnimatedBackground 组件以优化首页加载性能
// 使用 ssr: false 避免服务端渲染，因为动画效果依赖浏览器环境
const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), {
  ssr: false,
  loading: () => <AnimatedBackgroundSkeleton />
})

// 动态网格背景组件
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
    <div className="absolute right-0 top-0 -z-10 h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px]"></div>
  </div>
)

// AI 扫描动画组件
const AIScanner = () => {
  return (
    <motion.div
      className="absolute inset-0 z-20 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <motion.div
        className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  )
}

// 数字滚动组件
const AnimatedNumber = ({ value, duration = 2000, decimals = 0 }: { value: number, duration?: number, decimals?: number }) => {
  const spring = useSpring(0, { duration: duration, bounce: 0 })
  const display = useTransform(spring, (current) => current.toFixed(decimals))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}

// 聚光灯卡片组件
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-300/50 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59,130,246,0.06), transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-22
 * 
 * 首页组件 - 简洁现代设计
 * 展示产品特色和引导用户使用
 */
export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 50])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const { t, locale } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div>
        {/* Hero Section - 精致蓝色系设计 */}
        <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-20 px-4 sm:px-6 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
          {/* 精致蓝色背景 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.12),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.08),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-200/30 rounded-full blur-3xl"></div>
          </div>
          {/* 动态渐变背景 - 蓝色系 */}
          <AnimatedBackground
            colors={['#3b82f6', '#0ea5e9', '#2563eb', '#06b6d4', '#3b82f6']}
            duration={25}
            direction="diagonal"
            opacity={0.05}
            blur={140}
          />

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* 左侧内容 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                style={{ opacity: heroOpacity, y: heroY }}
                className="text-center lg:text-left"
              >
                {/* 标签 - 精致蓝色系 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-300/50 text-blue-700 rounded-full text-sm font-medium mb-6 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all cursor-default shadow-sm backdrop-blur-sm"
                >
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">{t.home.hero.tag}</span>
                </motion.div>

                {/* 主标题 - 精致蓝色系 */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                  <span className="flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 animate-gradient">AI</span>
                    <span>{t.home.hero.titlePrefix}</span>
                    <RotatingText
                      texts={locale === 'zh' ? ["专业", "出色", "完美"] : ["Professional", "Outstanding", "Perfect"]}
                      rotationInterval={2500}
                      className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600"
                    />
                  </span>
                  <span className="block mt-2">{t.home.hero.titleSuffix}</span>
                  <span className="block text-2xl sm:text-3xl lg:text-4xl text-gray-600 mt-4 font-normal">
                    {t.home.hero.subtitle}
                  </span>
                </h1>

                {/* 副标题 */}
                <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {t.home.hero.desc}
                </p>

                {/* CTA 按钮 - 精致蓝色系 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                  <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/editor"
                      className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700 transition-all shadow-lg hover:shadow-2xl hover:shadow-blue-500/50"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      {t.home.hero.start}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-blue-200 text-blue-700 text-lg font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
                  >
                    {t.home.hero.features}
                  </motion.button>
                </div>

                {/* 统计数据 - 精致蓝色系 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="grid grid-cols-3 gap-6 pt-8 border-t border-blue-100"
                >
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                      <AnimatedNumber value={10} />K+
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{t.home.hero.users}</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                      <AnimatedNumber value={4.9} decimals={1} />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{t.home.hero.rating}</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                      <AnimatedNumber value={100} />%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{t.home.hero.security}</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* 右侧视觉展示 - A4 简历预览精致蓝色系 */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ opacity: heroOpacity, y: heroY }}
                className="relative hidden lg:block perspective-1000"
              >
                {/* A4 简历预览卡片 - 精致蓝色系 */}
                <div className="relative transform-style-3d group">
                  {/* 主卡片 - A4 比例 (1:1.414) */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotateX: [0, 1, 0],
                      rotateY: [0, 1, 0],
                    }}
                    whileHover={{ scale: 1.02, rotateX: 0, rotateY: 0 }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative bg-white rounded-2xl p-10 border border-blue-200/50 overflow-hidden shadow-2xl shadow-blue-500/10"
                    style={{ aspectRatio: '1 / 1.414', maxWidth: '400px' }}
                  >
                    {/* 精致蓝色渐变背景 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-cyan-50/40"></div>
                    
                    <div className="space-y-6 opacity-90 relative z-10">
                      {/* 模拟简历头部 - 蓝色系 */}
                      <div className="text-center border-b border-blue-100 pb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mx-auto mb-4 ring-4 ring-blue-100/80" />
                        <div className="h-5 bg-gray-900 rounded-lg w-40 mx-auto mb-2" />
                        <div className="h-3 bg-gray-500 rounded w-32 mx-auto" />
                      </div>

                      {/* 模拟联系方式 */}
                      <div className="flex justify-center gap-4 text-xs">
                        <div className="h-2 bg-blue-200 rounded-full w-20" />
                        <div className="h-2 bg-cyan-200 rounded-full w-24" />
                        <div className="h-2 bg-blue-200 rounded-full w-20" />
                      </div>

                      {/* 模拟工作经历 */}
                      <div className="space-y-4">
                        <div className="h-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg w-24 mb-3" />
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-800 rounded-lg w-full" />
                          <div className="h-2 bg-blue-100 rounded-full w-5/6" />
                          <div className="h-2 bg-cyan-100 rounded-full w-4/6" />
                        </div>
                      </div>

                      {/* 模拟教育背景 */}
                      <div className="space-y-4">
                        <div className="h-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg w-24 mb-3" />
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-800 rounded-lg w-4/5" />
                          <div className="h-2 bg-blue-100 rounded-full w-3/5" />
                        </div>
                      </div>

                      {/* 模拟技能 */}
                      <div className="space-y-4">
                        <div className="h-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg w-16 mb-3" />
                        <div className="flex flex-wrap gap-2">
                          <div className="h-6 bg-blue-50 border border-blue-400 rounded-lg w-16" />
                          <div className="h-6 bg-cyan-50 border border-cyan-400 rounded-lg w-20" />
                          <div className="h-6 bg-blue-50 border border-blue-400 rounded-lg w-18" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* 浮动标签 - 精致蓝色系 */}
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      rotate: [-2, 2, -2],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute -top-6 -right-6 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xl shadow-blue-500/30"
                  >
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-100">AI Score</div>
                      <div className="text-white font-bold">98/100</div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, 8, 0],
                      rotate: [2, -2, 2],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    }}
                    className="absolute -bottom-6 -left-6 bg-white text-gray-900 px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xl border border-blue-200"
                  >
                    <div className="p-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Speed</div>
                      <div className="text-gray-900 font-bold">Fast</div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                      x: [0, 3, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    }}
                    className="absolute top-1/3 -right-12 bg-white border border-blue-200 px-4 py-3 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 w-20 bg-blue-200 rounded-full" />
                        <div className="h-2 w-16 bg-cyan-100 rounded-full" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* 装饰元素 - 精致蓝色系 */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/15 rounded-full blur-[80px]" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-[80px]" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* 功能介绍 - 精致蓝色系 */}
        <section id="features" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
          {/* 背景装饰 - 精致蓝色系 */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/25 rounded-full blur-[100px]" />
             <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-cyan-200/20 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <ScrollFadeIn direction="up">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-300/50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide mb-4 backdrop-blur-sm">
                   <Sparkles className="h-3 w-3 text-blue-600" />
                   {t.home.features.tag}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  {t.home.features.title}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {t.home.features.desc}
                </p>
              </div>
            </ScrollFadeIn>

            <div className="space-y-24">
              {/* 功能1：AI 深度分析 - 精致蓝色系 */}
              <ScrollFadeIn direction="up">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-300/50 text-blue-700 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
                      <Bot className="h-4 w-4 text-blue-600" />
                      {t.home.features.ai.tag}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {t.home.features.ai.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {t.home.features.ai.desc}
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <LineChart className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-gray-700">{t.home.features.ai.list1}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Code2 className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-gray-700">{t.home.features.ai.list2}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-gray-700">{t.home.features.ai.list3}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200/50 shadow-xl shadow-blue-500/10"
                    >
                      <div className="bg-white rounded-xl p-6 border border-blue-100">
                         {/* Visualization of AI Analysis - 精致蓝色系 */}
                         <div className="flex justify-between items-end mb-6">
                            <div>
                               <div className="text-sm text-gray-500 mb-1">简历综合评分</div>
                               <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">92<span className="text-lg text-gray-400 font-normal">/100</span></div>
                            </div>
                            <div className="h-10 w-20">
                               <LineChart className="w-full h-full text-blue-600" />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                               <span className="text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"/> 内容完整度</span>
                               <span className="font-medium text-gray-900">完美</span>
                            </div>
                            <div className="w-full bg-blue-100/50 rounded-full h-1.5">
                               <motion.div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-1.5 rounded-full shadow-sm" initial={{width: 0}} animate={{width: '95%'}} transition={{duration: 1.5}} />
                            </div>
                            <div className="flex items-center justify-between text-sm pt-2">
                               <span className="text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-600"/> 关键词匹配</span>
                               <span className="font-medium text-gray-900">优秀</span>
                            </div>
                            <div className="w-full bg-cyan-100/50 rounded-full h-1.5">
                               <motion.div className="bg-gradient-to-r from-cyan-600 to-blue-600 h-1.5 rounded-full shadow-sm" initial={{width: 0}} animate={{width: '88%'}} transition={{duration: 1.5, delay: 0.2}} />
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </ScrollFadeIn>

              {/* 功能2：实时计算与渲染 - 精致蓝色系 */}
              <ScrollFadeIn direction="up">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1 relative">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 rounded-2xl p-8 border border-blue-800/50 shadow-xl shadow-blue-900/20"
                    >
                       <div className="grid grid-cols-2 gap-4 h-full">
                          {/* Code Side */}
                          <div className="bg-gray-950 rounded-xl p-4 font-mono text-xs text-gray-300 shadow-inner border border-blue-900/30">
                             <div className="flex gap-1.5 mb-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"/>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"/>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"/>
                             </div>
                             <div className="space-y-1 opacity-70">
                                <p><span className="text-blue-400">const</span> <span className="text-cyan-300">resume</span> = {'{'}</p>
                                <p className="pl-4">name: <span className="text-green-400">'Alex'</span>,</p>
                                <p className="pl-4">role: <span className="text-green-400">'Dev'</span>,</p>
                                <p>{'}'}</p>
                             </div>
                          </div>
                          {/* Preview Side */}
                          <div className="bg-white rounded-xl p-4 border border-blue-200 flex flex-col">
                             <div className="h-2 bg-blue-300 w-1/3 mb-4 rounded-full"/>
                             <div className="space-y-2 flex-1">
                                <div className="h-1.5 bg-blue-100 w-full rounded-full"/>
                                <div className="h-1.5 bg-cyan-100 w-full rounded-full"/>
                                <div className="h-1.5 bg-blue-100 w-2/3 rounded-full"/>
                             </div>
                          </div>
                          {/* Connection */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-2 border-2 border-white z-10 shadow-lg shadow-blue-500/50">
                             <Zap className="w-5 h-5 text-white fill-current animate-pulse" />
                          </div>
                       </div>
                    </motion.div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-300/50 text-blue-700 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
                      <Cpu className="h-4 w-4 text-blue-600" />
                      {t.home.features.realtime.tag}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {t.home.features.realtime.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {t.home.features.realtime.desc}
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Zap className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-gray-700">{t.home.features.realtime.list1}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Layout className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-gray-700">{t.home.features.realtime.list2}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </ScrollFadeIn>

              {/* 功能3：结构化导出 - 精致蓝色系 */}
              <ScrollFadeIn direction="up">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-300/50 text-blue-700 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
                      <Code2 className="h-4 w-4 text-blue-600" />
                      {t.home.features.export.tag}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {t.home.features.export.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {t.home.features.export.desc}
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <FileText className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-gray-700">{t.home.features.export.list1}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Shield className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-gray-700">{t.home.features.export.list2}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200/50 shadow-xl shadow-blue-500/10"
                    >
                      <div className="bg-white rounded-xl p-6 border border-blue-100 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-sm">
                                 <FileText className="w-6 h-6 text-white"/>
                              </div>
                              <div>
                                 <div className="font-medium text-gray-900">Resume_Final.pdf</div>
                                 <div className="text-xs text-gray-500">Vector Format</div>
                              </div>
                           </div>
                           <Download className="w-5 h-5 text-gray-400" />
                        </div>
                        {/* Abstract Representation of Parsing */}
                        <div className="space-y-2 relative">
                           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80 z-10" />
                           {[1,2,3,4].map(i => (
                              <div key={i} className="flex gap-2 items-center opacity-50">
                                 <div className="w-1 h-1 rounded-full bg-blue-400"/>
                                 <div className="h-2 bg-blue-100 rounded-full w-full"/>
                              </div>
                           ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-100 flex justify-between items-center">
                           <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
                              <Shield className="w-3 h-3" /> ATS Verified
                           </div>
                           <div className="text-xs text-gray-400">245 KB</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </ScrollFadeIn>
              
               {/* 功能4：数据安全 - 精致蓝色系 */}
              <ScrollFadeIn direction="up">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                   <div className="order-2 lg:order-1 relative">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 rounded-2xl p-8 border border-blue-800/50 shadow-xl shadow-blue-900/20"
                    >
                       <div className="bg-white rounded-xl p-6 border border-blue-100 flex flex-col items-center text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                             <Shield className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-gray-900 font-medium mb-1">本地加密存储</div>
                          <div className="text-sm text-gray-500 mb-6">您的数据从未离开浏览器</div>
                          
                          <div className="w-full bg-blue-50 rounded-xl p-3 flex items-center gap-3 border border-blue-200">
                             <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"/>
                             <div className="text-xs text-gray-600 font-mono flex-1 text-left">localStorage.encrypted_data</div>
                             <Shield className="w-3 h-3 text-blue-600"/>
                          </div>
                       </div>
                    </motion.div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-300/50 text-blue-700 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
                      <Shield className="h-4 w-4 text-blue-600" />
                      {t.home.features.privacy.tag}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {t.home.features.privacy.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {t.home.features.privacy.desc}
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Shield className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-gray-700">{t.home.features.privacy.list1}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Clock className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-gray-700">{t.home.features.privacy.list2}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </ScrollFadeIn>
            </div>
          </div>
        </section>

        {/* 用户评价 - 精致蓝色系 */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-white via-blue-50/20 to-white relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-200/25 rounded-full blur-[100px]" />
             <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-cyan-200/20 rounded-full blur-[100px]" />
          </div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <ScrollFadeIn direction="up">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  {t.home.testimonials.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {t.home.testimonials.desc}
                </p>
              </div>
            </ScrollFadeIn>

            <StaggerFadeIn
              staggerDelay={0.15}
              direction="up"
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <div className="p-8 h-full border border-blue-200/50 rounded-2xl bg-white hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-cyan-50/30 transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-center mb-5">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-semibold text-gray-700">5.0</span>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{t.home.testimonials.user1.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                      {t.home.testimonials.user1.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">{t.home.testimonials.user1.name}</p>
                      <p className="text-sm text-gray-500">{t.home.testimonials.user1.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <div className="p-8 h-full border border-blue-200/50 rounded-2xl bg-white hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-cyan-50/30 transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-center mb-5">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-semibold text-gray-700">5.0</span>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{t.home.testimonials.user2.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                      {t.home.testimonials.user2.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">{t.home.testimonials.user2.name}</p>
                      <p className="text-sm text-gray-500">{t.home.testimonials.user2.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="h-full sm:col-span-2 lg:col-span-1"
              >
                <div className="p-8 h-full border border-blue-200/50 rounded-2xl bg-white hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-cyan-50/30 transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-center mb-5">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-semibold text-gray-700">5.0</span>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{t.home.testimonials.user3.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                      {t.home.testimonials.user3.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">{t.home.testimonials.user3.name}</p>
                      <p className="text-sm text-gray-500">{t.home.testimonials.user3.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerFadeIn>
          </div>
        </section>

        {/* 常见问题 FAQ - 现代简洁风格 */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <ScrollFadeIn direction="up">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  {t.home.faq.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {t.home.faq.desc}
                </p>
              </div>
            </ScrollFadeIn>

            <StaggerFadeIn staggerDelay={0.1} direction="up" className="space-y-4">
              {[
                {
                  q: t.home.faq.q1,
                  a: t.home.faq.a1
                },
                {
                  q: t.home.faq.q2,
                  a: t.home.faq.a2
                },
                {
                  q: t.home.faq.q3,
                  a: t.home.faq.a3
                },
                {
                  q: t.home.faq.q4,
                  a: t.home.faq.a4
                },
                {
                  q: t.home.faq.q5,
                  a: t.home.faq.a5
                }
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 text-lg">{item.q}</span>
                    <motion.div
                      animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </StaggerFadeIn>
          </div>
        </section>

        {/* CTA Section - 精致蓝色系 */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <ScrollFadeIn direction="up">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                {t.home.cta.title}
              </h2>
              <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                {t.home.cta.desc}
              </p>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/editor"
                  className="inline-flex items-center justify-center px-10 py-5 bg-white text-blue-700 text-lg font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl"
                >
                  <Sparkles className="h-6 w-6 mr-2" />
                  {t.home.cta.button}
                  <ArrowRight className="h-6 w-6 ml-2" />
                </Link>
              </motion.div>
            </ScrollFadeIn>
          </div>
        </section>
      </div>

      <Footer />

      {/* 返回顶部按钮 - 精致蓝色系 */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none shadow-xl shadow-blue-500/30"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}