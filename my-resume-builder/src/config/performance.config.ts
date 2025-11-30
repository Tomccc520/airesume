/**
 * 性能监控配置
 * 根据环境自动选择合适的配置
 */

import { PerformanceReportOptions } from '@/utils/performanceMonitor';

/**
 * 开发环境配置
 * - 启用控制台日志，方便调试
 * - 100% 采样率
 * - 不上报到服务器
 */
const developmentConfig: PerformanceReportOptions = {
  enableConsoleLog: true,
  sampleRate: 1.0,
  endpoint: undefined, // 开发环境不上报
};

/**
 * 生产环境配置
 * - 关闭控制台日志
 * - 10% 采样率（减少服务器负载）
 * - 上报到 API 端点
 */
const productionConfig: PerformanceReportOptions = {
  enableConsoleLog: false,
  sampleRate: 0.1, // 只采样 10% 的用户
  endpoint: '/api/performance',
};

/**
 * 测试环境配置
 */
const testConfig: PerformanceReportOptions = {
  enableConsoleLog: false,
  sampleRate: 0.5, // 测试环境采样 50%
  endpoint: '/api/performance',
};

/**
 * 获取当前环境的性能监控配置
 */
export function getPerformanceConfig(): PerformanceReportOptions {
  const env = process.env.NODE_ENV;

  switch (env) {
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}

/**
 * 性能阈值配置
 * 用于判断性能是否达标
 */
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals 标准
  FCP: {
    good: 1800, // < 1.8s 为良好
    needsImprovement: 3000, // 1.8s - 3s 需要改进
    // > 3s 为差
  },
  LCP: {
    good: 2500, // < 2.5s 为良好
    needsImprovement: 4000, // 2.5s - 4s 需要改进
    // > 4s 为差
  },
  FID: {
    good: 100, // < 100ms 为良好
    needsImprovement: 300, // 100ms - 300ms 需要改进
    // > 300ms 为差
  },
  CLS: {
    good: 0.1, // < 0.1 为良好
    needsImprovement: 0.25, // 0.1 - 0.25 需要改进
    // > 0.25 为差
  },
  // 其他指标
  PAGE_LOAD: {
    good: 3000, // < 3s 为良好
    needsImprovement: 5000, // 3s - 5s 需要改进
    // > 5s 为差
  },
} as const;

/**
 * 判断性能指标等级
 * @param metric 指标名称
 * @param value 指标值
 * @returns 'good' | 'needs-improvement' | 'poor'
 */
export function getPerformanceGrade(
  metric: keyof typeof PERFORMANCE_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[metric];

  if (value < threshold.good) {
    return 'good';
  } else if (value < threshold.needsImprovement) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}
