/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-07
 * 
 * 增强版技能展示组件 - 新增多种创意样式
 */

import React from 'react'
import { motion } from 'framer-motion'
import { useStyle } from '@/contexts/StyleContext'
import { Skill } from '@/types/resume'
import { Star, Award, Zap, TrendingUp } from 'lucide-react'

interface SkillsDisplayEnhancedProps {
  skills: Skill[]
}

/**
 * 增强版技能展示组件
 * 新增样式：星级评分、徽章、波浪进度、渐变卡片
 */
export default function SkillsDisplayEnhanced({ skills }: SkillsDisplayEnhancedProps) {
  const { styleConfig } = useStyle()

  if (!styleConfig.skills.visible || !skills.length) {
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 10
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
      case 'star-rating':
        return renderStarRatingStyle(skills)
      case 'badge':
        return renderBadgeStyle(skills)
      case 'wave-progress':
        return renderWaveProgressStyle(skills)
      case 'gradient-card':
        return renderGradientCardStyle(skills)
      default:
        // 默认使用原有的进度条样式
        return renderWaveProgressStyle(skills)
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

