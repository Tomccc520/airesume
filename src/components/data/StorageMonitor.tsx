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
 * 获取进度条颜色
 */
function getProgressColor(percentage: number, warningThreshold: number): string {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= warningThreshold) return 'bg-amber-500'
  return 'bg-blue-500'
}

/**
 * 存储分类项组件
 */
const StorageBreakdownItem: React.FC<{
  icon: React.ReactNode
  label: string
  bytes: number
  percentage: number
  color: string
}> = ({ icon, label, bytes, percentage, color }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded ${color}`}>
        {icon}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
    <div className="text-right">
      <span className="text-sm font-medium text-gray-800">{formatBytes(bytes)}</span>
      <span className="text-xs text-gray-400 ml-1">({percentage.toFixed(1)}%)</span>
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">清理存储空间</h3>
          <p className="text-sm text-gray-500 mt-1">选择要清理的数据类型</p>
        </div>

        <div className="p-5 space-y-4">
          {/* 版本历史 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.versionHistory}
              onChange={(e) => setOptions(prev => ({ ...prev, versionHistory: e.target.checked }))}
              className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">清理版本历史</span>
              <p className="text-xs text-gray-500 mt-0.5">保留最近的版本，删除旧版本</p>
              {options.versionHistory && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">保留最近</span>
                  <select
                    value={options.keepRecentVersions}
                    onChange={(e) => setOptions(prev => ({ ...prev, keepRecentVersions: Number(e.target.value) }))}
                    className="text-xs border border-gray-200 rounded px-2 py-1"
                  >
                    <option value={1}>1 个</option>
                    <option value={3}>3 个</option>
                    <option value={5}>5 个</option>
                  </select>
                  <span className="text-xs text-gray-500">版本</span>
                </div>
              )}
            </div>
          </label>

          {/* 未使用的配色方案 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.unusedColorSchemes}
              onChange={(e) => setOptions(prev => ({ ...prev, unusedColorSchemes: e.target.checked }))}
              className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">清理未使用的配色方案</span>
              <p className="text-xs text-gray-500 mt-0.5">删除未被任何简历使用的自定义配色</p>
            </div>
          </label>
        </div>

        <div className="px-5 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || (!options.versionHistory && !options.unusedColorSchemes)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCleanupDialog, setShowCleanupDialog] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<{ success: boolean; freedBytes: number } | null>(null)

  const isNearLimit = usage.percentage >= warningThreshold
  const isCritical = usage.percentage >= 90
  const progressColor = getProgressColor(usage.percentage, warningThreshold)

  // 计算各类数据的百分比
  const breakdownPercentages = {
    resumes: usage.used > 0 ? (usage.breakdown.resumes / usage.used) * 100 : 0,
    versionHistory: usage.used > 0 ? (usage.breakdown.versionHistory / usage.used) * 100 : 0,
    colorSchemes: usage.used > 0 ? (usage.breakdown.colorSchemes / usage.used) * 100 : 0,
    settings: usage.used > 0 ? (usage.breakdown.settings / usage.used) * 100 : 0,
    other: usage.used > 0 ? (usage.breakdown.other / usage.used) * 100 : 0
  }

  // 处理清理
  const handleCleanup = useCallback(async (options: CleanupOptions) => {
    if (!onCleanup) return

    setIsCleaningUp(true)
    setCleanupResult(null)

    try {
      const freedBytes = await onCleanup(options)
      setCleanupResult({ success: true, freedBytes })
      setShowCleanupDialog(false)
      
      // 3秒后清除结果提示
      setTimeout(() => setCleanupResult(null), 3000)
    } catch (error) {
      setCleanupResult({ success: false, freedBytes: 0 })
    } finally {
      setIsCleaningUp(false)
    }
  }, [onCleanup])

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">存储空间</span>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="刷新"
              >
                <RefreshCw size={14} />
              </button>
            )}
            {showDetails && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="p-4">
        {/* 警告提示 */}
        {isNearLimit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-2 p-3 rounded-lg mb-4 ${
              isCritical ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
            }`}
          >
            <AlertTriangle size={16} className={isCritical ? 'text-red-500' : 'text-amber-500'} />
            <div>
              <p className={`text-sm font-medium ${isCritical ? 'text-red-700' : 'text-amber-700'}`}>
                {isCritical ? '存储空间即将用尽' : '存储空间不足'}
              </p>
              <p className={`text-xs mt-0.5 ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                建议导出数据备份或清理旧数据以释放空间
              </p>
            </div>
          </motion.div>
        )}

        {/* 清理成功提示 */}
        <AnimatePresence>
          {cleanupResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                cleanupResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              {cleanupResult.success ? (
                <>
                  <Check size={16} className="text-green-500" />
                  <span className="text-sm text-green-700">
                    清理完成，释放了 {formatBytes(cleanupResult.freedBytes)} 空间
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="text-sm text-red-700">清理失败，请稍后重试</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 使用量显示 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              已使用 {formatBytes(usage.used)} / {formatBytes(usage.total)}
            </span>
            <span className={`text-sm font-medium ${
              isCritical ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-700'
            }`}>
              {usage.percentage.toFixed(1)}%
            </span>
          </div>
          
          {/* 进度条 */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(usage.percentage, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full ${progressColor} rounded-full`}
            />
          </div>
        </div>

        {/* 详细分类 */}
        <AnimatePresence>
          {isExpanded && showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 pt-4 mt-4 space-y-1"
            >
              <StorageBreakdownItem
                icon={<FileText size={12} className="text-blue-600" />}
                label="简历数据"
                bytes={usage.breakdown.resumes}
                percentage={breakdownPercentages.resumes}
                color="bg-blue-100"
              />
              <StorageBreakdownItem
                icon={<History size={12} className="text-purple-600" />}
                label="版本历史"
                bytes={usage.breakdown.versionHistory}
                percentage={breakdownPercentages.versionHistory}
                color="bg-purple-100"
              />
              <StorageBreakdownItem
                icon={<Palette size={12} className="text-pink-600" />}
                label="配色方案"
                bytes={usage.breakdown.colorSchemes}
                percentage={breakdownPercentages.colorSchemes}
                color="bg-pink-100"
              />
              <StorageBreakdownItem
                icon={<Settings size={12} className="text-gray-600" />}
                label="设置"
                bytes={usage.breakdown.settings}
                percentage={breakdownPercentages.settings}
                color="bg-gray-100"
              />
              {usage.breakdown.other > 0 && (
                <StorageBreakdownItem
                  icon={<HardDrive size={12} className="text-gray-500" />}
                  label="其他"
                  bytes={usage.breakdown.other}
                  percentage={breakdownPercentages.other}
                  color="bg-gray-100"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 清理按钮 */}
        {onCleanup && (
          <button
            onClick={() => setShowCleanupDialog(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            清理存储空间
          </button>
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
