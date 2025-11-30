/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-04
 * 
 * 加载状态骨架屏组件
 * 为动态导入的组件提供优雅的加载状态
 */

import React from 'react'

/**
 * 编辑器骨架屏
 * 用于 ResumeEditor 组件加载时的占位
 */
export function EditorSkeleton() {
  return (
    <div className="h-full flex bg-gray-50 animate-pulse">
      {/* 左侧导航栏骨架 */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* 标题区域 */}
        <div className="p-4 border-b border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>

        {/* 导航项骨架 */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-100 flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 右侧编辑区域骨架 */}
      <div className="flex-1 flex flex-col min-w-[600px]">
        {/* 标题栏骨架 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-4">
                <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 导航按钮骨架 */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        {/* 内容区域骨架 */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="space-y-6">
            {/* 表单字段骨架 */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-10 bg-gray-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 模板库骨架屏
 * 用于 TemplateGallery/TemplateSelector 组件加载时的占位
 */
export function GallerySkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden animate-pulse">
      {/* 头部骨架 */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <div className="h-7 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-56"></div>
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>

      <div className="flex h-[calc(95vh-120px)]">
        {/* 左侧分类导航骨架 */}
        <div className="w-64 border-r border-gray-200 p-4">
          <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-100 flex items-start space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧模板网格骨架 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-[3/4] bg-gray-100"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 通用加载骨架屏
 * 用于其他组件的简单加载状态
 */
export function GenericSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-full w-full bg-gray-200 rounded"></div>
    </div>
  )
}

/**
 * 动画背景加载占位
 * 用于 AnimatedBackground 组件加载时的占位
 */
export function AnimatedBackgroundSkeleton() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 opacity-50 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-30"></div>
    </div>
  )
}

/**
 * 3D 卡片加载占位
 * 用于 Feature3DCard 组件加载时的占位
 */
export function Feature3DCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-pulse">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}
