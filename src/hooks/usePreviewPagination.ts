/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-15
 * 
 * 预览分页 Hook
 * 计算总页数、实现页面间平滑滚动、显示当前页码
 * Requirements: 2.9, 2.10
 */

'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { A4_HEIGHT_PX } from '@/components/preview/previewUtils'

interface UsePreviewPaginationOptions {
  zoom?: number
  contentHeight?: number
  onPageChange?: (page: number) => void
}

interface UsePreviewPaginationReturn {
  currentPage: number
  totalPages: number
  containerRef: React.RefObject<HTMLDivElement>
  scrollToPage: (page: number) => void
  goToNextPage: () => void
  goToPrevPage: () => void
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void
  setCurrentPage: (page: number) => void
  setTotalPages: (pages: number) => void
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

/**
 * 预览分页 Hook
 * 管理预览面板的分页状态和滚动行为
 */
export function usePreviewPagination(options: UsePreviewPaginationOptions = {}): UsePreviewPaginationReturn {
  const { zoom = 100, contentHeight = 0, onPageChange } = options
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  // 计算缩放后的页面高度
  const scaledPageHeight = useMemo(() => A4_HEIGHT_PX * (zoom / 100), [zoom])

  // 当内容高度或缩放变化时，重新计算总页数
  useEffect(() => {
    if (contentHeight > 0) {
      const newTotalPages = calculateTotalPages(contentHeight, zoom)
      setTotalPages(newTotalPages)
      
      // 确保当前页码在有效范围内
      setCurrentPage(prev => validatePageNumber(prev, newTotalPages))
    }
  }, [contentHeight, zoom])

  // 滚动到指定页
  const scrollToPage = useCallback((page: number) => {
    if (!containerRef.current) return
    
    const validPage = validatePageNumber(page, totalPages)
    const targetScroll = (validPage - 1) * scaledPageHeight
    
    isScrollingRef.current = true
    containerRef.current.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    })
    
    // 滚动完成后重置标志
    setTimeout(() => {
      isScrollingRef.current = false
    }, 500)
    
    setCurrentPage(validPage)
    onPageChange?.(validPage)
  }, [totalPages, scaledPageHeight, onPageChange])

  // 下一页
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      scrollToPage(currentPage + 1)
    }
  }, [currentPage, totalPages, scrollToPage])

  // 上一页
  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1)
    }
  }, [currentPage, scrollToPage])

  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // 如果是程序触发的滚动，不更新页码
    if (isScrollingRef.current) return
    
    const container = e.currentTarget
    const scrollTop = container.scrollTop
    
    // 计算当前页码（基于滚动位置）
    const newPage = Math.floor(scrollTop / scaledPageHeight) + 1
    const validPage = validatePageNumber(newPage, totalPages)
    
    if (validPage !== currentPage) {
      setCurrentPage(validPage)
      onPageChange?.(validPage)
    }
  }, [scaledPageHeight, totalPages, currentPage, onPageChange])

  // 安全的 setCurrentPage
  const safeSetCurrentPage = useCallback((page: number) => {
    const validPage = validatePageNumber(page, totalPages)
    setCurrentPage(validPage)
  }, [totalPages])

  // 安全的 setTotalPages
  const safeSetTotalPages = useCallback((pages: number) => {
    const validPages = Math.max(1, pages)
    setTotalPages(validPages)
    // 确保当前页码在新的范围内
    setCurrentPage(prev => validatePageNumber(prev, validPages))
  }, [])

  return {
    currentPage,
    totalPages,
    containerRef,
    scrollToPage,
    goToNextPage,
    goToPrevPage,
    handleScroll,
    setCurrentPage: safeSetCurrentPage,
    setTotalPages: safeSetTotalPages
  }
}

export default usePreviewPagination
