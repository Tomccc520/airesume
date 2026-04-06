/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-06
 *
 * @description 诊断清单实时完成反馈 Hook，用于识别刚刚达标的检查项。
 */

'use client'

import { useEffect, useRef, useState } from 'react'

interface ChecklistFeedbackItem {
  key: string
  completed: boolean
}

/**
 * 检测刚刚完成的诊断清单项
 * 当同一模块内某条检查项从未完成变为已完成时，返回一个短暂可见的高亮列表。
 */
export function useChecklistCompletionFeedback(
  scopeKey: string,
  checklist: ChecklistFeedbackItem[],
  duration = 2200
) {
  const [recentlyCompletedKeys, setRecentlyCompletedKeys] = useState<string[]>([])
  const previousScopeRef = useRef<string | null>(null)
  const previousChecklistRef = useRef<Record<string, boolean>>({})

  useEffect(() => {
    const nextChecklistMap = checklist.reduce<Record<string, boolean>>((accumulator, item) => {
      accumulator[item.key] = item.completed
      return accumulator
    }, {})

    if (previousScopeRef.current !== scopeKey) {
      previousScopeRef.current = scopeKey
      previousChecklistRef.current = nextChecklistMap
      setRecentlyCompletedKeys([])
      return
    }

    const newlyCompletedKeys = checklist
      .filter((item) => item.completed && previousChecklistRef.current[item.key] === false)
      .map((item) => item.key)

    previousChecklistRef.current = nextChecklistMap

    if (newlyCompletedKeys.length === 0) {
      return
    }

    setRecentlyCompletedKeys(newlyCompletedKeys)

    const timer = window.setTimeout(() => {
      setRecentlyCompletedKeys([])
    }, duration)

    return () => {
      window.clearTimeout(timer)
    }
  }, [checklist, duration, scopeKey])

  return recentlyCompletedKeys
}

/**
 * 检测多个模块里刚刚完成的清单项
 * 适用于导航、章节总览等需要同时观察多个模块完成变化的场景。
 */
export function useScopedChecklistCompletionFeedback(
  scopedChecklists: Record<string, ChecklistFeedbackItem[]>,
  duration = 2200
) {
  const [recentlyCompletedByScope, setRecentlyCompletedByScope] = useState<Record<string, string[]>>({})
  const previousSnapshotsRef = useRef<Record<string, Record<string, boolean>>>({})

  useEffect(() => {
    const nextSnapshots = Object.entries(scopedChecklists).reduce<Record<string, Record<string, boolean>>>(
      (accumulator, [scopeKey, checklist]) => {
        accumulator[scopeKey] = checklist.reduce<Record<string, boolean>>((checklistAccumulator, item) => {
          checklistAccumulator[item.key] = item.completed
          return checklistAccumulator
        }, {})
        return accumulator
      },
      {}
    )

    const nextRecentlyCompleted = Object.entries(scopedChecklists).reduce<Record<string, string[]>>(
      (accumulator, [scopeKey, checklist]) => {
        const previousSnapshot = previousSnapshotsRef.current[scopeKey]
        if (!previousSnapshot) {
          return accumulator
        }

        const newlyCompletedKeys = checklist
          .filter((item) => item.completed && previousSnapshot[item.key] === false)
          .map((item) => item.key)

        if (newlyCompletedKeys.length > 0) {
          accumulator[scopeKey] = newlyCompletedKeys
        }

        return accumulator
      },
      {}
    )

    previousSnapshotsRef.current = nextSnapshots

    if (Object.keys(nextRecentlyCompleted).length === 0) {
      return
    }

    setRecentlyCompletedByScope(nextRecentlyCompleted)

    const timer = window.setTimeout(() => {
      setRecentlyCompletedByScope({})
    }, duration)

    return () => {
      window.clearTimeout(timer)
    }
  }, [duration, scopedChecklists])

  return recentlyCompletedByScope
}
