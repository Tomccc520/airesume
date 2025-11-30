/**
 * usePerformanceMonitor Hook
 * React Hook for monitoring and reporting performance metrics
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  PerformanceMonitor,
  PerformanceMetrics,
  PerformanceReportOptions,
  initPerformanceMonitor,
} from '@/utils/performanceMonitor';

export interface UsePerformanceMonitorOptions extends PerformanceReportOptions {
  // 是否自动初始化
  autoInit?: boolean;
  // 是否在组件卸载时清理
  autoCleanup?: boolean;
  // 性能指标更新回调
  onMetricsUpdate?: (metrics: Partial<PerformanceMetrics>) => void;
}

export interface UsePerformanceMonitorReturn {
  // 当前性能指标
  metrics: Partial<PerformanceMetrics>;
  // 是否正在监控
  isMonitoring: boolean;
  // 手动开始监控
  startMonitoring: () => void;
  // 手动停止监控
  stopMonitoring: () => void;
  // 手动上报指标
  reportMetrics: () => Promise<void>;
  // 标记性能点
  mark: (name: string) => void;
  // 测量性能
  measure: (name: string, startMark: string, endMark: string) => number | null;
  // 刷新指标
  refreshMetrics: () => void;
}

/**
 * 性能监控 Hook
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { metrics, isMonitoring } = usePerformanceMonitor({
 *     autoInit: true,
 *     enableConsoleLog: true,
 *     onMetricsUpdate: (metrics) => {
 *       console.log('Metrics updated:', metrics);
 *     }
 *   });
 * 
 *   return (
 *     <div>
 *       <p>FCP: {metrics.fcp?.toFixed(2)}ms</p>
 *       <p>LCP: {metrics.lcp?.toFixed(2)}ms</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePerformanceMonitor(
  options: UsePerformanceMonitorOptions = {}
): UsePerformanceMonitorReturn {
  const {
    autoInit = true,
    autoCleanup = true,
    onMetricsUpdate,
    ...monitorOptions
  } = options;

  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 刷新性能指标
   */
  const refreshMetrics = useCallback(() => {
    if (monitorRef.current) {
      const currentMetrics = monitorRef.current.getMetrics();
      setMetrics(currentMetrics);
      
      if (onMetricsUpdate) {
        onMetricsUpdate(currentMetrics);
      }
    }
  }, [onMetricsUpdate]);

  /**
   * 开始监控
   */
  const startMonitoring = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (!monitorRef.current) {
      monitorRef.current = initPerformanceMonitor(monitorOptions);
    }

    setIsMonitoring(true);

    // 定期更新指标（每秒）
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      refreshMetrics();
    }, 1000);

    // 立即获取一次指标
    refreshMetrics();
  }, [monitorOptions, refreshMetrics]);

  /**
   * 停止监控
   */
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (monitorRef.current && autoCleanup) {
      monitorRef.current.cleanup();
      monitorRef.current = null;
    }

    setIsMonitoring(false);
  }, [autoCleanup]);

  /**
   * 手动上报指标
   */
  const reportMetrics = useCallback(async () => {
    if (monitorRef.current) {
      await monitorRef.current.reportMetrics();
    }
  }, []);

  /**
   * 标记性能点
   */
  const mark = useCallback((name: string) => {
    if (monitorRef.current) {
      monitorRef.current.mark(name);
    }
  }, []);

  /**
   * 测量性能
   */
  const measure = useCallback((name: string, startMark: string, endMark: string) => {
    if (monitorRef.current) {
      return monitorRef.current.measure(name, startMark, endMark);
    }
    return null;
  }, []);

  /**
   * 自动初始化
   */
  useEffect(() => {
    if (autoInit) {
      startMonitoring();
    }

    return () => {
      if (autoCleanup) {
        stopMonitoring();
      }
    };
  }, [autoInit, autoCleanup, startMonitoring, stopMonitoring]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    reportMetrics,
    mark,
    measure,
    refreshMetrics,
  };
}

/**
 * 简化版 Hook - 仅用于显示性能指标
 * 
 * @example
 * ```tsx
 * function PerformanceDisplay() {
 *   const metrics = usePerformanceMetrics();
 *   
 *   return (
 *     <div>
 *       {metrics.fcp && <p>FCP: {metrics.fcp.toFixed(2)}ms</p>}
 *       {metrics.lcp && <p>LCP: {metrics.lcp.toFixed(2)}ms</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePerformanceMetrics(): Partial<PerformanceMetrics> {
  const { metrics } = usePerformanceMonitor({
    autoInit: true,
    enableConsoleLog: false,
  });

  return metrics;
}

/**
 * Hook for measuring component render performance
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { startMeasure, endMeasure, duration } = useRenderPerformance('MyComponent');
 *   
 *   useEffect(() => {
 *     startMeasure();
 *     // ... component logic
 *     endMeasure();
 *   }, []);
 *   
 *   return <div>Render time: {duration}ms</div>;
 * }
 * ```
 */
export function useRenderPerformance(componentName: string) {
  const [duration, setDuration] = useState<number | null>(null);
  const { mark, measure } = usePerformanceMonitor({ autoInit: true });

  const startMeasure = useCallback(() => {
    mark(`${componentName}-start`);
  }, [componentName, mark]);

  const endMeasure = useCallback(() => {
    mark(`${componentName}-end`);
    const measuredDuration = measure(
      `${componentName}-render`,
      `${componentName}-start`,
      `${componentName}-end`
    );
    if (measuredDuration !== null) {
      setDuration(measuredDuration);
    }
  }, [componentName, mark, measure]);

  return {
    startMeasure,
    endMeasure,
    duration,
  };
}
