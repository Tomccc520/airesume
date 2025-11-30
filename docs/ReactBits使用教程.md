# React Bits 使用教程

## 简介

React Bits 是一个强大的 React 动画组件库，提供了 80+ 个生产就绪的动画组件。它专为现代 React 应用程序设计，具有高性能、TypeScript 支持和零配置的特点。

## 安装

### 基础安装

```bash
# npm
npm install @appletosolutions/reactbits --legacy-peer-deps

# yarn
yarn add @appletosolutions/reactbits

# pnpm
pnpm add @appletosolutions/reactbits
```

### 可选依赖

根据需要安装以下依赖：

```bash
# 3D 组件所需 (ModelViewer, Aurora 等)
npm install three @react-three/fiber @react-three/drei

# GSAP 动画组件所需 (Bounce, ScrollReveal 等)
npm install gsap

# 物理动画组件所需 (Ballpit 等)
npm install matter-js

# Framer Motion 组件所需 (可选)
npm install framer-motion
```

## 主要组件分类

### 1. 文本动画组件

#### SplitText - 文字分割动画
```jsx
import { SplitText } from '@appletosolutions/reactbits';

<SplitText 
  text="欢迎使用 React Bits"
  className="text-4xl font-bold"
  delay={100}
  animationType="fadeInUp"
/>
```

#### BlurText - 模糊文字效果
```jsx
import { BlurText } from '@appletosolutions/reactbits';

<BlurText 
  text="模糊渐现效果"
  className="text-2xl"
  blur={10}
  duration={1000}
/>
```

#### GradientText - 渐变文字
```jsx
import { GradientText } from '@appletosolutions/reactbits';

<GradientText 
  text="渐变文字效果"
  gradient="linear-gradient(45deg, #ff6b6b, #4ecdc4)"
  className="text-3xl font-bold"
/>
```

### 2. 交互动画组件

#### ClickSpark - 点击火花效果
```jsx
import { ClickSpark } from '@appletosolutions/reactbits';

<ClickSpark 
  sparkColor="#ff6b6b" 
  sparkCount={15} 
  sparkRadius={30}
>
  <button className="px-6 py-3 bg-blue-500 text-white rounded">
    点击我看火花！
  </button>
</ClickSpark>
```

#### StarBorder - 星星边框动画
```jsx
import { StarBorder } from '@appletosolutions/reactbits';

<StarBorder 
  color="#ffd700" 
  speed="2s"
  className="p-4"
>
  <div className="bg-gray-900 text-white p-6 rounded">
    ⭐ 高级功能
  </div>
</StarBorder>
```

#### Magnet - 磁性悬停效果
```jsx
import { Magnet } from '@appletosolutions/reactbits';

<Magnet 
  strength={0.3} 
  range={100}
>
  <div className="w-32 h-32 bg-purple-500 rounded-lg flex items-center justify-center text-white">
    悬停试试
  </div>
</Magnet>
```

### 3. 背景效果组件

#### Aurora - 极光背景
```jsx
import { Aurora } from '@appletosolutions/reactbits';

<div className="relative h-screen">
  <Aurora
    colorStops={["#ff6b6b", "#4ecdc4", "#45b7d1"]}
    amplitude={1.2}
    speed={0.8}
  />
  <div className="relative z-10">
    {/* 你的内容 */}
  </div>
</div>
```

#### Beams - 光束效果 (类似 LaserFlow)
```jsx
import { Beams } from '@appletosolutions/reactbits';

<div className="relative h-64">
  <Beams
    beamWidth={4}
    beamHeight={20}
    beamNumber={5}
    lightColor="#FF79C6"
    speed={1}
    noiseIntensity={0.3}
    scale={1}
    rotation={0}
  />
</div>
```

#### Particles - 粒子系统
```jsx
import { particles } from '@appletosolutions/reactbits';

<particles
  particleCount={150}
  particleColors={["#ff6b6b", "#4ecdc4"]}
  moveParticlesOnHover={true}
  particleSize={2}
  speed={0.5}
/>
```

