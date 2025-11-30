/**
 * Performance Monitor Tests
 * 性能监控工具测试
 */

import { PerformanceMonitor, initPerformanceMonitor, getPerformanceMetrics } from '../performanceMonitor';

// Mock Performance API
const mockPerformance = {
  timing: {
    navigationStart: 0,
    loadEventEnd: 1000,
    domContentLoadedEventEnd: 500,
    responseEnd: 300,
    requestStart: 100,
  },
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => [{ duration: 100 }]),
};

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    // Reset singleton instance
    (PerformanceMonitor as any).instance = null;
    
    // Mock window.performance
    global.window = {
      performance: mockPerformance,
    } as any;
  });

  describe('getInstance', () => {
    it('应该返回单例实例', () => {
      const instance1 = PerformanceMonitor.getInstance();
      const instance2 = PerformanceMonitor.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('应该接受配置选项', () => {
      const instance = PerformanceMonitor.getInstance({
        enableConsoleLog: true,
        sampleRate: 0.5,
      });
      
      expect(instance).toBeDefined();
    });
  });

  describe('getMetrics', () => {
    it('应该返回性能指标对象', () => {
      const monitor = PerformanceMonitor.getInstance();
      const metrics = monitor.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });
  });

  describe('mark', () => {
    it('应该调用 performance.mark', () => {
      const monitor = PerformanceMonitor.getInstance();
      monitor.mark('test-mark');
      
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-mark');
    });
  });

  describe('measure', () => {
    it('应该测量两个标记之间的时间', () => {
      const monitor = PerformanceMonitor.getInstance();
      const duration = monitor.measure('test-measure', 'start', 'end');
      
      expect(mockPerformance.measure).toHaveBeenCalledWith('test-measure', 'start', 'end');
      expect(duration).toBe(100);
    });
  });

  describe('initPerformanceMonitor', () => {
    it('应该初始化并返回监控实例', () => {
      const monitor = initPerformanceMonitor({
        enableConsoleLog: false,
      });
      
      expect(monitor).toBeDefined();
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('应该返回当前性能指标', () => {
      initPerformanceMonitor();
      const metrics = getPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });
  });
});
