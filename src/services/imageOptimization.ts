/**
 * 图片优化服务
 * 提供图片压缩、尺寸调整、格式转换等功能
 * 用于优化简历中的头像和图片，减少文件大小，提升加载速度
 */

/**
 * 图片优化选项
 */
export interface ImageOptimizationOptions {
  // 最大宽度（像素）
  maxWidth?: number;
  // 最大高度（像素）
  maxHeight?: number;
  // 图片质量（0-1），默认 0.8
  quality?: number;
  // 目标格式，默认自动选择最优格式
  format?: 'jpeg' | 'png' | 'webp' | 'auto';
  // 是否保持宽高比，默认 true
  maintainAspectRatio?: boolean;
}

/**
 * 图片优化结果
 */
export interface ImageOptimizationResult {
  // 优化后的 Blob 对象
  blob: Blob;
  // 优化后的 Data URL
  dataUrl: string;
  // 原始文件大小（字节）
  originalSize: number;
  // 优化后文件大小（字节）
  optimizedSize: number;
  // 压缩率（百分比）
  compressionRatio: number;
  // 图片宽度
  width: number;
  // 图片高度
  height: number;
  // 图片格式
  format: string;
}

/**
 * 图片优化服务类
 */
export class ImageOptimizationService {
  // 默认配置
  private static readonly DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.8,
    format: 'auto',
    maintainAspectRatio: true,
  };

  /**
   * 优化图片
   * @param file 原始图片文件
   * @param options 优化选项
   * @returns 优化结果
   */
  static async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<ImageOptimizationResult> {
    // 合并配置
    const config = { ...this.DEFAULT_OPTIONS, ...options };

    // 验证文件类型
    if (!this.isValidImageType(file.type)) {
      throw new Error(`不支持的图片格式: ${file.type}`);
    }

    // 加载图片
    const img = await this.loadImage(file);

    // 计算目标尺寸
    const { width, height } = this.calculateTargetSize(
      img.width,
      img.height,
      config.maxWidth,
      config.maxHeight,
      config.maintainAspectRatio
    );

    // 确定输出格式
    const outputFormat = this.determineOutputFormat(file.type, config.format);

    // 压缩图片
    const { blob, dataUrl } = await this.compressImage(
      img,
      width,
      height,
      outputFormat,
      config.quality
    );

    // 计算压缩率
    const originalSize = file.size;
    const optimizedSize = blob.size;
    const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

    return {
      blob,
      dataUrl,
      originalSize,
      optimizedSize,
      compressionRatio,
      width,
      height,
      format: outputFormat,
    };
  }

  /**
   * 批量优化图片
   * @param files 图片文件数组
   * @param options 优化选项
   * @returns 优化结果数组
   */
  static async optimizeImages(
    files: File[],
    options: ImageOptimizationOptions = {}
  ): Promise<ImageOptimizationResult[]> {
    const results = await Promise.all(
      files.map((file) => this.optimizeImage(file, options))
    );
    return results;
  }

  /**
   * 转换图片格式
   * @param file 原始图片文件
   * @param targetFormat 目标格式
   * @param quality 质量（0-1）
   * @returns 转换后的 Blob
   */
  static async convertFormat(
    file: File,
    targetFormat: 'jpeg' | 'png' | 'webp',
    quality: number = 0.9
  ): Promise<Blob> {
    const img = await this.loadImage(file);
    const { blob } = await this.compressImage(
      img,
      img.width,
      img.height,
      targetFormat,
      quality
    );
    return blob;
  }

  /**
   * 调整图片尺寸
   * @param file 原始图片文件
   * @param width 目标宽度
   * @param height 目标高度
   * @returns 调整后的 Blob
   */
  static async resizeImage(
    file: File,
    width: number,
    height: number
  ): Promise<Blob> {
    const img = await this.loadImage(file);
    const outputFormat = this.determineOutputFormat(file.type, 'auto');
    const { blob } = await this.compressImage(
      img,
      width,
      height,
      outputFormat,
      0.9
    );
    return blob;
  }

  /**
   * 检查浏览器是否支持 WebP
   * @returns 是否支持 WebP
   */
  static supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * 验证图片类型
   * @param mimeType MIME 类型
   * @returns 是否为有效的图片类型
   */
  private static isValidImageType(mimeType: string): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(mimeType);
  }

  /**
   * 加载图片
   * @param file 图片文件
   * @returns HTMLImageElement
   */
  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('图片加载失败'));
      };

      img.src = url;
    });
  }

  /**
   * 计算目标尺寸
   * @param originalWidth 原始宽度
   * @param originalHeight 原始高度
   * @param maxWidth 最大宽度
   * @param maxHeight 最大高度
   * @param maintainAspectRatio 是否保持宽高比
   * @returns 目标尺寸
   */
  private static calculateTargetSize(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean
  ): { width: number; height: number } {
    // 如果图片已经小于最大尺寸，保持原尺寸
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    if (!maintainAspectRatio) {
      return { width: maxWidth, height: maxHeight };
    }

    // 保持宽高比缩放
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio),
    };
  }

  /**
   * 确定输出格式
   * @param originalType 原始 MIME 类型
   * @param preferredFormat 首选格式
   * @returns 输出格式
   */
  private static determineOutputFormat(
    originalType: string,
    preferredFormat: 'jpeg' | 'png' | 'webp' | 'auto'
  ): 'jpeg' | 'png' | 'webp' {
    // 如果指定了格式且不是 auto，直接返回
    if (preferredFormat !== 'auto') {
      return preferredFormat;
    }

    // 自动选择最优格式
    // 优先使用 WebP（如果浏览器支持）
    if (this.supportsWebP()) {
      return 'webp';
    }

    // PNG 图片保持 PNG 格式（支持透明度）
    if (originalType === 'image/png') {
      return 'png';
    }

    // 其他情况使用 JPEG
    return 'jpeg';
  }

  /**
   * 压缩图片
   * @param img 图片元素
   * @param width 目标宽度
   * @param height 目标高度
   * @param format 输出格式
   * @param quality 质量
   * @returns Blob 和 Data URL
   */
  private static compressImage(
    img: HTMLImageElement,
    width: number,
    height: number,
    format: 'jpeg' | 'png' | 'webp',
    quality: number
  ): Promise<{ blob: Blob; dataUrl: string }> {
    return new Promise((resolve, reject) => {
      // 创建 Canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法获取 Canvas 上下文'));
        return;
      }

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height);

      // 确定 MIME 类型
      const mimeType = `image/${format}`;

      // 转换为 Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('图片压缩失败'));
            return;
          }

          // 生成 Data URL
          const dataUrl = canvas.toDataURL(mimeType, quality);

          resolve({ blob, dataUrl });
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * 获取图片信息（不加载完整图片）
   * @param file 图片文件
   * @returns 图片信息
   */
  static async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
  }> {
    const img = await this.loadImage(file);
    return {
      width: img.width,
      height: img.height,
      size: file.size,
      type: file.type,
    };
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化后的字符串
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

/**
 * 便捷函数：优化单张图片
 * @param file 图片文件
 * @param options 优化选项
 * @returns 优化结果
 */
export async function optimizeImage(
  file: File,
  options?: ImageOptimizationOptions
): Promise<ImageOptimizationResult> {
  return ImageOptimizationService.optimizeImage(file, options);
}

/**
 * 便捷函数：批量优化图片
 * @param files 图片文件数组
 * @param options 优化选项
 * @returns 优化结果数组
 */
export async function optimizeImages(
  files: File[],
  options?: ImageOptimizationOptions
): Promise<ImageOptimizationResult[]> {
  return ImageOptimizationService.optimizeImages(files, options);
}

/**
 * 便捷函数：转换图片为 WebP 格式
 * @param file 图片文件
 * @param quality 质量（0-1）
 * @returns WebP 格式的 Blob
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.9
): Promise<Blob> {
  return ImageOptimizationService.convertFormat(file, 'webp', quality);
}
