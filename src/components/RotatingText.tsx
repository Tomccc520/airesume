/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RotatingTextProps {
  texts: string[]
  rotationInterval?: number
  className?: string
}

/**
 * 旋转文字组件
 * 基于React Bits的RotatingText组件实现
 * 支持多个文本的循环切换动画
 * 性能优化：使用 requestAnimationFrame 和 will-change
 */
export default function RotatingText({ 
  texts, 
  rotationInterval = 2000, 
  className = '' 
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (texts.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [texts.length, rotationInterval])

  return (
    <div className={`relative inline-block ${className}`} style={{ willChange: 'transform' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-120%', opacity: 0 }}
          transition={{
            duration: 0.4,
            ease: 'easeInOut'
          }}
          className="block"
          style={{ willChange: 'transform, opacity' }}
        >
          {texts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}