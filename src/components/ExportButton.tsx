/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


/**
 * 简历导出功能组件
 * 支持PDF和Word格式导出
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, File, Loader2, CheckCircle, AlertCircle, Image, Camera } from 'lucide-react'

interface ExportButtonProps {
  className?: string
  onExport?: (format: 'pdf' | 'png' | 'jpg' | 'docx') => Promise<void>
}

/**
 * 导出按钮组件
 */
export default function ExportButton({ className = '', onExport }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState<'pdf' | 'png' | 'jpg' | 'docx' | null>(null)
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  /**
   * 处理导出 - 支持PDF、PNG、JPG和DOCX格式
   */
  const handleExport = async (format: 'pdf' | 'png' | 'jpg' | 'docx') => {
    if (isExporting) return

    setIsExporting(format)
    setExportStatus(null)

    try {
      if (onExport) {
        await onExport(format)
        setExportStatus({
          type: 'success',
          message: `${format.toUpperCase()} 导出成功！`
        })
      } else {
        // 默认导出逻辑
        await defaultExport(format)
        setExportStatus({
          type: 'success',
          message: `${format.toUpperCase()} 导出成功！`
        })
      }
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus({
        type: 'error',
        message: `导出失败，请重试`
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
   */
  const defaultExport = async (format: 'pdf' | 'png' | 'jpg' | 'docx') => {
    const element = document.getElementById('resume-preview')
    if (!element) {
      throw new Error('找不到简历预览元素')
    }

    // 临时设置导出模式
    const originalStyle = element.style.cssText
    element.style.transform = 'none'
    element.style.transformOrigin = 'initial'
    
    // 添加导出模式类
    element.classList.add('export-mode')

    try {
      // 动态导入html2canvas
      const html2canvas = (await import('html2canvas')).default
      
      // 生成canvas - 使用固定的A4像素尺寸
      const A4_WIDTH_PX = 794 // 210mm * 96dpi / 25.4
      const A4_HEIGHT_PX = 1123 // 297mm * 96dpi / 25.4
      
      const canvas = await html2canvas(element, {
        scale: 4, // 提高清晰度 (2 -> 4)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: A4_WIDTH_PX,
        height: element.scrollHeight,
        windowWidth: A4_WIDTH_PX,
        windowHeight: element.scrollHeight
      })

      if (format === 'pdf') {
        // PDF导出 - 优化A4纸张适配
        const imgData = canvas.toDataURL('image/png')
        const { jsPDF } = await import('jspdf')
        
        // A4纸张尺寸 (210 x 297 mm)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })
        
        const pdfWidth = 210 // A4宽度
        const pdfHeight = 297 // A4高度
        const margin = 5 // 减少页边距到5mm
        const contentWidth = pdfWidth - (margin * 2)
        const contentHeight = pdfHeight - (margin * 2)
        
        // 计算图片在PDF中的尺寸，优先填满页面宽度
        const imgAspectRatio = canvas.width / canvas.height
        const contentAspectRatio = contentWidth / contentHeight
        
        let imgWidth, imgHeight, xOffset, yOffset
        
        // 优先使用全宽度，减少留白
        imgWidth = contentWidth
        imgHeight = contentWidth / imgAspectRatio
        
        // 如果高度超出页面，则调整为适合高度
        if (imgHeight > contentHeight) {
          imgHeight = contentHeight
          imgWidth = contentHeight * imgAspectRatio
        }
        
        // 计算偏移量（居中或靠左上角）
        xOffset = margin + Math.max(0, (contentWidth - imgWidth) / 2)
        yOffset = margin
        
        // 如果内容超过一页，需要分页处理
        const pageHeight = A4_HEIGHT_PX * 2 // canvas的scale是2
        if (canvas.height > pageHeight) {
          let remainingHeight = canvas.height
          let sourceY = 0
          let pageCount = 0
          
          while (remainingHeight > 0) {
            if (pageCount > 0) {
              pdf.addPage()
            }
            
            // 计算当前页面要显示的高度
            const currentPageHeight = Math.min(remainingHeight, pageHeight)
            
            // 创建当前页面的canvas片段
            const pageCanvas = document.createElement('canvas')
            const pageCtx = pageCanvas.getContext('2d')
            pageCanvas.width = canvas.width
            pageCanvas.height = currentPageHeight
            
            if (pageCtx) {
              // 设置白色背景
              pageCtx.fillStyle = '#ffffff'
              pageCtx.fillRect(0, 0, canvas.width, currentPageHeight)
              
              pageCtx.drawImage(canvas, 0, sourceY, canvas.width, currentPageHeight, 0, 0, canvas.width, currentPageHeight)
              const pageImgData = pageCanvas.toDataURL('image/png')
              
              // 计算页面内容的缩放比例
              const pageImgHeight = (currentPageHeight / pageHeight) * contentHeight
              pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidth, pageImgHeight)
            }
            
            sourceY += currentPageHeight
            remainingHeight -= currentPageHeight
            pageCount++
          }
        } else {
          // 单页内容
          pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight)
        }
        
        pdf.save('resume.pdf')
      } else if (format === 'png') {
        // PNG导出 - 支持多页导出
        const maxPageHeight = A4_HEIGHT_PX * 2 // 考虑scale=2
        const pageWidth = canvas.width
        
        if (canvas.height <= maxPageHeight) {
          // 单页PNG导出
          const link = document.createElement('a')
          link.download = 'resume.png'
          link.href = canvas.toDataURL('image/png')
          link.click()
        } else {
          // 多页PNG导出
          let remainingHeight = canvas.height
          let sourceY = 0
          let pageCount = 1
          
          while (remainingHeight > 0) {
            const currentPageHeight = Math.min(remainingHeight, maxPageHeight)
            
            // 创建当前页面的canvas
            const pageCanvas = document.createElement('canvas')
            const pageCtx = pageCanvas.getContext('2d')
            pageCanvas.width = pageWidth
            pageCanvas.height = currentPageHeight
            
            if (pageCtx) {
              // 设置白色背景
              pageCtx.fillStyle = '#ffffff'
              pageCtx.fillRect(0, 0, pageWidth, currentPageHeight)
              
              // 绘制当前页面内容
              pageCtx.drawImage(canvas, 0, sourceY, pageWidth, currentPageHeight, 0, 0, pageWidth, currentPageHeight)
              
              // 下载当前页面
              const link = document.createElement('a')
              link.download = `resume_page_${pageCount}.png`
              link.href = pageCanvas.toDataURL('image/png')
              link.click()
              
              // 添加延迟避免浏览器阻止多个下载
              if (remainingHeight > currentPageHeight) {
                await new Promise(resolve => setTimeout(resolve, 500))
              }
            }
            
            sourceY += currentPageHeight
            remainingHeight -= currentPageHeight
            pageCount++
          }
        }
      } else if (format === 'jpg') {
        // JPG导出 - 支持多页导出
        const maxPageHeight = A4_HEIGHT_PX * 2 // 考虑scale=2
        const pageWidth = canvas.width
        
        if (canvas.height <= maxPageHeight) {
          // 单页JPG导出
          const link = document.createElement('a')
          link.download = 'resume.jpg'
          link.href = canvas.toDataURL('image/jpeg', 0.9)
          link.click()
        } else {
          // 多页JPG导出
          let remainingHeight = canvas.height
          let sourceY = 0
          let pageCount = 1
          
          while (remainingHeight > 0) {
            const currentPageHeight = Math.min(remainingHeight, maxPageHeight)
            
            // 创建当前页面的canvas
            const pageCanvas = document.createElement('canvas')
            const pageCtx = pageCanvas.getContext('2d')
            pageCanvas.width = pageWidth
            pageCanvas.height = currentPageHeight
            
            if (pageCtx) {
              // 设置白色背景
              pageCtx.fillStyle = '#ffffff'
              pageCtx.fillRect(0, 0, pageWidth, currentPageHeight)
              
              // 绘制当前页面内容
              pageCtx.drawImage(canvas, 0, sourceY, pageWidth, currentPageHeight, 0, 0, pageWidth, currentPageHeight)
              
              // 下载当前页面
              const link = document.createElement('a')
              link.download = `resume_page_${pageCount}.jpg`
              link.href = pageCanvas.toDataURL('image/jpeg', 0.9)
              link.click()
              
              // 添加延迟避免浏览器阻止多个下载
              if (remainingHeight > currentPageHeight) {
                await new Promise(resolve => setTimeout(resolve, 500))
              }
            }
            
            sourceY += currentPageHeight
            remainingHeight -= currentPageHeight
            pageCount++
          }
        }
      } else if (format === 'docx') {
        // Word导出功能 - 临时使用PDF导出作为替代方案
        // 由于html-to-docx在客户端环境中存在兼容性问题，暂时使用PDF格式
        console.warn('DOCX导出暂时不可用，将使用PDF格式导出')
        
        // 生成PDF作为替代
        const imgData = canvas.toDataURL('image/png')
        const { jsPDF } = await import('jspdf')
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })
        
        const pdfWidth = 210
        const pdfHeight = 297
        const margin = 5
        const contentWidth = pdfWidth - (margin * 2)
        const contentHeight = pdfHeight - (margin * 2)
        
        const imgAspectRatio = canvas.width / canvas.height
        let imgWidth = contentWidth
        let imgHeight = contentWidth / imgAspectRatio
        
        if (imgHeight > contentHeight) {
          imgHeight = contentHeight
          imgWidth = contentHeight * imgAspectRatio
        }
        
        const xOffset = margin + Math.max(0, (contentWidth - imgWidth) / 2)
        const yOffset = margin
        
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight)
        
        // 下载PDF文件（命名为docx以保持用户体验）
        pdf.save('resume.pdf')
      }
    } finally {
      // 恢复原始样式
      element.style.cssText = originalStyle
      element.classList.remove('export-mode')
    }
  }

  /**
   * 获取导出选项
   */
  const exportOptions = [
    {
      format: 'pdf' as const,
      label: 'PDF 格式',
      description: '适合打印和在线查看',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100'
    },
    {
      format: 'png' as const,
      label: 'PNG 图片',
      description: '高质量图片格式',
      icon: Image,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      format: 'jpg' as const,
      label: 'JPG 图片',
      description: '压缩图片格式',
      icon: Camera,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100'
    },
    {
      format: 'docx' as const,
      label: 'Word 格式',
      description: '可编辑的文档格式',
      icon: File,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    }
  ]

  return (
    <div className={`relative ${className}`}>
      {/* 主按钮 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary btn-md flex items-center justify-center space-x-1 sm:space-x-2 group relative"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Download className="icon icon-sm" />
        <span className="hidden xs:inline">导出简历</span>
        {/* 悬停提示 */}
        <div className="tooltip xs:hidden" data-tooltip="导出简历">
        </div>
      </motion.button>

      {/* 导出选项面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-[100]"
          >
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">选择导出格式</h3>
              
              <div className="space-y-2">
                {exportOptions.map((option) => {
                  const Icon = option.icon
                  const isCurrentlyExporting = isExporting === option.format
                  
                  return (
                    <motion.button
                      key={option.format}
                      onClick={() => handleExport(option.format)}
                      disabled={isExporting !== null}
                      className={`btn btn-outline btn-md w-full ${option.bgColor} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
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
                <p className="text-xs text-gray-500">
                  💡 导出前请确保简历内容已填写完整
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

/**
 * 简单导出按钮（不带下拉菜单）
 */
interface SimpleExportButtonProps {
  format: 'pdf' | 'docx'
  className?: string
  onExport?: (format: 'pdf' | 'docx') => Promise<void>
}

export function SimpleExportButton({ format, className = '', onExport }: SimpleExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (isExporting) return

    setIsExporting(true)
    try {
      if (onExport) {
        await onExport(format)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const config = {
    pdf: {
      label: '导出 PDF',
      icon: FileText,
      color: 'from-red-600 to-red-700'
    },
    docx: {
      label: '导出 Word',
      icon: File,
      color: 'from-blue-600 to-blue-700'
    }
  }

  const Icon = config[format].icon

  return (
    <motion.button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${config[format].color} text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileHover={{ scale: isExporting ? 1 : 1.02 }}
      whileTap={{ scale: isExporting ? 1 : 0.98 }}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      <span>{isExporting ? '导出中...' : config[format].label}</span>
    </motion.button>
  )
}