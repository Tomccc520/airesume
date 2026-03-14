/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */
import React from 'react'
import { motion } from 'framer-motion'
import { useStyle } from '@/contexts/StyleContext'
import { Skill } from '@/types/resume'
import { Star, Award, Zap, TrendingUp } from 'lucide-react'

interface SkillsDisplayProps {
  skills: Skill[]
}

/**
 * 技能专长显示组件
 * 支持多种显示样式：进度条、标签云、列表、卡片、极简、网格、圆形进度、雷达图、星级评分、徽章、波浪进度、渐变卡片
 */
export default function SkillsDisplay({ skills }: SkillsDisplayProps) {
  const { styleConfig } = useStyle()

  if (!styleConfig.skills.visible || !skills.length) {
    return null
  }

  // 动画变体配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  }

  // 根据分类分组技能
  const groupSkillsByCategory = (skills: Skill[]) => {
    const grouped = skills.reduce((acc, skill) => {
      const category = skill.category || '其他'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(skill)
      return acc
    }, {} as Record<string, Skill[]>)
    return grouped
  }

  // 响应式列数计算
  const getResponsiveColumns = (baseColumns: number, style: string) => {
    // 根据不同样式和屏幕尺寸调整列数
    const styleColumnLimits = {
      'progress': { max: 2, mobile: 1 },
      'tags': { max: 999, mobile: 999 }, // 标签云不限制列数
      'list': { max: 3, mobile: 1 },
      'cards': { max: 4, mobile: 2 },
      'minimal': { max: 2, mobile: 1 },
      'grid': { max: 6, mobile: 3 },
      'circular': { max: 6, mobile: 4 },
      'radar': { max: 1, mobile: 1 } // 雷达图固定为1列
    }
    
    const limits = styleColumnLimits[style as keyof typeof styleColumnLimits] || { max: 4, mobile: 2 }
    
    return {
      desktop: Math.min(baseColumns, limits.max),
      mobile: limits.mobile
    }
  }

  // 渲染进度条样式 - 优化版
  const renderProgressStyle = (skills: Skill[]) => {
    const columns = getResponsiveColumns(styleConfig.skills.columns, 'progress')
    return (
      <motion.div 
        className={`grid gap-3 grid-cols-${columns.mobile} md:grid-cols-${columns.desktop}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="space-y-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold tracking-wide truncate pr-2" style={{ color: styleConfig.colors.text }}>
                {skill.name}
              </span>
              {styleConfig.skills.showLevel && (
                <motion.span 
                  className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{ 
                    color: styleConfig.colors.primary,
                    backgroundColor: styleConfig.colors.primary + '15'
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  {skill.level}%
                </motion.span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner overflow-hidden">
              <motion.div
                className="h-2 rounded-full shadow-sm relative"
                style={{ 
                  background: `linear-gradient(90deg, ${styleConfig.colors.primary}, ${styleConfig.colors.primary}dd)`
                }}
                initial={{ width: 0, x: '-100%' }}
                animate={{ width: `${skill.level}%`, x: 0 }}
                transition={{ 
                  duration: 1.5, 
                  delay: index * 0.1, 
                  ease: "easeOut",
                  x: { duration: 0.8, delay: index * 0.1 + 0.5 }
                }}
              >
                {/* 进度条光效 */}
                <motion.div
                  className="absolute inset-0 bg-white opacity-30 rounded-full"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 2,
                    delay: index * 0.1 + 1,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // 渲染标签云样式 - 优化版（响应式）
  const renderTagsStyle = (skills: Skill[]) => (
    <motion.div 
      className="flex flex-wrap gap-2 justify-center sm:justify-start"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {skills.map((skill, index) => (
        <motion.span
          key={skill.id}
          variants={itemVariants}
          whileHover={{ 
            scale: 1.08, 
            y: -4,
            boxShadow: `0 8px 25px ${skill.color || styleConfig.colors.primary}40`
          }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
          style={{
             background: skill.color ? `linear-gradient(135deg, ${skill.color}, ${skill.color}cc)` : `linear-gradient(135deg, ${styleConfig.colors.primary}, ${styleConfig.colors.primary}cc)`,
             color: 'white',
             fontSize: `${Math.max(styleConfig.fontSize.content - 2, 12)}px`
           }}
        >
          {/* 标签光效 */}
          <motion.div
            className="absolute inset-0 bg-white opacity-20"
            initial={{ x: '-100%', skewX: -15 }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <span className="relative z-10">
            {skill.name}
            {styleConfig.skills.showLevel && (
              <span className="ml-1 opacity-90 text-xs">
                {skill.level}%
              </span>
            )}
          </span>
        </motion.span>
      ))}
    </motion.div>
  )

  // 渲染列表样式 - 优化版（响应式）
  const renderListStyle = (skills: Skill[]) => {
    const columns = getResponsiveColumns(styleConfig.skills.columns, 'list')
    return (
      <motion.div 
        className={`grid gap-3 grid-cols-${columns.mobile} md:grid-cols-${columns.desktop}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            variants={itemVariants}
            whileHover={{ x: 4 }}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <motion.div
              className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
              style={{ backgroundColor: styleConfig.colors.primary }}
              whileHover={{ scale: 1.2 }}
            />
            <span className="text-sm font-medium flex-1 truncate" style={{ color: styleConfig.colors.text }}>
              {skill.name}
            </span>
            {styleConfig.skills.showLevel && (
              <span 
                className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap"
                style={{ 
                  color: styleConfig.colors.primary,
                  backgroundColor: styleConfig.colors.primary + '10'
                }}
              >
                {skill.level}%
              </span>
            )}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // 渲染卡片样式 - 优化版（响应式）
  const renderCardsStyle = (skills: Skill[]) => {
    const columns = getResponsiveColumns(styleConfig.skills.columns, 'cards')
    return (
      <motion.div 
        className={`grid gap-3 grid-cols-${columns.mobile} md:grid-cols-${columns.desktop}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-3 sm:p-4 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm"
            style={{ 
              borderColor: styleConfig.colors.primary + '30',
              background: `linear-gradient(135deg, ${styleConfig.colors.primary}08, ${styleConfig.colors.primary}15)`
            }}
          >
            <div className="text-center">
              <h4 className="font-semibold text-sm mb-2 tracking-wide truncate" style={{ color: styleConfig.colors.text }}>
                {skill.name}
              </h4>
              {styleConfig.skills.showLevel && (
                <div className="relative">
                  <div 
                    className="text-xl sm:text-2xl font-bold mb-1"
                    style={{ color: styleConfig.colors.primary }}
                  >
                    {skill.level}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <motion.div
                      className="h-1 rounded-full"
                      style={{ backgroundColor: styleConfig.colors.primary }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // 渲染极简样式 - 优化版（响应式）
  const renderMinimalStyle = (skills: Skill[]) => {
    const columns = getResponsiveColumns(styleConfig.skills.columns, 'minimal')
    return (
      <motion.div 
        className={`grid gap-2 grid-cols-${columns.mobile} md:grid-cols-${columns.desktop}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <span className="text-sm font-medium truncate pr-2" style={{ color: styleConfig.colors.text }}>
              {skill.name}
            </span>
            {styleConfig.skills.showLevel && (
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-1.5">
                  <motion.div
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: styleConfig.colors.primary }}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
                <span 
                  className="text-xs font-semibold whitespace-nowrap"
                  style={{ color: styleConfig.colors.primary }}
                >
                  {skill.level}%
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // 渲染网格样式 - 优化版（响应式）
  const renderGridStyle = (skills: Skill[]) => {
    const columns = getResponsiveColumns(styleConfig.skills.columns, 'grid')
    return (
      <motion.div 
        className={`grid gap-2 grid-cols-${columns.mobile} md:grid-cols-${columns.desktop}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            className="p-2 sm:p-3 text-center rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            style={{ 
              borderColor: styleConfig.colors.primary + '30',
              backgroundColor: styleConfig.colors.primary + '08'
            }}
          >
            <div className="font-medium text-xs sm:text-sm truncate" style={{ color: styleConfig.colors.text }}>
              {skill.name}
            </div>
            {styleConfig.skills.showLevel && (
              <div className="mt-1">
                <div 
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: styleConfig.colors.primary }}
                >
                  {skill.level}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <motion.div
                    className="h-1 rounded-full"
                    style={{ backgroundColor: styleConfig.colors.primary }}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // 渲染圆形进度样式 - 优化版（响应式）
  const renderCircularStyle = (skills: Skill[]) => {
    const columns = getResponsiveColumns(styleConfig.skills.columns, 'circular')
    const size = 48 // 基础尺寸，在移动端会更小
    const strokeWidth = 4
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI

    return (
      <motion.div 
        className={`grid gap-4 grid-cols-${columns.mobile} md:grid-cols-${columns.desktop} justify-items-center`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {skills.map((skill, index) => {
          const strokeDasharray = `${(skill.level / 100) * circumference} ${circumference}`
          
          return (
            <motion.div
              key={skill.id}
              variants={itemVariants}
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center space-y-2 p-2"
            >
              <div className="relative">
                <svg 
                  className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90" 
                  width={size} 
                  height={size}
                >
                  {/* 背景圆环 */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* 进度圆环 */}
                  <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={styleConfig.colors.primary}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (skill.level / 100) * circumference }}
                    transition={{ duration: 1.5, delay: index * 0.1, ease: "easeOut" }}
                  />
                </svg>
                {/* 中心百分比 */}
                {styleConfig.skills.showLevel && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="text-xs sm:text-sm font-bold"
                      style={{ color: styleConfig.colors.primary }}
                    >
                      {skill.level}%
                    </span>
                  </div>
                )}
              </div>
              <span 
                className="text-xs sm:text-sm font-medium text-center max-w-full truncate"
                style={{ color: styleConfig.colors.text }}
              >
                {skill.name}
              </span>
            </motion.div>
          )
        })}
      </motion.div>
    )
  }

  // 渲染雷达图样式 - 优化版（响应式）
  const renderRadarStyle = (skills: Skill[]) => {
    if (skills.length === 0) return null
    
    // 响应式尺寸设置
    const isMobile = window.innerWidth < 640
    const size = isMobile ? 200 : 280
    const center = size / 2
    const maxRadius = isMobile ? 70 : 100
    const levels = 5
    
    // 计算技能点位置
    const angleStep = (2 * Math.PI) / skills.length
    const skillPoints = skills.map((skill, index) => {
      const angle = index * angleStep - Math.PI / 2
      const radius = (skill.level / 100) * maxRadius
      return {
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius,
        labelX: center + Math.cos(angle) * (maxRadius + (isMobile ? 20 : 30)),
        labelY: center + Math.sin(angle) * (maxRadius + (isMobile ? 20 : 30)),
        skill
      }
    })

    // 生成雷达图多边形路径
    const radarPath = skillPoints.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z'

    return (
      <div className="flex justify-center w-full">
        <motion.div 
          className="relative p-4 sm:p-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <svg 
            width={size + (isMobile ? 80 : 120)} 
            height={size + (isMobile ? 80 : 120)} 
            className="overflow-visible"
          >
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={styleConfig.colors.primary} stopOpacity="0.3" />
                <stop offset="100%" stopColor={styleConfig.colors.primary} stopOpacity="0.1" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* 背景网格线 */}
            <g transform={`translate(${(isMobile ? 40 : 60)}, ${(isMobile ? 40 : 60)})`}>
              {/* 同心圆 */}
              {Array.from({ length: levels }, (_, i) => (
                <motion.circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={(maxRadius / levels) * (i + 1)}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeOpacity={0.6}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              ))}
              
              {/* 轴线 */}
              {skills.map((_, index) => {
                const angle = index * angleStep - Math.PI / 2
                const endX = center + Math.cos(angle) * maxRadius
                const endY = center + Math.sin(angle) * maxRadius
                
                return (
                  <motion.line
                    key={index}
                    x1={center}
                    y1={center}
                    x2={endX}
                    y2={endY}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeOpacity={0.6}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  />
                )
              })}
              
              {/* 技能数据多边形 */}
              <motion.path
                d={radarPath}
                fill="url(#radarGradient)"
                stroke={styleConfig.colors.primary}
                strokeWidth="2"
                filter="url(#glow)"
                initial={{ pathLength: 0, fillOpacity: 0 }}
                animate={{ pathLength: 1, fillOpacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              
              {/* 技能点 */}
              {skillPoints.map((point, index) => (
                <motion.circle
                  key={point.skill.id}
                  cx={point.x}
                  cy={point.y}
                  r={isMobile ? 4 : 6}
                  fill={styleConfig.colors.primary}
                  stroke="white"
                  strokeWidth="2"
                  filter="url(#glow)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 1 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ scale: 1.5 }}
                />
              ))}
              
              {/* 技能标签 */}
              {skillPoints.map((point, index) => (
                <motion.g key={`label-${point.skill.id}`}>
                  <motion.text
                    x={point.labelX}
                    y={point.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}
                    fill={styleConfig.colors.text}
                    initial={{ opacity: 0, y: point.labelY + 10 }}
                    animate={{ opacity: 1, y: point.labelY }}
                    transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  >
                    {point.skill.name}
                  </motion.text>
                  {styleConfig.skills.showLevel && (
                    <motion.text
                      x={point.labelX}
                      y={point.labelY + (isMobile ? 12 : 16)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'}`}
                      fill={styleConfig.colors.primary}
                      initial={{ opacity: 0, y: point.labelY + 20 }}
                      animate={{ opacity: 1, y: point.labelY + (isMobile ? 12 : 16) }}
                      transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                    >
                      {point.skill.level}%
                    </motion.text>
                  )}
                </motion.g>
              ))}
            </g>
          </svg>
        </motion.div>
      </div>
    )
  }

  // 渲染星级评分样式
  const renderStarRatingStyle = (skills: Skill[]) => (
    <motion.div 
      className="grid gap-4 grid-cols-1 md:grid-cols-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {skills.map((skill, index) => {
        const stars = Math.round((skill.level / 100) * 5)
        
        return (
          <motion.div
            key={skill.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 4 }}
            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-white to-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: skill.color || styleConfig.colors.primary }}
              />
              <span className="font-medium text-gray-800">{skill.name}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 + i * 0.05 }}
                >
                  <Star
                    className={`w-4 h-4 ${
                      i < stars 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )

  // 渲染徽章样式
  const renderBadgeStyle = (skills: Skill[]) => (
    <motion.div 
      className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {skills.map((skill, index) => (
        <motion.div
          key={skill.id}
          variants={itemVariants}
          whileHover={{ scale: 1.08, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-4 rounded-xl text-center cursor-pointer overflow-hidden group"
          style={{
            background: `linear-gradient(135deg, ${skill.color || styleConfig.colors.primary}15, ${skill.color || styleConfig.colors.primary}05)`
          }}
        >
          {/* 背景装饰 */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at center, ${skill.color || styleConfig.colors.primary}20, transparent)`
            }}
          />
          
          {/* 徽章图标 */}
          <motion.div
            className="relative z-10 flex justify-center mb-2"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: skill.color || styleConfig.colors.primary }}
            >
              <Award className="w-5 h-5 text-white" />
            </div>
          </motion.div>
          
          {/* 技能名称 */}
          <div className="relative z-10 font-semibold text-sm text-gray-800 mb-1">
            {skill.name}
          </div>
          
          {/* 等级标签 */}
          {styleConfig.skills.showLevel && (
            <div 
              className="relative z-10 text-xs font-bold px-2 py-1 rounded-full inline-block"
              style={{ 
                backgroundColor: skill.color || styleConfig.colors.primary,
                color: 'white'
              }}
            >
              {skill.level}%
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  )

  // 渲染波浪进度样式
  const renderWaveProgressStyle = (skills: Skill[]) => (
    <motion.div 
      className="grid gap-4 grid-cols-1 md:grid-cols-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {skills.map((skill, index) => (
        <motion.div
          key={skill.id}
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap 
                className="w-4 h-4"
                style={{ color: skill.color || styleConfig.colors.primary }}
              />
              <span className="font-semibold text-gray-800">{skill.name}</span>
            </div>
            {styleConfig.skills.showLevel && (
              <span 
                className="text-sm font-bold"
                style={{ color: skill.color || styleConfig.colors.primary }}
              >
                {skill.level}%
              </span>
            )}
          </div>
          
          {/* 波浪进度条 */}
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${skill.color || styleConfig.colors.primary}, ${skill.color || styleConfig.colors.primary}cc)`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${skill.level}%` }}
              transition={{ duration: 1.2, delay: index * 0.1, ease: "easeOut" }}
            >
              {/* 波浪效果 */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 10px,
                    rgba(255,255,255,0.2) 10px,
                    rgba(255,255,255,0.2) 20px
                  )`
                }}
                animate={{ x: [0, 20] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )

  // 渲染渐变卡片样式
  const renderGradientCardStyle = (skills: Skill[]) => (
    <motion.div 
      className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {skills.map((skill, index) => (
        <motion.div
          key={skill.id}
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -8 }}
          className="relative p-5 rounded-2xl text-center cursor-pointer overflow-hidden group"
          style={{
            background: `linear-gradient(135deg, ${skill.color || styleConfig.colors.primary}, ${skill.color || styleConfig.colors.primary}dd)`
          }}
        >
          {/* 光效背景 */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3), transparent 70%)'
            }}
          />
          
          {/* 装饰圆点 */}
          <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/10 blur-xl" />
          
          {/* 图标 */}
          <motion.div
            className="relative z-10 flex justify-center mb-3"
            whileHover={{ scale: 1.2, rotate: 15 }}
          >
            <TrendingUp className="w-8 h-8 text-white" />
          </motion.div>
          
          {/* 技能名称 */}
          <div className="relative z-10 font-bold text-white mb-2 text-sm">
            {skill.name}
          </div>
          
          {/* 等级显示 */}
          {styleConfig.skills.showLevel && (
            <div className="relative z-10">
              <div className="text-2xl font-bold text-white mb-1">
                {skill.level}%
              </div>
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.level}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  )

  // 根据样式类型渲染
  const renderSkillsByStyle = (skills: Skill[]) => {
    switch (styleConfig.skills.displayStyle) {
      case 'progress':
        return renderProgressStyle(skills)
      case 'tags':
        return renderTagsStyle(skills)
      case 'list':
        return renderListStyle(skills)
      case 'cards':
        return renderCardsStyle(skills)
      case 'minimal':
        return renderMinimalStyle(skills)
      case 'grid':
        return renderGridStyle(skills)
      case 'circular':
        return renderCircularStyle(skills)
      case 'radar':
        return renderRadarStyle(skills)
      case 'star-rating':
        return renderStarRatingStyle(skills)
      case 'badge':
        return renderBadgeStyle(skills)
      case 'wave-progress':
        return renderWaveProgressStyle(skills)
      case 'gradient-card':
        return renderGradientCardStyle(skills)
      default:
        return renderProgressStyle(skills)
    }
  }

  if (styleConfig.skills.groupByCategory) {
    const groupedSkills = groupSkillsByCategory(skills)
    return (
      <div className="space-y-6">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div key={category}>
            {styleConfig.skills.showCategory && (
              <h4 className="text-lg font-semibold mb-4" style={{ color: styleConfig.colors.text }}>
                {category}
              </h4>
            )}
            {renderSkillsByStyle(categorySkills)}
          </div>
        ))}
      </div>
    )
  }

  return renderSkillsByStyle(skills)
}