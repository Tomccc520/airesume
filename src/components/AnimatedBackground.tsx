/**
 * AnimatedBackground 组件
 * 动态渐变背景，使用 CSS 和 Framer Motion 创建流畅的渐变动画
 * 性能优化：使用 CSS transform 和 GPU 加速
 */

'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

/**
 * 背景配置选项
 */
export interface AnimatedBackgroundProps {
  // 渐变颜色数组，默认蓝色系
  colors?: string[];
  // 动画持续时间（秒），默认 20
  duration?: number;
  // 是否启用动画，默认 true
  animate?: boolean;
  // 渐变方向，默认 'diagonal'
  direction?: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
  // 不透明度，默认 1
  opacity?: number;
  // 模糊效果强度，默认 0
  blur?: number;
  // 自定义类名
  className?: string;
}

/**
 * 默认渐变颜色（蓝色系）
 */
const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500 (循环)
];

/**
 * 动态渐变背景组件
 * 
 * @example
 * ```tsx
 * // 基础使用
 * <AnimatedBackground />
 * 
 * // 自定义颜色
 * <AnimatedBackground colors={['#ff0000', '#00ff00', '#0000ff']} />
 * 
 * // 径向渐变
 * <AnimatedBackground direction="radial" />
 * ```
 */
export default function AnimatedBackground({
  colors = DEFAULT_COLORS,
  duration = 20,
  animate = true,
  direction = 'diagonal',
  opacity = 1,
  blur = 0,
  className = '',
}: AnimatedBackgroundProps) {
  // 生成渐变样式
  const gradientStyle = useMemo(() => {
    const colorStops = colors.join(', ');
    
    switch (direction) {
      case 'horizontal':
        return `linear-gradient(90deg, ${colorStops})`;
      case 'vertical':
        return `linear-gradient(180deg, ${colorStops})`;
      case 'diagonal':
        return `linear-gradient(135deg, ${colorStops})`;
      case 'radial':
        return `radial-gradient(circle at center, ${colorStops})`;
      default:
        return `linear-gradient(135deg, ${colorStops})`;
    }
  }, [colors, direction]);

  // 性能优化：如果不需要动画，直接返回静态背景
  if (!animate) {
    return (
      <div 
        className={`absolute inset-0 overflow-hidden ${className}`}
        style={{ 
          opacity,
          background: gradientStyle,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      />
    );
  }

  return (
    <div 
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      {/* 主渐变层 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: gradientStyle,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          willChange: 'transform', // 提示浏览器优化
        }}
        animate={{
          // 使用 scale 和 rotate 创建动态效果
          // 避免使用 background-position，因为它不能被 GPU 加速
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 第二层渐变（增加深度） - 性能优化：减少一层 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors[0]}40, transparent 70%)`,
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: duration * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

/**
 * 预设主题背景
 */

// 蓝色科技风格
export function TechBlueBackground(props: Omit<AnimatedBackgroundProps, 'colors'>) {
  return (
    <AnimatedBackground
      colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#3b82f6']}
      {...props}
    />
  );
}

// 紫色梦幻风格
export function PurpleDreamBackground(props: Omit<AnimatedBackgroundProps, 'colors'>) {
  return (
    <AnimatedBackground
      colors={['#8b5cf6', '#ec4899', '#f59e0b', '#8b5cf6']}
      {...props}
    />
  );
}

// 绿色清新风格
export function GreenFreshBackground(props: Omit<AnimatedBackgroundProps, 'colors'>) {
  return (
    <AnimatedBackground
      colors={['#10b981', '#06b6d4', '#3b82f6', '#10b981']}
      {...props}
    />
  );
}

// 橙色活力风格
export function OrangeEnergyBackground(props: Omit<AnimatedBackgroundProps, 'colors'>) {
  return (
    <AnimatedBackground
      colors={['#f59e0b', '#ef4444', '#ec4899', '#f59e0b']}
      {...props}
    />
  );
}

// 灰色专业风格
export function GrayProfessionalBackground(props: Omit<AnimatedBackgroundProps, 'colors'>) {
  return (
    <AnimatedBackground
      colors={['#6b7280', '#4b5563', '#374151', '#6b7280']}
      {...props}
    />
  );
}

/**
 * 粒子背景组件（轻量级）
 * 使用 CSS 动画而非 Canvas，性能更好
 */
export function ParticleBackground({
  particleCount = 20,
  color = '#3b82f6',
  opacity = 0.3,
}: {
  particleCount?: number;
  color?: string;
  opacity?: number;
}) {
  // 生成随机粒子位置和动画参数
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2, // 2-6px
      duration: Math.random() * 10 + 10, // 10-20s
      delay: Math.random() * 5, // 0-5s
    }));
  }, [particleCount]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [opacity, opacity * 0.5, opacity],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * 网格背景组件
 * 科技感网格背景
 */
export function GridBackground({
  gridSize = 50,
  color = '#3b82f6',
  opacity = 0.1,
}: {
  gridSize?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        opacity,
      }}
    />
  );
}

/**
 * 组合背景组件
 * 结合渐变、粒子和网格效果
 */
export function CombinedBackground({
  showParticles = true,
  showGrid = false,
  ...backgroundProps
}: AnimatedBackgroundProps & {
  showParticles?: boolean;
  showGrid?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatedBackground {...backgroundProps} />
      {showParticles && <ParticleBackground />}
      {showGrid && <GridBackground />}
    </div>
  );
}
