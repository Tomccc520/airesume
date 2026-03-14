/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-13
 */

export type ResumeExportFormat = 'pdf' | 'png' | 'jpg'

export type ResumeExportStep =
  | 'preparing-styles'
  | 'loading-fonts'
  | 'rendering-page'
  | 'generating-file'

interface ResumeExportServiceOptions {
  format: ResumeExportFormat
  element: HTMLElement
  fileName: string
  onStep?: (step: ResumeExportStep) => void
  onProgress?: (progress: number) => void
  logger?: (...args: unknown[]) => void
}

interface ResumeJsonExportOptions<T> {
  resumeData: T
  resumeName: string
  fileName?: string
}

const A4_WIDTH_PX = 612
const A4_HEIGHT_FALLBACK_PX = 792
const INVALID_FILENAME_REGEXP = /[\\/:*?"<>|]/g

/**
 * 执行简历导出主流程
 * 统一封装导出步骤，确保页面与按钮导出行为一致
 */
export async function exportResumeFile({
  format,
  element,
  fileName,
  onStep,
  onProgress,
  logger
}: ResumeExportServiceOptions): Promise<void> {
  const debugLog = logger ?? (() => undefined)

  onStep?.('preparing-styles')
  onProgress?.(10)
  onStep?.('loading-fonts')
  onProgress?.(20)

  await document.fonts.ready.catch(() => {
    debugLog('⚠️ 字体加载超时')
  })
  onProgress?.(30)

  onStep?.('rendering-page')
  onProgress?.(40)
  const canvas = await captureResumeCanvas(element, debugLog)
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas尺寸为0，无法导出')
  }
  onProgress?.(70)

  onStep?.('generating-file')
  onProgress?.(80)

  if (format === 'pdf') {
    await exportPdf(canvas, fileName, onProgress)
    return
  }

  if (format === 'png') {
    downloadCanvas(canvas, fileName, 'image/png')
    return
  }

  downloadCanvas(canvas, fileName, 'image/jpeg', 0.95)
}

/**
 * 导出简历 JSON 数据
 * 将编辑器中的简历对象序列化并下载到本地
 */
export function exportResumeJsonFile<T>({
  resumeData,
  resumeName,
  fileName
}: ResumeJsonExportOptions<T>): void {
  const normalizedResumeName = normalizeFileName(resumeName || '简历')
  const resolvedFileName = fileName || `${normalizedResumeName}_${new Date().toISOString().split('T')[0]}.json`
  const jsonContent = JSON.stringify(resumeData, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' })
  downloadBlob(blob, resolvedFileName)
}

/**
 * 捕获简历区域为 Canvas
 * 自动处理 transform 清理与导出后样式恢复
 */
async function captureResumeCanvas(
  element: HTMLElement,
  logger: (...args: unknown[]) => void
): Promise<HTMLCanvasElement> {
  const originalTransform = element.style.transform
  const originalScale = element.style.scale

  const parentElements: HTMLElement[] = []
  const parentTransforms: string[] = []
  let parent = element.parentElement
  while (parent) {
    parentElements.push(parent)
    parentTransforms.push(parent.style.transform || '')
    parent = parent.parentElement
  }

  try {
    element.style.transform = 'none'
    element.style.scale = '1'
    parentElements.forEach((item) => {
      item.style.transform = 'none'
    })

    element.classList.add('exporting')
    const _forceReflow = element.offsetHeight
    await waitForNextFrame()

    const rect = element.getBoundingClientRect()
    const width = A4_WIDTH_PX
    const height = element.scrollHeight || rect.height || A4_HEIGHT_FALLBACK_PX
    logger('📐 使用尺寸:', { width, height })

    const html2canvas = (await import('html2canvas')).default
    logger('🎨 开始生成canvas...')

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width,
      height,
      logging: true,
      imageTimeout: 15000,
      onclone: (_clonedDoc, clonedElement) => {
        logger('🔄 处理克隆元素...')
        clonedElement.style.width = `${width}px`
        clonedElement.style.minHeight = `${height}px`
        clonedElement.style.transform = 'none'
        clonedElement.style.margin = '0'

        const buttonsToRemove = clonedElement.querySelectorAll('button, .no-export, [data-no-export]')
        buttonsToRemove.forEach((node) => node.remove())
        logger('🗑️ 移除了', buttonsToRemove.length, '个按钮')

        const pageBreakLines = clonedElement.querySelectorAll('[style*="dashed"]')
        pageBreakLines.forEach((line) => line.remove())
        logger('✅ 克隆元素处理完成')
      }
    })

    logger('✅ Canvas生成完成:', { width: canvas.width, height: canvas.height })
    return canvas
  } finally {
    element.style.transform = originalTransform
    element.style.scale = originalScale
    element.classList.remove('exporting')
    parentElements.forEach((item, index) => {
      item.style.transform = parentTransforms[index]
    })
  }
}

/**
 * 导出 PDF（支持自动分页）
 * 通过切片 Canvas 避免内容截断
 */
async function exportPdf(
  canvas: HTMLCanvasElement,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pdfWidth = 210
  const pdfHeight = 297
  const margin = 10
  const contentWidth = pdfWidth - margin * 2
  const contentHeight = pdfHeight - margin * 2
  const pxToMmScale = contentWidth / canvas.width
  const pageHeightPx = Math.floor(contentHeight / pxToMmScale)

  let offsetY = 0
  let pageIndex = 0
  const totalPages = Math.ceil(canvas.height / pageHeightPx)

  while (offsetY < canvas.height) {
    if (pageIndex > 0) {
      pdf.addPage()
    }

    const sliceHeight = Math.min(pageHeightPx, canvas.height - offsetY)
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeight
    const ctx = pageCanvas.getContext('2d')

    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(canvas, 0, offsetY, canvas.width, sliceHeight, 0, 0, pageCanvas.width, pageCanvas.height)
      const pageImg = pageCanvas.toDataURL('image/png')
      const imageHeight = contentWidth * (sliceHeight / canvas.width)
      pdf.addImage(pageImg, 'PNG', margin, margin, contentWidth, imageHeight)
    }

    offsetY += sliceHeight
    pageIndex += 1
    onProgress?.(80 + (pageIndex / totalPages) * 15)
  }

  pdf.save(fileName)
}

/**
 * 下载 Canvas 为图片文件
 * 支持 PNG/JPG 两种格式
 */
function downloadCanvas(
  canvas: HTMLCanvasElement,
  fileName: string,
  mimeType: 'image/png' | 'image/jpeg',
  quality?: number
): void {
  const link = document.createElement('a')
  link.download = fileName
  link.href = canvas.toDataURL(mimeType, quality)
  link.click()
}

/**
 * 下载 Blob 文件
 * 用于 JSON 等非画布导出场景
 */
function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = fileName
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 规范化文件名
 * 过滤系统非法字符并保证兜底名称可用
 */
function normalizeFileName(name: string): string {
  const sanitizedName = name.trim().replace(INVALID_FILENAME_REGEXP, '_')
  return sanitizedName.length > 0 ? sanitizedName : '简历'
}

/**
 * 等待下一帧
 * 用于保证导出前样式修改已完成渲染
 */
function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}
