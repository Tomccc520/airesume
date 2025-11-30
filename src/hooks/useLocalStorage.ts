/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */


import { useState, useEffect } from 'react'

/**
 * 本地存储Hook - 提供自动保存和恢复功能
 * @param key 存储键名
 * @param initialValue 初始值
 * @returns [value, setValue, isLoading] 当前值、设置函数、加载状态
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  // 从localStorage读取数据
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsedValue = JSON.parse(item)
        setStoredValue(parsedValue)
      }
    } catch (error) {
      console.warn(`读取localStorage失败 (key: ${key}):`, error)
    } finally {
      setIsLoading(false)
    }
  }, [key])

  // 设置值并保存到localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许传入函数来更新值
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      // 保存到localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`保存到localStorage失败 (key: ${key}):`, error)
    }
  }

  return [storedValue, setValue, isLoading]
}

/**
 * 自动保存Hook - 提供防抖保存功能
 * @param key 存储键名
 * @param value 要保存的值
 * @param delay 防抖延迟时间（毫秒）
 */
export function useAutoSave<T>(key: string, value: T, delay: number = 1000) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    setIsSaving(true)
    
    const timeoutId = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
        setLastSaved(new Date())
      } catch (error) {
        console.error(`自动保存失败 (key: ${key}):`, error)
      } finally {
        setIsSaving(false)
      }
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [key, value, delay])

  return { isSaving, lastSaved }
}

/**
 * 清除本地存储数据
 * @param key 存储键名
 */
export function clearLocalStorage(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error(`清除localStorage失败 (key: ${key}):`, error)
  }
}

/**
 * 获取本地存储数据大小
 * @param key 存储键名
 * @returns 数据大小（字节）
 */
export function getStorageSize(key: string): number {
  try {
    const item = window.localStorage.getItem(key)
    return item ? new Blob([item]).size : 0
  } catch (error) {
    console.error(`获取存储大小失败 (key: ${key}):`, error)
    return 0
  }
}