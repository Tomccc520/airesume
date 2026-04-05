/**
 * @file components/data/StorageMonitor.tsx
 * @description 存储空间监控组件，显示存储使用量和分类占用，实现警告提示和清理功能
 * @author Tomda
 * @copyright 版权所有 (c) 2026 UIED技术团队
 * @website https://fsuied.com
 * @license MIT
 * @version 1.0.0
 * 
 * @requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */

'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HardDrive,
  AlertTriangle,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  History,
  Palette,
  Settings,
  RefreshCw,
  Check
} from 'lucide-react'
import { useToastContext } from '@/components/Toast'

/**
 * 存储使用情况
 */
export interface StorageUsage {
  /** 已使用空间（字节） */
  used: number
  /** 总空间（字节） */
  total: number
  /** 使用百分比 */
  percentage: number
  /** 各类数据占用 */
  breakdown: {
    resumes: number
    versionHistory: number
    colorSchemes: number
    settings: number
    other: number
  }
}

/**
 * 清理选项
 */
export interface CleanupOptions {
  /** 清理版本历史 */
  versionHistory?: boolean
  /** 保留最近 N 个版本 */
  keepRecentVersions?: number
  /** 清理未使用的配色方案 */
  unusedColorSchemes?: boolean
}

/**
 * 存储监控组件属性
 */
