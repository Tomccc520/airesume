/**
 * 性能监控工具
 * 用于测量和上报页面性能指标，帮助监控和优化用户体验
 * 
 * 主要功能：
 * - 监控 Core Web Vitals（FCP、LCP、FID、CLS）
 * - 测量页面加载性能
 * - 上报性能数据到服务器
 * - 支持自定义性能标记
 */

export interface PerformanceMetrics {
  // 页面完整加载时间（从导航开始到 load 事件完成）
  pageLoadTime: number;
  // First Contentful Paint - 首次内容绘制时间
  fcp: number;
  // Largest Contentful Paint - 最大内容绘制时间
  lcp: number;
  // Time to Interactive - 可交互时间
  tti: number;
  // First Input Delay - 首次输入延迟
  fid: number;
  // Cumulative Layout Shift - 累积布局偏移
  cls: number;
  // 服务器连接时间
  connectTime: number;
  // DOM 就绪时间
  domReady: number;
  // 资源加载时间
  resourceLoadTime: number;
}

export interface PerformanceReportOptions {
  // 性能数据上报的 API 端点
  endpoint?: string;
  // 采样率（0-1），生产环境建议设置为 0.1（10%）以减少服务器负载
  sampleRate?: number;
  // 是否在控制台输出日志（生产环境应设为 false）
  enableConsoleLog?: boolean;
}

