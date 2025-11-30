/**
 * ScrollFadeIn 组件
 * 使用 Intersection Observer API 实现滚动触发的渐入动画
 * 性能优化：仅在元素进入视口时触发动画
 */

'use client';

import { motion, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';

/**
 * 滚动渐入动画配置
 */
export interface ScrollFadeInProps {
  // 子元素
  children: ReactNode;
  // 动画方向
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  // 移动距离（像素）
  distance?: number;
  // 动画持续时间（秒）
  duration?: number;
  // 动画延迟（秒）
  delay?: number;
  // 是否只触发一次，默认 true
  once?: boolean;
  // 触发阈值（0-1），默认 0.1
  threshold?: number;
  // 自定义类名
  className?: string;
}

/**
 * 滚动渐入动画组件
 * 
 * @example
 * ```tsx
 * // 从下往上渐入
 * <ScrollFadeIn direction="up">
 *   <div>内容</div>
 * </ScrollFadeIn>
 * 
 * // 从左往右渐入
 * <ScrollFadeIn direction="right" distance={50}>
 *   <div>内容</div>
 * </ScrollFadeIn>
 * 
 * // 仅淡入，无移动
 * <ScrollFadeIn direction="fade">
 *   <div>内容</div>
 * </ScrollFadeIn>
 * ```
 */
export default function ScrollFadeIn({
  children,
  direction = 'up',
  distance = 30,
  duration = 0.6,
  delay = 0,
  once = true,
  threshold = 0.1,
  className = '',
}: ScrollFadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });

  // 根据方向计算初始位置
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, opacity: 0 };
      case 'down':
        return { y: -distance, opacity: 0 };
      case 'left':
        return { x: distance, opacity: 0 };
      case 'right':
        return { x: -distance, opacity: 0 };
      case 'fade':
        return { opacity: 0 };
      default:
        return { y: distance, opacity: 0 };
    }
  };

  // 最终位置
  const finalPosition = {
    x: 0,
    y: 0,
    opacity: 1,
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialPosition()}
      animate={isInView ? finalPosition : getInitialPosition()}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 交错渐入动画容器
 * 子元素依次渐入
 * 
 * @example
 * ```tsx
 * <StaggerFadeIn staggerDelay={0.1}>
 *   <div>项目 1</div>
 *   <div>项目 2</div>
 *   <div>项目 3</div>
 * </StaggerFadeIn>
 * ```
 */
export function StaggerFadeIn({
  children,
  staggerDelay = 0.1,
  direction = 'up',
  distance = 30,
  duration = 0.6,
  once = true,
  threshold = 0.1,
  className = '',
}: ScrollFadeInProps & {
  staggerDelay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });

  // 根据方向计算初始位置
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      case 'fade':
        return {};
      default:
        return { y: distance };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: {
                  opacity: 0,
                  ...getInitialPosition(),
                },
                visible: {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  transition: {
                    duration,
                    ease: 'easeOut',
                  },
                },
              }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

/**
 * 缩放渐入动画
 * 
 * @example
 * ```tsx
 * <ScaleFadeIn>
 *   <div>内容</div>
 * </ScaleFadeIn>
 * ```
 */
export function ScaleFadeIn({
  children,
  scale = 0.8,
  duration = 0.6,
  delay = 0,
  once = true,
  threshold = 0.1,
  className = '',
}: Omit<ScrollFadeInProps, 'direction' | 'distance'> & {
  scale?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        scale,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              scale: 1,
            }
          : {
              opacity: 0,
              scale,
            }
      }
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 旋转渐入动画
 * 
 * @example
 * ```tsx
 * <RotateFadeIn>
 *   <div>内容</div>
 * </RotateFadeIn>
 * ```
 */
export function RotateFadeIn({
  children,
  rotate = -10,
  duration = 0.6,
  delay = 0,
  once = true,
  threshold = 0.1,
  className = '',
}: Omit<ScrollFadeInProps, 'direction' | 'distance'> & {
  rotate?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        rotate,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              rotate: 0,
            }
          : {
              opacity: 0,
              rotate,
            }
      }
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}
