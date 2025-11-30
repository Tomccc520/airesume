/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-04
 * 
 * 图片工具函数
 */

/**
 * 生成简单的模糊占位符 Data URL
 * @param width 宽度
 * @param height 高度
 * @param color 颜色（可选）
 * @returns Base64 编码的 SVG Data URL
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10,
  color: string = '#e5e7eb'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>
  `
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * 生成渐变模糊占位符 Data URL
 * @param width 宽度
 * @param height 高度
 * @param colors 渐变颜色数组
 * @returns Base64 编码的 SVG Data URL
 */
export function generateGradientBlurDataURL(
  width: number = 10,
  height: number = 10,
  colors: string[] = ['#e5e7eb', '#d1d5db']
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          ${colors.map((color, index) => 
            `<stop offset="${(index / (colors.length - 1)) * 100}%" style="stop-color:${color};stop-opacity:1" />`
          ).join('')}
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
    </svg>
  `
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * 检查图片 URL 类型
 * @param url 图片 URL
 * @returns 图片类型信息
 */
export function getImageType(url: string): {
  isDataUrl: boolean
  isExternalUrl: boolean
  isLocalUrl: boolean
} {
  const isDataUrl = url.startsWith('data:')
  const isExternalUrl = url.startsWith('http://') || url.startsWith('https://')
  const isLocalUrl = !isDataUrl && !isExternalUrl

  return {
    isDataUrl,
    isExternalUrl,
    isLocalUrl
  }
}

/**
 * 获取图片文件大小（字节）
 * @param dataUrl Data URL 格式的图片
 * @returns 文件大小（字节）
 */
export function getDataUrlSize(dataUrl: string): number {
  if (!dataUrl.startsWith('data:')) {
    return 0
  }

  // 移除 data URL 前缀
  const base64String = dataUrl.split(',')[1]
  if (!base64String) {
    return 0
  }

  // Base64 编码后的大小约为原始大小的 4/3
  // 计算原始大小
  const padding = (base64String.match(/=/g) || []).length
  const base64Length = base64String.length
  return Math.floor((base64Length * 3) / 4) - padding
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 验证图片 URL 是否有效
 * @param url 图片 URL
 * @returns 是否有效
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false
  
  const { isDataUrl, isExternalUrl, isLocalUrl } = getImageType(url)
  
  // Data URL 验证
  if (isDataUrl) {
    return url.startsWith('data:image/')
  }
  
  // 外部 URL 验证
  if (isExternalUrl) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  // 本地 URL 验证
  if (isLocalUrl) {
    return url.startsWith('/') || url.startsWith('./')
  }
  
  return false
}