export interface StorageMonitorProps {
  /** 存储使用情况 */
  usage: StorageUsage
  /** 是否显示详情 */
  showDetails?: boolean
  /** 警告阈值（百分比，默认 80） */
  warningThreshold?: number
  /** 清理回调 */
  onCleanup?: (options: CleanupOptions) => Promise<number>
  /** 刷新回调 */
  onRefresh?: () => void
  /** 自定义类名 */
  className?: string
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 获取存储状态元信息
 * 将百分比转换成统一的标题、提示文案和视觉状态，便于主卡片和清理建议共用。
 */
function getStorageStatusMeta(percentage: number, warningThreshold: number) {
  if (percentage >= 90) {
    return {
      chipLabel: '高风险',
      chipClassName: 'border-rose-200 bg-rose-50 text-rose-700',
      progressClassName: 'bg-rose-500',
      panelClassName: 'border-rose-200 bg-rose-50 text-rose-700',
      title: '存储空间即将用尽',
      description: '建议立即导出备份，并清理版本历史或未使用配色方案。'
    }
  }

  if (percentage >= warningThreshold) {
    return {
      chipLabel: '需清理',
      chipClassName: 'border-amber-200 bg-amber-50 text-amber-700',
      progressClassName: 'bg-amber-500',
      panelClassName: 'border-amber-200 bg-amber-50 text-amber-700',
      title: '存储空间接近上限',
      description: '建议预先清理旧数据，避免编辑过程中的保存和备份受影响。'
    }
  }

  return {
    chipLabel: '健康',
    chipClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    progressClassName: 'bg-slate-900',
    panelClassName: 'border-slate-200 bg-slate-50 text-slate-700',
    title: '存储空间状态稳定',
    description: '当前容量充足，建议在大改版前后各导出一份数据备份。'
  }
}

/**
 * 获取空间管理建议
 * 根据当前占用情况生成更适合展示在维护卡片中的下一步操作提示。
 */
function getStorageRecommendation(usage: StorageUsage, warningThreshold: number): string {
  if (usage.percentage >= 90) {
    return '优先清理版本历史，并保留最近 1 到 3 份快照。'
  }

  if (usage.percentage >= warningThreshold) {
    return '如果近期频繁调整模板和样式，建议先导出备份，再做选择性清理。'
  }

  if (usage.breakdown.versionHistory > usage.breakdown.resumes) {
    return '当前版本历史占用偏高，可定期删除旧快照，保持本地空间轻量。'
  }

  return '当前主要用于内容编辑，可继续正常使用，建议按里程碑导出备份。'
}

/**
 * 存储分类项组件
 */
const StorageBreakdownItem: React.FC<{
  icon: React.ReactNode
  label: string
  bytes: number
  percentage: number
  iconClassName: string
  progressClassName: string
}> = ({ icon, label, bytes, percentage, iconClassName, progressClassName }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${iconClassName}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          <p className="mt-1 text-xs text-slate-500">占当前本地缓存的 {percentage.toFixed(1)}%</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm font-semibold text-slate-900">{formatBytes(bytes)}</span>
      </div>
    </div>

    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${progressClassName}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  </div>
)

/**
 * 清理对话框组件
 */
const CleanupDialog: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: (options: CleanupOptions) => void
  isLoading: boolean
}> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [options, setOptions] = useState<CleanupOptions>({
    versionHistory: true,
    keepRecentVersions: 3,
    unusedColorSchemes: false
  })

  const handleConfirm = useCallback(() => {
    onConfirm(options)
  }, [options, onConfirm])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-slate-200 px-6 py-5">
          <span className="app-shell-brand-mark h-10 w-10 shrink-0 rounded-xl">
            <Trash2 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">清理存储空间</h3>
            <p className="mt-1 text-sm text-slate-500">选择要清理的数据类型，释放本地编辑器缓存空间。</p>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid gap-3">
            <label className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={options.versionHistory}
                  onChange={(e) => setOptions(prev => ({ ...prev, versionHistory: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">清理版本历史</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    删除旧版本快照，仅保留近期需要回滚的版本记录。
                  </p>
                  {options.versionHistory && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-xs font-medium text-slate-500">保留最近</span>
                      <select
                        value={options.keepRecentVersions}
                        onChange={(e) => setOptions(prev => ({ ...prev, keepRecentVersions: Number(e.target.value) }))}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-slate-900 focus:outline-none"
                      >
                        <option value={1}>1 个</option>
                        <option value={3}>3 个</option>
                        <option value={5}>5 个</option>
                      </select>
                      <span className="text-xs font-medium text-slate-500">版本</span>
                    </div>
                  )}
                </div>
              </div>
            </label>

            <label className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={options.unusedColorSchemes}
                  onChange={(e) => setOptions(prev => ({ ...prev, unusedColorSchemes: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">清理未使用的配色方案</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    删除没有被当前简历引用的自定义色板，减少样式缓存占用。
                  </p>
                </div>
              </div>
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              清理建议
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              建议在清理前先导出一份数据备份，避免误删历史版本。
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              清理不会影响当前编辑中的内容，但被删除的旧版本和未使用配色无法直接恢复。
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="app-shell-action-button h-10 rounded-xl px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || (!options.versionHistory && !options.unusedColorSchemes)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-500 px-4 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                清理中...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                开始清理
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/**
 * 存储空间监控组件
 * 
 * @description 显示存储使用量和分类占用，实现警告提示和清理功能
 * 
 * @requirements
 * - 9.1: 显示当前本地存储的使用量和剩余空间
 * - 9.2: 存储空间使用超过 80% 时显示警告提示
 * - 9.3: 提供清理旧数据的功能
 * - 9.4: 显示各类数据的存储占用
 * - 9.5: 存储空间不足时提示用户导出数据或清理空间
 * - 9.6: 支持选择性删除历史版本以释放空间
 * - 9.7: 存储操作失败时提供明确的错误提示和解决建议
 */
export function StorageMonitor({
  usage,
  showDetails = true,
  warningThreshold = 80,
  onCleanup,
  onRefresh,
  className = ''
}: StorageMonitorProps) {
  const { success: showSuccess, error: showError } = useToastContext()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCleanupDialog, setShowCleanupDialog] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<{ success: boolean; freedBytes: number } | null>(null)

  const isNearLimit = usage.percentage >= warningThreshold
  const statusMeta = getStorageStatusMeta(usage.percentage, warningThreshold)
  const remainingBytes = Math.max(usage.total - usage.used, 0)
  const recommendation = getStorageRecommendation(usage, warningThreshold)

  // 计算各类数据的百分比
  const breakdownPercentages = {
    resumes: usage.used > 0 ? (usage.breakdown.resumes / usage.used) * 100 : 0,
    versionHistory: usage.used > 0 ? (usage.breakdown.versionHistory / usage.used) * 100 : 0,
    colorSchemes: usage.used > 0 ? (usage.breakdown.colorSchemes / usage.used) * 100 : 0,
    settings: usage.used > 0 ? (usage.breakdown.settings / usage.used) * 100 : 0,
    other: usage.used > 0 ? (usage.breakdown.other / usage.used) * 100 : 0
  }

  /**
   * 处理清理
   * 清理完成后同步展示站内 toast 和内联结果提示，反馈更明确。
   */
  const handleCleanup = useCallback(async (options: CleanupOptions) => {
    if (!onCleanup) return

    setIsCleaningUp(true)
    setCleanupResult(null)

    try {
      const freedBytes = await onCleanup(options)
      setCleanupResult({ success: true, freedBytes })
      setShowCleanupDialog(false)
      showSuccess('存储清理完成', `已释放 ${formatBytes(freedBytes)} 空间。`)
      
      // 3秒后清除结果提示
      setTimeout(() => setCleanupResult(null), 3000)
    } catch {
      setCleanupResult({ success: false, freedBytes: 0 })
      showError('存储清理失败', '请稍后重试，或先导出备份后再进行清理。')
    } finally {
      setIsCleaningUp(false)
    }
  }, [onCleanup, showError, showSuccess])

  return (
    <div className={`app-shell-toolbar-surface overflow-hidden ${className}`}>
      {/* 头部 */}
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <span className="app-shell-brand-mark h-10 w-10 shrink-0 rounded-xl">
              <HardDrive className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">本地存储空间</span>
                <span className={`app-shell-status-chip ${statusMeta.chipClassName}`}>
                  {statusMeta.chipLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                管理简历缓存、版本历史和样式数据，保持编辑器运行稳定。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="app-shell-toolbar-button h-9 w-9 px-0"
                title="刷新"
              >
                <RefreshCw size={14} />
              </button>
            )}
            {showDetails && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`h-9 w-9 px-0 ${isExpanded ? 'app-shell-toolbar-button app-shell-toolbar-button-active' : 'app-shell-toolbar-button'}`}
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="space-y-4 p-4 sm:p-5">
        {/* 警告提示 */}
        <div className={`rounded-xl border p-4 ${statusMeta.panelClassName}`}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{statusMeta.title}</p>
              <p className="mt-1 text-sm leading-6 opacity-90">
                {statusMeta.description}
              </p>
            </div>
          </motion.div>
        </div>

        {/* 清理成功提示 */}
        <AnimatePresence>
          {cleanupResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${
                cleanupResult.success ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
              }`}
            >
              {cleanupResult.success ? (
                <>
                  <Check size={16} className="text-emerald-500" />
                  <span className="text-sm text-emerald-700">
                    清理完成，释放了 {formatBytes(cleanupResult.freedBytes)} 空间
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="text-rose-500" />
                  <span className="text-sm text-rose-700">清理失败，请稍后重试</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(240px,0.9fr)]">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              容量概览
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold text-slate-900">{usage.percentage.toFixed(1)}%</p>
                <p className="mt-1 text-sm text-slate-500">
                  已使用 {formatBytes(usage.used)} / {formatBytes(usage.total)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{formatBytes(remainingBytes)}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">剩余可用</p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usage.percentage, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${statusMeta.progressClassName}`}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              维护建议
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {isNearLimit ? '建议优先做一次清理和备份' : '当前可以继续正常编辑'}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {recommendation}
            </p>
          </div>
        </div>

        {/* 详细分类 */}
        <AnimatePresence>
          {isExpanded && showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 border-t border-slate-200 pt-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">占用明细</p>
                  <p className="mt-1 text-sm text-slate-500">按数据类型查看当前本地缓存的占用分布。</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
              <StorageBreakdownItem
                icon={<FileText size={12} className="text-blue-600" />}
                label="简历数据"
                bytes={usage.breakdown.resumes}
                percentage={breakdownPercentages.resumes}
                iconClassName="border-blue-200 bg-blue-50"
                progressClassName="bg-blue-500"
              />
              <StorageBreakdownItem
                icon={<History size={12} className="text-purple-600" />}
                label="版本历史"
                bytes={usage.breakdown.versionHistory}
                percentage={breakdownPercentages.versionHistory}
                iconClassName="border-purple-200 bg-purple-50"
                progressClassName="bg-purple-500"
              />
              <StorageBreakdownItem
                icon={<Palette size={12} className="text-pink-600" />}
                label="配色方案"
                bytes={usage.breakdown.colorSchemes}
                percentage={breakdownPercentages.colorSchemes}
                iconClassName="border-pink-200 bg-pink-50"
                progressClassName="bg-pink-500"
              />
              <StorageBreakdownItem
                icon={<Settings size={12} className="text-gray-600" />}
                label="设置"
                bytes={usage.breakdown.settings}
                percentage={breakdownPercentages.settings}
                iconClassName="border-slate-200 bg-slate-50"
                progressClassName="bg-slate-500"
              />
              {usage.breakdown.other > 0 && (
                <StorageBreakdownItem
                  icon={<HardDrive size={12} className="text-gray-500" />}
                  label="其他"
                  bytes={usage.breakdown.other}
                  percentage={breakdownPercentages.other}
                  iconClassName="border-slate-200 bg-slate-50"
                  progressClassName="bg-slate-400"
                />
              )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 清理按钮 */}
        {onCleanup && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">释放本地空间</p>
              <p className="mt-1 text-sm text-slate-500">建议在导出备份后定期清理旧版本和闲置配色。</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCleanupDialog(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Trash2 size={14} />
              清理存储空间
            </button>
          </div>
        )}
      </div>

      {/* 清理对话框 */}
      <AnimatePresence>
        <CleanupDialog
          isOpen={showCleanupDialog}
          onClose={() => setShowCleanupDialog(false)}
          onConfirm={handleCleanup}
          isLoading={isCleaningUp}
        />
      </AnimatePresence>
    </div>
  )
}

export default StorageMonitor
