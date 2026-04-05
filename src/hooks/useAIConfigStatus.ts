/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 */

'use client'

import { useEffect, useState } from 'react'
import {
  aiService,
  AI_CONFIG_STATUS_EVENT,
  AIConfigStatus
} from '@/services/aiService'

/**
 * 监听当前标签页里的 AI 配置状态
 * 统一封装本地配置读取和事件订阅，避免多个组件重复维护同一套 useEffect。
 */
export function useAIConfigStatus(): AIConfigStatus {
  const [status, setStatus] = useState<AIConfigStatus>(() => aiService.getConfigStatus())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const syncAIConfigStatus = () => {
      setStatus(aiService.getConfigStatus())
    }

    syncAIConfigStatus()
    window.addEventListener(AI_CONFIG_STATUS_EVENT, syncAIConfigStatus)

    return () => {
      window.removeEventListener(AI_CONFIG_STATUS_EVENT, syncAIConfigStatus)
    }
  }, [])

  return status
}
