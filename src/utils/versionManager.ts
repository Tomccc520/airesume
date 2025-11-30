/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-10-04
 */

import { ResumeData } from '@/types/resume'

export interface Version {
  /** 版本ID */
  id: string
  /** 创建时间 */
  timestamp: Date
  /** 简历数据 */
  data: ResumeData
  /** 版本备注 */
  note?: string
  /** 是否自动创建 */
  auto: boolean
  /** 版本标签 */
  tags?: string[]
  /** 文件大小（字节） */
  size: number
}

export interface VersionStats {
  /** 总版本数 */
  total: number
  /** 自动版本数 */
  autoCount: number
  /** 手动版本数 */
  manualCount: number
  /** 最早版本时间 */
  earliest?: Date
  /** 最新版本时间 */
  latest?: Date
  /** 总存储大小 */
  totalSize: number
}

/**
 * 版本管理器
 * 提供简历版本的创建、恢复、对比等功能
 */
export class VersionManager {
  private static readonly STORAGE_KEY = 'resume_versions'
  private static readonly MAX_VERSIONS = 30
  private static readonly AUTO_SAVE_INTERVAL = 60 * 60 * 1000 // 1小时

  /**
   * 保存新版本
   */
  static saveVersion(
    data: ResumeData,
    note?: string,
    auto = false,
    tags: string[] = []
  ): Version {
    const versions = this.getVersions()
    
    const dataStr = JSON.stringify(data)
    const version: Version = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      data,
      note,
      auto,
      tags,
      size: new Blob([dataStr]).size
    }

    versions.push(version)

    // 清理旧版本，保留最近的版本
    const recentVersions = this.cleanupVersions(versions)
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentVersions))
      return version
    } catch (error) {
      console.error('保存版本失败:', error)
      // 如果存储空间不足，删除最旧的自动版本后重试
      const withoutOldAuto = recentVersions.filter((v, i) => 
        !v.auto || i >= recentVersions.length - 20
      )
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(withoutOldAuto))
      return version
    }
  }

  /**
   * 获取所有版本
   */
  static getVersions(): Version[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return []
      
      const versions = JSON.parse(data) as Version[]
      // 转换日期字符串为Date对象
      return versions.map(v => ({
        ...v,
        timestamp: new Date(v.timestamp)
      }))
    } catch (error) {
      console.error('读取版本失败:', error)
      return []
    }
  }

  /**
   * 获取指定版本
   */
  static getVersion(versionId: string): Version | null {
    const versions = this.getVersions()
    return versions.find(v => v.id === versionId) || null
  }

  /**
   * 恢复到指定版本
   */
  static restoreVersion(versionId: string): ResumeData | null {
    const version = this.getVersion(versionId)
    return version?.data || null
  }

  /**
   * 删除指定版本
   */
  static deleteVersion(versionId: string): boolean {
    try {
      const versions = this.getVersions()
      const filtered = versions.filter(v => v.id !== versionId)
      
      if (filtered.length === versions.length) {
        return false // 版本不存在
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('删除版本失败:', error)
      return false
    }
  }

  /**
   * 删除所有自动版本
   */
  static deleteAutoVersions(): number {
    const versions = this.getVersions()
    const manual = versions.filter(v => !v.auto)
    const deletedCount = versions.length - manual.length
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(manual))
    return deletedCount
  }

  /**
   * 清空所有版本
   */
  static clearAllVersions(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * 获取版本统计信息
   */
  static getStats(): VersionStats {
    const versions = this.getVersions()
    
    if (versions.length === 0) {
      return {
        total: 0,
        autoCount: 0,
        manualCount: 0,
        totalSize: 0
      }
    }

    const autoCount = versions.filter(v => v.auto).length
    const timestamps = versions.map(v => v.timestamp.getTime())
    
    return {
      total: versions.length,
      autoCount,
      manualCount: versions.length - autoCount,
      earliest: new Date(Math.min(...timestamps)),
      latest: new Date(Math.max(...timestamps)),
      totalSize: versions.reduce((sum, v) => sum + v.size, 0)
    }
  }

  /**
   * 对比两个版本
   */
  static compareVersions(versionId1: string, versionId2: string): {
    added: string[]
    removed: string[]
    modified: string[]
  } {
    const v1 = this.getVersion(versionId1)
    const v2 = this.getVersion(versionId2)
    
    if (!v1 || !v2) {
      return { added: [], removed: [], modified: [] }
    }

    const changes = {
      added: [] as string[],
      removed: [] as string[],
      modified: [] as string[]
    }

    // 简单的字段级对比
    const fields = ['personalInfo', 'experience', 'education', 'skills', 'projects']
    
    fields.forEach(field => {
      const val1 = JSON.stringify(v1.data[field as keyof ResumeData])
      const val2 = JSON.stringify(v2.data[field as keyof ResumeData])
      
      if (val1 !== val2) {
        changes.modified.push(field)
      }
    })

    return changes
  }

  /**
   * 导出版本为JSON文件
   */
  static exportVersion(versionId: string): void {
    const version = this.getVersion(versionId)
    if (!version) return

    const exportData = {
      version: version.id,
      timestamp: version.timestamp,
      note: version.note,
      data: version.data
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `resume_version_${version.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 导入版本
   */
  static async importVersion(file: File): Promise<Version | null> {
    try {
      const text = await file.text()
      const imported = JSON.parse(text)
      
      if (!imported.data || !imported.version) {
        throw new Error('无效的版本文件格式')
      }

      return this.saveVersion(
        imported.data,
        `导入: ${imported.note || ''}`,
        false,
        ['imported']
      )
    } catch (error) {
      console.error('导入版本失败:', error)
      return null
    }
  }

  /**
   * 检查是否需要自动保存
   */
  static shouldAutoSave(): boolean {
    const versions = this.getVersions()
    if (versions.length === 0) return true

    const lastVersion = versions[versions.length - 1]
    const timeSinceLastSave = Date.now() - lastVersion.timestamp.getTime()
    
    return timeSinceLastSave >= this.AUTO_SAVE_INTERVAL
  }

  /**
   * 清理版本，保留最重要的版本
   */
  private static cleanupVersions(versions: Version[]): Version[] {
    if (versions.length <= this.MAX_VERSIONS) {
      return versions
    }

    // 保留策略：
    // 1. 所有手动版本
    // 2. 最近的自动版本
    const manual = versions.filter(v => !v.auto)
    const auto = versions.filter(v => v.auto)
    
    // 保留最近的自动版本
    const recentAuto = auto.slice(-(this.MAX_VERSIONS - manual.length))
    
    return [...manual, ...recentAuto].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    )
  }

  /**
   * 格式化版本大小
   */
  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  /**
   * 格式化时间差
   */
  static formatTimeAgo(date: Date): string {
    const now = Date.now()
    const diff = now - date.getTime()
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }
}
