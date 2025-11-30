/**
 * Performance Metrics API Endpoint
 * 性能指标上报接口
 */

import { NextRequest, NextResponse } from 'next/server';

export interface PerformanceReportData {
  metrics: {
    pageLoadTime?: number;
    fcp?: number;
    lcp?: number;
    tti?: number;
    fid?: number;
    cls?: number;
    connectTime?: number;
    domReady?: number;
    resourceLoadTime?: number;
  };
  timestamp: number;
  url: string;
  userAgent: string;
}

/**
 * POST /api/performance
 * 接收并处理性能指标数据
 */
export async function POST(request: NextRequest) {
  try {
    const data: PerformanceReportData = await request.json();

    // 验证数据
    if (!data.metrics || !data.timestamp) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // 在开发环境打印日志
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metrics Received:');
      console.log('URL:', data.url);
      console.log('Timestamp:', new Date(data.timestamp).toISOString());
      console.log('Metrics:', data.metrics);
    }

    // 这里可以将数据存储到数据库或发送到分析服务
    // 例如：
    // - 存储到 MongoDB/PostgreSQL
    // - 发送到 Google Analytics
    // - 发送到自定义分析平台
    // await saveMetricsToDatabase(data);
    // await sendToAnalytics(data);

    // 检查性能是否符合标准
    const warnings = checkPerformanceThresholds(data.metrics);
    
    return NextResponse.json({
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      message: 'Metrics received successfully',
    });
  } catch (error) {
    console.error('Error processing performance metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 检查性能指标是否超过阈值
 */
function checkPerformanceThresholds(metrics: PerformanceReportData['metrics']): string[] {
  const warnings: string[] = [];

  // FCP 阈值检查
  if (metrics.fcp && metrics.fcp > 3000) {
    warnings.push(`FCP (${metrics.fcp.toFixed(0)}ms) exceeds 3000ms threshold`);
  }

  // LCP 阈值检查
  if (metrics.lcp && metrics.lcp > 4000) {
    warnings.push(`LCP (${metrics.lcp.toFixed(0)}ms) exceeds 4000ms threshold`);
  }

  // FID 阈值检查
  if (metrics.fid && metrics.fid > 300) {
    warnings.push(`FID (${metrics.fid.toFixed(0)}ms) exceeds 300ms threshold`);
  }

  // CLS 阈值检查
  if (metrics.cls && metrics.cls > 0.25) {
    warnings.push(`CLS (${metrics.cls.toFixed(3)}) exceeds 0.25 threshold`);
  }

  // 页面加载时间检查
  if (metrics.pageLoadTime && metrics.pageLoadTime > 5000) {
    warnings.push(`Page load time (${metrics.pageLoadTime.toFixed(0)}ms) exceeds 5000ms threshold`);
  }

  return warnings;
}

/**
 * GET /api/performance
 * 获取性能统计信息（可选功能）
 */
export async function GET() {
  // 这里可以返回聚合的性能统计数据
  return NextResponse.json({
    message: 'Performance API is running',
    endpoints: {
      POST: 'Submit performance metrics',
    },
  });
}
