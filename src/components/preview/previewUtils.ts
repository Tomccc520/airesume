/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-15
 * 
 * 预览面板工具函数
 * 纯函数实现，用于属性测试
 */

// A4 纸张常量 (mm)
export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297
export const A4_ASPECT_RATIO = A4_HEIGHT_MM / A4_WIDTH_MM // 1.414...

// A4 纸张像素尺寸 (96 DPI)
export const A4_WIDTH_PX = 794
export const A4_HEIGHT_PX = 1123

// 缩放边界
export const MIN_ZOOM = 50
export const MAX_ZOOM = 200

/**
 * 计算预览面板的纸张样式
 * 保持 A4 比例 (210:297)
 * 注意：不设置 backgroundColor/boxShadow/border，由 ResumePreview 组件自行处理
 */
export function calculatePaperStyle(zoom: number, _isDarkMode: boolean): {
  width: string
  aspectRatio: string
  transform: string
  transformOrigin: string
  transition: string
} {
  // isDarkMode 参数保留用于向后兼容，但不再使用
  void _isDarkMode
  
  return {
    width: `${A4_WIDTH_PX}px`,
    aspectRatio: `${A4_WIDTH_MM} / ${A4_HEIGHT_MM}`,
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease-out'
  }
}

/**
 * 验证缩放值是否在有效范围内
 */
export function clampZoom(zoom: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
}

/**
 * 验证页码是否有效
 */
export function clampPageNumber(page: number, totalPages: number): number {
  if (totalPages < 1) return 1
  return Math.max(1, Math.min(page, totalPages))
}

/**
 * 计算总页数
 * @param contentHeight - 内容高度（像素）
 * @param zoom - 缩放比例（百分比）
 * @returns 总页数（至少为1）
 */
export function calculateTotalPages(contentHeight: number, zoom: number = 100): number {
  if (contentHeight <= 0) return 1
  const scaledPageHeight = A4_HEIGHT_PX * (zoom / 100)
  return Math.max(1, Math.ceil(contentHeight / scaledPageHeight))
}

/**
 * 验证页码有效性
 * @param page - 当前页码
 * @param totalPages - 总页数
 * @returns 有效的页码
 */
export function validatePageNumber(page: number, totalPages: number): number {
  const safeTotalPages = Math.max(1, totalPages)
  if (page < 1) return 1
  if (page > safeTotalPages) return safeTotalPages
  return page
}
