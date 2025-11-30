/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


import { motion, useReducedMotion, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface OptimizedFadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
}

/**
 * 优化的淡入动画组件
 * 支持减少动画偏好设置和视口检测
 */
export function OptimizedFadeIn({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = '',
  direction = 'up'
}: OptimizedFadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const shouldReduceMotion = useReducedMotion()

  const directionVariants = {
    up: { y: 30, opacity: 0 },
    down: { y: -30, opacity: 0 },
    left: { x: 30, opacity: 0 },
    right: { x: -30, opacity: 0 }
  }

  const variants = {
    hidden: directionVariants[direction],
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface OptimizedScaleProps {
  children: ReactNode
  scale?: number
  duration?: number
  className?: string
  triggerOnHover?: boolean
}

/**
 * 优化的缩放动画组件
 */
export function OptimizedScale({ 
  children, 
  scale = 1.05, 
  duration = 0.2,
  className = '',
  triggerOnHover = true
}: OptimizedScaleProps) {
  const shouldReduceMotion = useReducedMotion()

  const variants = {
    initial: { scale: 1 },
    hover: { 
      scale: shouldReduceMotion ? 1 : scale,
      transition: { 
        duration: shouldReduceMotion ? 0 : duration,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      whileHover={triggerOnHover ? "hover" : undefined}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface OptimizedStaggerProps {
  children: ReactNode[]
  staggerDelay?: number
  className?: string
}

/**
 * 优化的错开动画组件
 */
export function OptimizedStagger({ 
  children, 
  staggerDelay = 0.1,
  className = ''
}: OptimizedStaggerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const shouldReduceMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: shouldReduceMotion ? 0 : 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

interface OptimizedSlideProps {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  distance?: number
  duration?: number
  delay?: number
  className?: string
}

/**
 * 优化的滑动动画组件
 */
export function OptimizedSlide({ 
  children, 
  direction = 'left',
  distance = 50,
  duration = 0.6,
  delay = 0,
  className = ''
}: OptimizedSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const shouldReduceMotion = useReducedMotion()

  const directionMap = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance }
  }

  const variants = {
    hidden: {
      ...directionMap[direction],
      opacity: 0
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  )
}