/**
 * 性能监控类（单例模式）
 * 负责收集、存储和上报各项性能指标
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  private options: PerformanceReportOptions;
  private observers: PerformanceObserver[] = [];

  private constructor(options: PerformanceReportOptions = {}) {
    this.options = {
      sampleRate: 1,
      enableConsoleLog: false,
      ...options,
    };
  }

  /**
   * 获取单例实例
   * @param options 配置选项
   * @returns PerformanceMonitor 实例
   */
  static getInstance(options?: PerformanceReportOptions): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(options);
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 初始化性能监控
   * 开始监听各项性能指标，并在页面加载完成后自动上报
   */
  init(): void {
    // 检查浏览器是否支持 Performance API
    if (typeof window === 'undefined' || !window.performance) {
      console.warn('Performance API 不支持，性能监控已禁用');
      return;
    }

    // 测量页面加载性能（使用 Navigation Timing API）
    this.measurePageLoad();

    // 监听 FCP（首次内容绘制）
    this.observeFCP();

    // 监听 LCP（最大内容绘制）
    this.observeLCP();

    // 监听 FID（首次输入延迟）
    this.observeFID();

    // 监听 CLS（累积布局偏移）
    this.observeCLS();

    // 页面加载完成后自动上报性能数据
    if (document.readyState === 'complete') {
      this.reportMetrics();
    } else {
      window.addEventListener('load', () => {
        // 延迟上报，确保所有指标都已收集
        setTimeout(() => this.reportMetrics(), 0);
      });
    }
  }

  /**
   * 测量页面加载时间
   * 使用 Navigation Timing API 计算各项加载指标
   */
  private measurePageLoad(): void {
    if (!window.performance || !window.performance.timing) {
      return;
    }

    const timing = window.performance.timing;

    // 使用 requestIdleCallback 或 setTimeout 延迟计算
    // 确保所有 timing 数据都已就绪
    const calculate = () => {
      const navigationStart = timing.navigationStart;
      const loadEventEnd = timing.loadEventEnd;
      const domContentLoadedEventEnd = timing.domContentLoadedEventEnd;
      const responseEnd = timing.responseEnd;
      const requestStart = timing.requestStart;

      // 计算页面完整加载时间
      if (loadEventEnd > 0) {
        this.metrics.pageLoadTime = loadEventEnd - navigationStart;
      }

      // 计算 DOM 就绪时间
      if (domContentLoadedEventEnd > 0) {
        this.metrics.domReady = domContentLoadedEventEnd - navigationStart;
      }

      // 计算服务器连接和响应时间
      if (responseEnd > 0 && requestStart > 0) {
        this.metrics.connectTime = responseEnd - requestStart;
      }

      // 计算资源加载时间（DOM 就绪后到完全加载的时间）
      if (loadEventEnd > 0 && domContentLoadedEventEnd > 0) {
        this.metrics.resourceLoadTime = loadEventEnd - domContentLoadedEventEnd;
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(calculate);
    } else {
      setTimeout(calculate, 0);
    }
  }

  /**
   * 观察 First Contentful Paint（首次内容绘制）
   * FCP 测量从页面开始加载到页面内容的任何部分在屏幕上完成渲染的时间
   * 良好标准：< 1.8s
   */
  private observeFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.log('FCP', entry.startTime);
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('FCP 监控不支持', e);
    }
  }

  /**
   * 观察 Largest Contentful Paint（最大内容绘制）
   * LCP 测量视口内可见的最大图像或文本块完成渲染的时间
   * 良好标准：< 2.5s
   */
  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };

        if (lastEntry) {
          // LCP 取 renderTime 或 loadTime 中的较大值
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
          this.log('LCP', this.metrics.lcp);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('LCP 监控不支持', e);
    }
  }

  /**
   * 观察 First Input Delay（首次输入延迟）
   * FID 测量从用户第一次与页面交互到浏览器实际能够响应交互的时间
   * 良好标准：< 100ms
   */
  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          const fidEntry = entry as PerformanceEntry & { processingStart?: number };
          if (fidEntry.processingStart) {
            this.metrics.fid = fidEntry.processingStart - entry.startTime;
            this.log('FID', this.metrics.fid);
          }
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('FID 监控不支持', e);
    }
  }

  /**
   * 观察 Cumulative Layout Shift（累积布局偏移）
   * CLS 测量页面整个生命周期内发生的所有意外布局偏移的总和
   * 良好标准：< 0.1
   */
  private observeCLS(): void {
    try {
      let clsValue = 0;

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          const layoutShiftEntry = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };

          // 只统计非用户输入导致的布局偏移
          // 用户输入（如点击、滚动）导致的偏移不计入 CLS
          if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
            clsValue += layoutShiftEntry.value;
            this.metrics.cls = clsValue;
            this.log('CLS', clsValue);
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('CLS 监控不支持', e);
    }
  }

  /**
   * 获取当前性能指标
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * 上报性能数据
   * 根据采样率决定是否上报，避免过多请求
   */
  async reportMetrics(): Promise<void> {
    // 采样率控制：生产环境建议设置为 0.1（10%）
    // 这样可以减少服务器负载，同时仍能获得足够的性能数据样本
    if (Math.random() > this.options.sampleRate!) {
      return;
    }

    const metrics = this.getMetrics();

    // 开发环境可以在控制台查看性能数据
    if (this.options.enableConsoleLog) {
      console.table(metrics);
    }

    // 如果配置了上报端点，发送数据到服务器
    if (this.options.endpoint) {
      try {
        await this.sendMetrics(metrics);
      } catch (error) {
        console.error('性能数据上报失败:', error);
      }
    }
  }

  /**
   * 发送性能数据到服务器
   * 优先使用 sendBeacon API，确保即使在页面卸载时也能成功发送
   */
  private async sendMetrics(metrics: Partial<PerformanceMetrics>): Promise<void> {
    if (!this.options.endpoint) return;

    const data = {
      metrics,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // 优先使用 sendBeacon API
    // 优点：不阻塞页面卸载，即使用户关闭页面也能发送成功
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(this.options.endpoint, blob);
    } else {
      // 降级到 fetch API（旧浏览器）
      await fetch(this.options.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        keepalive: true, // 保持连接，即使页面卸载
      });
    }
  }

  /**
   * 手动记录自定义性能标记
   * 用于测量特定操作的性能，如数据加载、图片处理等
   * @param name 标记名称
   */
  mark(name: string): void {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  }

  /**
   * 测量两个标记之间的时间
   * @param name 测量名称
   * @param startMark 开始标记
   * @param endMark 结束标记
   * @returns 时间差（毫秒），如果测量失败返回 null
   */
  measure(name: string, startMark: string, endMark: string): number | null {
    if (window.performance && window.performance.measure) {
      try {
        window.performance.measure(name, startMark, endMark);
        const measures = window.performance.getEntriesByName(name, 'measure');
        if (measures.length > 0) {
          return measures[0].duration;
        }
      } catch (e) {
        console.warn('性能测量失败:', e);
      }
    }
    return null;
  }

  /**
   * 清理所有性能观察器
   * 在组件卸载或不再需要监控时调用
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * 日志输出（仅在开发环境）
   */
  private log(metric: string, value: number): void {
    if (this.options.enableConsoleLog) {
      console.log(`[性能监控] ${metric}: ${value.toFixed(2)}ms`);
    }
  }
}

/**
 * 便捷函数：初始化性能监控
 * 
 * 使用示例：
 * ```typescript
 * // 开发环境
 * initPerformanceMonitor({ enableConsoleLog: true });
 * 
 * // 生产环境
 * initPerformanceMonitor({
 *   endpoint: '/api/performance',
 *   sampleRate: 0.1, // 10% 采样
 *   enableConsoleLog: false
 * });
 * ```
 */
export function initPerformanceMonitor(options?: PerformanceReportOptions): PerformanceMonitor {
  const monitor = PerformanceMonitor.getInstance(options);
  monitor.init();
  return monitor;
}

/**
 * 便捷函数：获取当前性能指标
 * @returns 性能指标对象
 */
export function getPerformanceMetrics(): Partial<PerformanceMetrics> {
  return PerformanceMonitor.getInstance().getMetrics();
}
