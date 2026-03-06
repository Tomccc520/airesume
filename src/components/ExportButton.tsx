/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * 
 * @description 简历导出功能组件，支持PDF、PNG、JPG格式导出
 * 使用 ExportStyleCapture 服务进行样式预处理，确保导出样式一致性
 */


/**
 * 简历导出功能组件
 * 支持PDF、PNG、JPG格式导出
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, File, Loader2, CheckCircle, AlertCircle, Image, Camera, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { ExportStyleCapture } from '@/services/exportStyleCapture'

interface ExportButtonProps {
  className?: string
  onExport?: (format: 'pdf' | 'png' | 'jpg') => Promise<void>
}

/**
 * 导出按钮组件
 */
export default function ExportButton({ className = '', onExport }: ExportButtonProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState<'pdf' | 'png' | 'jpg' | null>(null)
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  /**
   * 处理导出 - 支持PDF、PNG、JPG格式
   */
  const handleExport = async (format: 'pdf' | 'png' | 'jpg') => {
    if (isExporting) return

    console.log('🚀 开始导出:', format) // 添加日志确认函数被调用

    setIsExporting(format)
    setExportStatus(null)

    try {
      if (onExport) {
        await onExport(format)
        setExportStatus({
          type: 'success',
          message: `${format.toUpperCase()} ${t.editor.toolbar.exportSuccess}`
        })
      } else {
        // 默认导出逻辑
        await defaultExport(format)
        setExportStatus({
          type: 'success',
          message: `${format.toUpperCase()} ${t.editor.toolbar.exportSuccess}`
        })
      }
    } catch (error) {
      console.error('❌ Export failed:', error)
      setExportStatus({
        type: 'error',
        message: t.editor.toolbar.exportFailed
      })
    } finally {
      setIsExporting(null)
      setTimeout(() => {
        setExportStatus(null)
        setIsOpen(false)
      }, 2000)
    }
  }

  /**
   * 默认导出逻辑 - 使用html2canvas生成图片，支持多页PNG导出
   * 修复空白图片问题：
   * 1. 正确处理元素克隆和样式继承
   * 2. 移除所有transform变换（包括父元素）
   * 3. 等待内容完全渲染
   */
  const defaultExport = async (format: 'pdf' | 'png' | 'jpg') => {
    const element = document.getElementById('resume-preview')
    if (!element) {
      throw new Error('找不到简历预览元素 #resume-preview')
    }

    console.log('✅ 找到元素:', element)
    console.log('📏 元素尺寸:', element.getBoundingClientRect())
    console.log('📝 内容长度:', element.innerHTML.length)
    console.log('👶 子元素数量:', element.children.length)

    // 检查元素是否真的有内容
    if (element.innerHTML.length === 0) {
      throw new Error('简历预览元素是空的，请先添加简历内容')
    }

    // 等待字体加载
    await document.fonts.ready.catch(() => {
      console.warn('⚠️ 字体加载超时')
    })

    // 保存原始样式（包括父元素）
    const originalTransform = element.style.transform
    const originalScale = element.style.scale
    const originalWidth = element.style.width
    const originalHeight = element.style.height
    
    // 查找并保存所有父元素的 transform
    const parentElements: HTMLElement[] = []
    const parentTransforms: string[] = []
    let parent = element.parentElement
    while (parent) {
      parentElements.push(parent)
      parentTransforms.push(parent.style.transform || '')
      parent = parent.parentElement
    }
    
    try {
      // 临时移除所有变换，确保以原始尺寸渲染
      element.style.transform = 'none'
      element.style.scale = '1'
      
      // 移除所有父元素的 transform
      parentElements.forEach((parent, index) => {
        console.log(`🔄 移除父元素 ${index} 的 transform:`, parent.style.transform)
        parent.style.transform = 'none'
      })
      
      console.log('📊 所有 transform 已移除，父元素数量:', parentElements.length)
      
      // 添加导出标记类
      element.classList.add('exporting')
      
      // 强制重绘
      element.offsetHeight
      
      // 等待一帧确保样式生效
      await new Promise(resolve => requestAnimationFrame(resolve))
      
      // 获取实际渲染尺寸（移除transform后）
      const rect = element.getBoundingClientRect()
      const width = 612 // 固定使用A4宽度
      const height = element.scrollHeight || rect.height || 792
    
    console.log('📐 使用尺寸:', { width, height })

      // 动态导入html2canvas
      const html2canvas = (await import('html2canvas')).default
      
      console.log('🎨 开始生成canvas...')
      
      // 使用2倍缩放（降低以提高兼容性）
      const scale = 2
      
      // 生成canvas - 简化配置，让 html2canvas 自动处理样式
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        logging: true,
        imageTimeout: 15000,
        onclone: (clonedDoc, clonedElement) => {
          console.log('🔄 处理克隆元素...')
          
          // 只做最基本的处理
          clonedElement.style.width = `${width}px`
          clonedElement.style.minHeight = `${height}px`
          clonedElement.style.transform = 'none'
          clonedElement.style.margin = '0'
          
          // 移除不需要导出的元素
          const buttonsToRemove = clonedElement.querySelectorAll('button, .no-export, [data-no-export]')
          buttonsToRemove.forEach(btn => btn.remove())
          console.log('🗑️ 移除了', buttonsToRemove.length, '个按钮')
            
            // 移除分页线
            const pageBreakLines = clonedElement.querySelectorAll('[style*="dashed"]')
            pageBreakLines.forEach(line => line.remove())
          
          console.log('✅ 克隆元素处理完成')
        }
      })
      
      console.log('✅ Canvas生成完成:', { width: canvas.width, height: canvas.height })
      
      // 调试：检查canvas内容
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height))
        const data = imageData.data
        let hasNonWhitePixel = false
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
            hasNonWhitePixel = true
            break
          }
        }
        console.log('🎨 Canvas内容检查:', hasNonWhitePixel ? '有内容' : '全白色（可能有问题）')
      }
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas尺寸为0，无法导出')
      }
      
      // 恢复原始样式
      element.style.transform = originalTransform
      element.style.scale = originalScale
      element.classList.remove('exporting')
      if (originalWidth) element.style.width = originalWidth
      if (originalHeight) element.style.height = originalHeight
      
      // 恢复父元素的 transform
      parentElements.forEach((parent, index) => {
        parent.style.transform = parentTransforms[index]
      })

      if (format === 'pdf') {
        // PDF导出
        console.log('📄 开始生成PDF...')
        const imgData = canvas.toDataURL('image/png', 1.0)
        const { jsPDF } = await import('jspdf')
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: false
        })
        
        const pdfWidth = 210
        const pdfHeight = 297
        const margin = 10
        const contentWidth = pdfWidth - (margin * 2)
        const contentHeight = pdfHeight - (margin * 2)
        
        // 计算图片在PDF中的尺寸
        const imgAspectRatio = canvas.width / canvas.height
        let imgWidth = contentWidth
        let imgHeight = contentWidth / imgAspectRatio
        
        // 如果高度超过一页，需要分页
        if (imgHeight > contentHeight) {
          const pagesNeeded = Math.ceil(imgHeight / contentHeight)
          console.log('📑 需要', pagesNeeded, '页')
          
          const pageHeightInCanvas = (contentHeight / contentWidth) * canvas.width
          
          for (let page = 0; page < pagesNeeded; page++) {
            if (page > 0) pdf.addPage()
            
            const sourceY = page * pageHeightInCanvas
            const sourceHeight = Math.min(pageHeightInCanvas, canvas.height - sourceY)
            
            const pageCanvas = document.createElement('canvas')
            pageCanvas.width = canvas.width
            pageCanvas.height = sourceHeight
            const ctx = pageCanvas.getContext('2d')
            
            if (ctx) {
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
              ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, pageCanvas.width, pageCanvas.height)
              
              const pageImg = pageCanvas.toDataURL('image/png', 1.0)
              const pageImgHeight = (sourceHeight / canvas.width) * contentWidth
              pdf.addImage(pageImg, 'PNG', margin, margin, contentWidth, pageImgHeight, undefined, 'FAST')
            }
          }
        } else {
          // 单页
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight, undefined, 'FAST')
        }
        
        pdf.save('resume.pdf')
        console.log('✅ PDF导出完成')
      } else if (format === 'png') {
        // PNG导出
        console.log('🖼️ 开始PNG导出...')
        const link = document.createElement('a')
        link.download = 'resume.png'
        link.href = canvas.toDataURL('image/png', 1.0)
        link.click()
        console.log('✅ PNG导出完成')
      } else if (format === 'jpg') {
        // JPG导出
        console.log('🖼️ 开始JPG导出...')
        const link = document.createElement('a')
        link.download = 'resume.jpg'
        link.href = canvas.toDataURL('image/jpeg', 0.95)
        link.click()
        console.log('✅ JPG导出完成')
      }
    } catch (error) {
      console.error('❌ 导出失败:', error)
      
      // 确保恢复所有样式
      element.style.transform = originalTransform
      element.style.scale = originalScale
      element.classList.remove('exporting')
      if (originalWidth) element.style.width = originalWidth
      if (originalHeight) element.style.height = originalHeight
      
      // 恢复父元素的 transform
      parentElements.forEach((parent, index) => {
        parent.style.transform = parentTransforms[index]
      })
      
      throw error
    }
  }

  /**
   * 获取导出选项
   */
  const exportOptions = [
    {
      format: 'pdf' as const,
      label: t.editor.toolbar.pdfFormat,
      description: t.editor.toolbar.pdfDesc,
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100'
    },
    {
      format: 'png' as const,
      label: t.editor.toolbar.pngFormat,
      description: t.editor.toolbar.pngDesc,
      icon: Image,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      format: 'jpg' as const,
      label: t.editor.toolbar.jpgFormat,
      description: t.editor.toolbar.jpgDesc,
      icon: Camera,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100'
    }
  ]

  return (
    <div className={`relative ${className}`}>
      {/* 主按钮 - 调整为更小的尺寸 */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="sm"
        className="gap-1.5"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm">{t.editor.toolbar.exportResume}</span>
      </Button>

      {/* 导出选项面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100]"
          >
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">{t.editor.toolbar.selectFormat}</h3>
              
              <div className="space-y-2">
                {exportOptions.map((option) => {
                  const Icon = option.icon
                  const isCurrentlyExporting = isExporting === option.format
                  
                  return (
                    <motion.button
                      key={option.format}
                      onClick={() => handleExport(option.format)}
                      disabled={isExporting !== null}
                      className={`btn btn-outline btn-md w-full ${option.bgColor} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
                      whileHover={{ scale: isExporting ? 1 : 1.02 }}
                      whileTap={{ scale: isExporting ? 1 : 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${option.bgColor}`}>
                          {isCurrentlyExporting ? (
                            <motion.div
                              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                              transition={{ 
                                rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                                scale: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
                              }}
                            >
                              <Loader2 className={`icon icon-md ${option.color}`} />
                            </motion.div>
                          ) : (
                            <motion.div
                              whileHover={{ rotate: 10, scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Icon className={`icon icon-md ${option.color}`} />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* 导出状态 */}
              <AnimatePresence>
                {exportStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-3 p-3 rounded-lg ${
                      exportStatus.type === 'success' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {exportStatus.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        exportStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {exportStatus.message}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 提示信息 */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> {t.editor.toolbar.exportTip}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击外部关闭 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}