/**
 * 图片优化 Hook
 * 提供在 React 组件中使用图片优化功能的便捷方式
 */

import { useState, useCallback } from 'react';
import {
  ImageOptimizationService,
  ImageOptimizationOptions,
  ImageOptimizationResult,
} from '@/services/imageOptimization';

export interface UseImageOptimizationOptions extends ImageOptimizationOptions {
  autoOptimize?: boolean;
  onOptimized?: (result: ImageOptimizationResult) => void;
  onError?: (error: Error) => void;
}

export interface UseImageOptimizationReturn {
  optimizeImage: (file: File) => Promise<ImageOptimizationResult | null>;
  optimizeImages: (files: File[]) => Promise<ImageOptimizationResult[]>;
  optimizing: boolean;
  progress: number;
  result: ImageOptimizationResult | null;
  error: Error | null;
  reset: () => void;
}

export function useImageOptimization(
  options: UseImageOptimizationOptions = {}
): UseImageOptimizationReturn {
  const [optimizing, setOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImageOptimizationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const optimizeImage = useCallback(
    async (file: File): Promise<ImageOptimizationResult | null> => {
      try {
        setOptimizing(true);
        setProgress(0);
        setError(null);

        setProgress(30);

        const optimizationResult = await ImageOptimizationService.optimizeImage(
          file,
          options
        );

        setProgress(100);
        setResult(optimizationResult);

        if (options.onOptimized) {
          options.onOptimized(optimizationResult);
        }

        return optimizationResult;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('图片优化失败');
        setError(error);

        if (options.onError) {
          options.onError(error);
        }

        return null;
      } finally {
        setOptimizing(false);
      }
    },
    [options]
  );

  const optimizeImages = useCallback(
    async (files: File[]): Promise<ImageOptimizationResult[]> => {
      try {
        setOptimizing(true);
        setProgress(0);
        setError(null);

        const results: ImageOptimizationResult[] = [];
        const total = files.length;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const optimizationResult = await ImageOptimizationService.optimizeImage(
            file,
            options
          );
          results.push(optimizationResult);

          setProgress(Math.round(((i + 1) / total) * 100));
        }

        return results;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('批量优化失败');
        setError(error);

        if (options.onError) {
          options.onError(error);
        }

        return [];
      } finally {
        setOptimizing(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    optimizeImage,
    optimizeImages,
    optimizing,
    progress,
    result,
    error,
    reset,
  };
}

export function useQuickImageOptimization(
  options?: ImageOptimizationOptions
): (file: File) => Promise<ImageOptimizationResult | null> {
  const { optimizeImage } = useImageOptimization(options);
  return optimizeImage;
}
