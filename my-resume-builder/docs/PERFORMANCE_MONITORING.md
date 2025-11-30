# 性能监控系统使用指南

> ⚠️ **文档更新通知 (2025-10-04)**  
> `PerformanceMonitorDisplay` 组件已被移除（未被实际使用）。  
> `usePerformanceMonitor` hook 仍然保留，可用于自定义性能监控实现。  
> 详情请查看 [代码清理报告](./CODE_CLEANUP_REPORT.md)

## 📊 系统概述

性能监控系统用于实时监控应用的性能表现，帮助你：
- ✅ 验证性能优化效果
- ✅ 发现性能瓶颈
- ✅ 监控真实用户体验
- ✅ 符合 Google Core Web Vitals 标准（影响 SEO）

## 🎯 监控的指标

### Core Web Vitals（核心网页指标）

这些是 Google 用来评估网页用户体验的关键指标：

| 指标 | 说明 | 良好标准 | 需要改进 | 差 |
|------|------|----------|----------|-----|
| **FCP** | 首次内容绘制 - 页面首次显示内容的时间 | < 1.8s | 1.8s - 3s | > 3s |
| **LCP** | 最大内容绘制 - 最大元素显示的时间 | < 2.5s | 2.5s - 4s | > 4s |
| **FID** | 首次输入延迟 - 用户首次交互的响应时间 | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** | 累积布局偏移 - 页面元素意外移动的程度 | < 0.1 | 0.1 - 0.25 | > 0.25 |

### 其他性能指标

- **页面加载时间**：完整加载所需时间
- **DOM 就绪时间**：DOM 解析完成时间
- **连接时间**：服务器响应时间
- **资源加载时间**：图片、CSS、JS 等资源加载时间

## 🚀 快速开始

### 1. 在应用入口初始化

```typescript
// src/app/layout.tsx
'use client';

import { useEffect } from 'react';
import { initPerformanceMonitor } from '@/utils/performanceMonitor';
import { getPerformanceConfig } from '@/config/performance.config';

export default function RootLayout({ children }) {
  useEffect(() => {
    // 根据环境自动选择配置
    initPerformanceMonitor(getPerformanceConfig());
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 2. 在组件中使用

```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

function MyComponent() {
  const { metrics } = usePerformanceMonitor({
    autoInit: true,
  });

  return (
    <div>
      <p>页面加载时间: {metrics.pageLoadTime?.toFixed(0)}ms</p>
      <p>FCP: {metrics.fcp?.toFixed(0)}ms</p>
      <p>LCP: {metrics.lcp?.toFixed(0)}ms</p>
    </div>
  );
}
```

## 🔧 环境配置

### 开发环境

```typescript
// 自动配置（已在 performance.config.ts 中设置）
{
  enableConsoleLog: true,  // 在控制台查看性能数据
  sampleRate: 1.0,         // 100% 采样
  endpoint: undefined      // 不上报到服务器
}
```

**开发环境特性：**
- ✅ 控制台实时显示性能数据
- ✅ 可使用 `<PerformanceMonitorDisplay />` 组件查看可视化面板
- ✅ 100% 采样，不会遗漏任何数据

### 生产环境

```typescript
// 自动配置（已在 performance.config.ts 中设置）
{
  enableConsoleLog: false, // 关闭控制台日志
  sampleRate: 0.1,         // 10% 采样（减少服务器负载）
  endpoint: '/api/performance' // 上报到 API
}
```

**生产环境特性：**
- ✅ 10% 采样率（每 10 个用户中采样 1 个）
- ✅ 自动上报到服务器
- ✅ 使用 sendBeacon API，不影响页面性能
- ✅ 即使用户关闭页面也能成功上报

## 📈 数据上报

### API 端点

性能数据会自动发送到 `/api/performance`，数据格式：

```json
{
  "metrics": {
    "pageLoadTime": 1234,
    "fcp": 890,
    "lcp": 1200,
    "fid": 50,
    "cls": 0.05,
    "domReady": 800,
    "connectTime": 200,
    "resourceLoadTime": 400
  },
  "timestamp": 1699999999999,
  "url": "https://example.com/editor",
  "userAgent": "Mozilla/5.0..."
}
```

### 数据存储建议

你可以将性能数据存储到：

1. **数据库**（推荐用于长期分析）
   ```typescript
   // src/app/api/performance/route.ts
   await db.performanceMetrics.create({
     data: {
       ...data.metrics,
       url: data.url,
       timestamp: new Date(data.timestamp),
     }
   });
   ```

2. **分析服务**（如 Google Analytics）
   ```typescript
   gtag('event', 'performance', {
     fcp: data.metrics.fcp,
     lcp: data.metrics.lcp,
   });
   ```

3. **监控平台**（如 Sentry、DataDog）
   ```typescript
   Sentry.captureMessage('Performance Metrics', {
     level: 'info',
     extra: data.metrics,
   });
   ```

## 🎨 开发环境可视化

在开发环境中，可以使用可视化组件查看性能数据：

```typescript
// src/app/layout.tsx
import { PerformanceMonitorDisplay } from '@/components/PerformanceMonitorDisplay';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {/* 仅在开发环境显示 */}
        <PerformanceMonitorDisplay />
      </body>
    </html>
  );
}
```

这会在页面右下角显示一个性能监控面板，点击可展开查看详细数据。

## 🔍 自定义性能测量

### 测量特定操作

```typescript
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

