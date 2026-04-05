/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

'use client'

import { useCallback } from 'react'
import { ImportExportDialog, ImportedData } from '@/components/data/ImportExportDialog'
import { useStyle } from '@/contexts/StyleContext'
import { useColorSchemes } from '@/hooks/useColorSchemes'
import { ResumeData } from '@/types/resume'
import {
  applyImportedResumeData,
  ImportMode,
  ImportSelection,
  resolveImportedStyleConfig
} from '@/domain/editor/importExport'

interface ImportExportBridgeProps {
  /**
   * 是否打开导入导出弹层
   */
  isOpen: boolean
  /**
   * 关闭弹层
   */
  onClose: () => void
  /**
   * 当前简历数据
   */
  resumeData: ResumeData
  /**
   * 应用导入后的简历数据
   */
  onResumeDataImport: (nextResumeData: ResumeData) => void
  /**
   * 导入完成后的补充回调
   */
  onImportApplied?: () => void
}

/**
 * 导入导出桥接组件
 * 负责把编辑器真实的样式上下文、配色方案和简历数据接到导入导出弹层，避免页面层继续硬编码假数据。
 */
export default function ImportExportBridge({
  isOpen,
  onClose,
  resumeData,
  onResumeDataImport,
  onImportApplied
}: ImportExportBridgeProps) {
  const { styleConfig, replaceStyleConfig } = useStyle()
  const { customSchemes, importSchemes } = useColorSchemes()

  /**
   * 处理导入应用
   * 按用户勾选范围分别写入简历内容、样式配置和自定义配色，不改动未选择部分。
   */
  const handleImport = useCallback((data: ImportedData, mode: ImportMode, selection: ImportSelection) => {
    if (selection.includeResumeData && data.resumeData) {
      const nextResumeData = applyImportedResumeData(
        resumeData,
        data.resumeData,
        mode,
        selection
      )
      onResumeDataImport(nextResumeData)
    }

    if (selection.includeStyleConfig && data.styleConfig) {
      const nextStyleConfig = resolveImportedStyleConfig(styleConfig, data.styleConfig, mode)
      replaceStyleConfig(nextStyleConfig)
    }

    if (selection.includeColorSchemes && data.colorSchemes?.length) {
      importSchemes(data.colorSchemes, mode)
    }

    onImportApplied?.()
  }, [importSchemes, onImportApplied, onResumeDataImport, replaceStyleConfig, resumeData, styleConfig])

  return (
    <ImportExportDialog
      isOpen={isOpen}
      onClose={onClose}
      resumeData={resumeData}
      styleConfig={styleConfig}
      colorSchemes={customSchemes}
      onImport={handleImport}
    />
  )
}