### 4. 布局组件

#### AnimatedList - 动画列表
```jsx
import { AnimatedList } from '@appletosolutions/reactbits';

<AnimatedList
  items={[
    { id: 1, content: "项目 1" },
    { id: 2, content: "项目 2" },
    { id: 3, content: "项目 3" }
  ]}
  animationType="slideInLeft"
  stagger={100}
/>
```

#### Carousel - 轮播组件
```jsx
import { Carousel } from '@appletosolutions/reactbits';

<Carousel
  items={images}
  autoPlay={true}
  interval={3000}
  showDots={true}
  showArrows={true}
/>
```

## 在项目中的实际应用

### 示例：创建动画首页

```jsx
import React from 'react';
import { 
  Aurora, 
  SplitText, 
  ClickSpark, 
  StarBorder, 
  FadeContent,
  Beams 
} from '@appletosolutions/reactbits';

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* 背景效果 */}
      <Aurora 
        colorStops={["#667eea", "#764ba2"]} 
        className="absolute inset-0"
      />
      
      {/* 光束效果 */}
      <div className="absolute inset-0">
        <Beams
          beamWidth={2}
          beamHeight={10}
          beamNumber={3}
          lightColor="#FF79C6"
          speed={1}
          noiseIntensity={0.2}
        />
      </div>

      {/* 内容区域 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white">
        <FadeContent blur={true} duration={1200}>
          <SplitText 
            text="欢迎使用 React Bits"
            className="text-6xl font-bold mb-8"
            delay={100}
            animationType="fadeInUp"
          />
          
          <SplitText 
            text="80+ 个动画组件让你的应用更出色"
            className="text-xl mb-12 text-blue-200"
            delay={200}
          />

          <ClickSpark sparkColor="#ffd700" sparkCount={20}>
            <StarBorder color="#00d4ff" speed="2s">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-lg font-semibold">
                立即开始
              </button>
            </StarBorder>
          </ClickSpark>
        </FadeContent>
      </div>
    </div>
  );
}
```

## 性能优化建议

### 1. 按需导入
```jsx
// ✅ 推荐：按需导入
import { SplitText, ClickSpark } from '@appletosolutions/reactbits';

// ❌ 避免：全量导入
import * as ReactBits from '@appletosolutions/reactbits';
```

### 2. 条件渲染
```jsx
// 在移动设备上禁用复杂动画
const isMobile = window.innerWidth < 768;

{!isMobile && (
  <Aurora colorStops={["#ff6b6b", "#4ecdc4"]} />
)}
```

### 3. 懒加载
```jsx
import { lazy, Suspense } from 'react';

const HeavyAnimation = lazy(() => import('./HeavyAnimation'));

<Suspense fallback={<div>加载中...</div>}>
  <HeavyAnimation />
</Suspense>
```

## 常见问题解决

### 1. 依赖冲突
如果遇到依赖解析错误，使用 `--legacy-peer-deps` 参数：
```bash
npm install @appletosolutions/reactbits --legacy-peer-deps
```

### 2. TypeScript 错误
确保安装了正确的类型定义：
```bash
npm install --save-dev @types/three @types/matter-js
```

### 3. 构建大小优化
只安装你需要的依赖：
```bash
# 只使用文本动画，不需要安装 three.js
npm install @appletosolutions/reactbits
# 不安装 three @react-three/fiber @react-three/drei
```

## 总结

React Bits 提供了丰富的动画组件，可以显著提升你的 React 应用的视觉效果。通过合理使用这些组件，你可以创建出专业级的动画效果，同时保持良好的性能。

记住：
- 按需导入组件以优化包大小
- 在移动设备上适当减少动画复杂度
- 合理使用动画，避免过度使用影响用户体验
- 充分利用 TypeScript 支持获得更好的开发体验

更多详细信息请参考 [React Bits 官方文档](https://reactbits.dev)。