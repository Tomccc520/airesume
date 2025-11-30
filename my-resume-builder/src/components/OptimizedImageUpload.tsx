/**
 * 优化图片上传组件
 * 自动压缩和优化上传的图片
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { ImageOptimizationService } from '@/services/imageOptimization';

export interface OptimizedImageUploadProps {
  // 上传完成回调（返回优化后的图片）
  onUpload?: (dataUrl: string, blob: Blob) => void;
  // 最大宽度
  maxWidth?: number;
  // 最大高度
  maxHeight?: number;
  // 图片质量（0-1）
  quality?: number;
  // 当前图片 URL（用于显示预览）
  currentImage?: string;
  // 自定义类名
  className?: string;
  // 是否显示优化信息
  showOptimizationInfo?: boolean;
  // 最大文件大小（字节），默认 10MB
  maxFileSize?: number;
  // 是否显示压缩进度
  showProgress?: boolean;
}

export function OptimizedImageUpload({
  onUpload,
  maxWidth = 2000, // 增加默认尺寸
  maxHeight = 2000,
  quality = 1, // 默认不压缩
  currentImage,
  className = '',
  showOptimizationInfo = false, // 默认不显示优化信息
  maxFileSize = 10 * 1024 * 1024, // 默认 10MB
  showProgress = false, // 默认不显示进度
}: OptimizedImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { optimizeImage, optimizing, result, error } = useImageOptimization({
    maxWidth,
    maxHeight,
    quality,
    format: 'auto',
    onOptimized: (result) => {
      // 设置预览
      setPreview(result.dataUrl);
      setUploadProgress(100);
      
      // 调用上传回调
      if (onUpload) {
        onUpload(result.dataUrl, result.blob);
      }
      
      // 重置进度
      setTimeout(() => setUploadProgress(0), 1000);
    },
  });

  /**
   * 处理文件选择
   */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
      alert(`图片文件过大，请选择小于 ${maxSizeMB}MB 的图片`);
      return;
    }

    // 模拟压缩进度
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // 优化图片
    try {
      await optimizeImage(file);
      clearInterval(progressInterval);
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  };

  /**
   * 触发文件选择
   */
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 移除图片
   */
  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onUpload) {
      onUpload('', new Blob());
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 预览区域 */}
      <div className="relative group">
        {preview ? (
          <div className="relative inline-block">
            <Image
              src={preview}
              alt="预览"
              width={80}
              height={80}
              className="w-24 h-24 object-cover rounded-2xl border-2 border-white/50 shadow-lg shadow-blue-900/10 transition-transform duration-300 group-hover:scale-105"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all shadow-md hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
              title="移除图片"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={handleClick}
            disabled={optimizing}
            className="w-24 h-24 border-2 border-dashed border-gray-300/60 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500/50 hover:bg-blue-50/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white/30 backdrop-blur-sm group"
          >
            {optimizing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-xs text-blue-600 mt-2 font-medium">
                  优化中...
                </span>
              </>
            ) : (
              <>
                <div className="p-2 bg-blue-50/50 rounded-lg group-hover:bg-blue-100/50 transition-colors mb-1">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="text-xs text-gray-500 font-medium group-hover:text-blue-600 transition-colors">
                  上传
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 压缩进度条 */}
      {showProgress && optimizing && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-gray-600">压缩进度</span>
            <span className="text-blue-600">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 优化信息 */}
      {showOptimizationInfo && result && (
        <div className="text-xs space-y-1 bg-green-50/50 border border-green-100 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-green-700 font-bold mb-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>图片已优化</span>
          </div>
          <div className="text-gray-600 space-y-0.5 pl-5 font-medium">
            <div className="flex justify-between">
              <span>原始:</span>
              <span>{ImageOptimizationService.formatFileSize(result.originalSize)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>优化后:</span>
              <span>{ImageOptimizationService.formatFileSize(result.optimizedSize)}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>压缩率:</span>
              <span>{result.compressionRatio.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50/50 border border-red-100 rounded-xl p-3 backdrop-blur-sm flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error.message}
        </div>
      )}

      {/* 提示信息 */}
      <div className="text-xs text-gray-400 text-center font-medium">
        支持 JPG、PNG、WebP，最大 {(maxFileSize / (1024 * 1024)).toFixed(0)}MB
      </div>
    </div>
  );
}