function ResumeEditor() {
  const { mark, measure } = usePerformanceMonitor();

  const handleExport = async () => {
    // 标记开始
    mark('export-start');
    
    await exportToPDF();
    
    // 标记结束
    mark('export-end');
    
    // 测量耗时
    const duration = measure('export-duration', 'export-start', 'export-end');
    console.log(`导出耗时: ${duration}ms`);
  };

  return <button onClick={handleExport}>导出 PDF</button>;
}
```

### 测量组件渲染性能

```typescript
import { useRenderPerformance } from '@/hooks/usePerformanceMonitor';

function HeavyComponent() {
  const { startMeasure, endMeasure, duration } = useRenderPerformance('HeavyComponent');
  
  useEffect(() => {
    startMeasure();
    // 组件初始化逻辑
    endMeasure();
  }, []);
  
  return <div>渲染耗时: {duration}ms</div>;
}
```

## 📊 性能分析建议

### 1. 定期检查性能报告

建议每周查看性能数据，关注：
- 平均 FCP、LCP 是否在良好范围内
- 是否有性能突然下降的情况
- 不同页面的性能差异

### 2. 设置性能告警

当性能指标超过阈值时发送告警：

```typescript
// src/app/api/performance/route.ts
if (data.metrics.lcp > 4000) {
  // 发送告警邮件或通知
  await sendAlert({
    type: 'performance',
    message: `LCP 超过 4s: ${data.metrics.lcp}ms`,
    url: data.url,
  });
}
```

### 3. A/B 测试性能优化

在优化前后对比性能数据，验证优化效果。

## ⚠️ 注意事项

### 生产环境必须配置

1. **设置采样率**：避免过多请求
   ```typescript
   sampleRate: 0.1 // 10% 采样
   ```

2. **关闭控制台日志**：避免泄露信息
   ```typescript
   enableConsoleLog: false
   ```

3. **移除可视化组件**：`<PerformanceMonitorDisplay />` 仅用于开发

### 浏览器兼容性

- 现代浏览器（Chrome、Firefox、Safari、Edge）完全支持
- 旧浏览器可能不支持某些 API，工具会自动降级
- 不支持的指标会显示为 `undefined`

### 性能影响

- 性能监控本身的开销极小（< 1ms）
- 使用 `sendBeacon` API 不会阻塞页面
- 采样率控制可进一步减少影响

## 🎯 性能优化目标

根据需求文档，应达到以下标准：

- ✅ FCP < 3s（需求 2.1）
- ✅ 页面交互准备 < 2s（需求 2.2）
- ✅ 输入响应 < 100ms（需求 2.3）
- ✅ 保持 60fps 流畅度（需求 2.6）

使用性能监控工具可以持续验证这些目标是否达成。

## 📚 相关文档

- [使用示例](./性能监控工具使用示例.md)
- [任务总结](./TASK_1_SUMMARY.md)
- [API 文档](../src/utils/performanceMonitor.ts)
- [配置说明](../src/config/performance.config.ts)
