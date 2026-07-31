/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.04.14
 */

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ClipboardCheck, AlertTriangle, ShieldAlert } from 'lucide-react'
import { ResumeData } from '@/types/resume'
import { analyzeDeliveryReadiness } from '@/utils/deliveryReadiness'

interface DeliveryChecklistCardProps {
  resumeData: ResumeData
  className?: string
}

/**
 * 投递前检查卡片
 * 在正式导出前给出更贴近招聘视角的核对提醒。
 */
export default function DeliveryChecklistCard({ resumeData, className = '' }: DeliveryChecklistCardProps) {
  const result = useMemo(() => analyzeDeliveryReadiness(resumeData), [resumeData])

  const headerTone = result.criticalCount > 0
    ? 'border-red-200 bg-red-50/80 text-red-700'
    : result.warningCount > 0
      ? 'border-amber-200 bg-amber-50/80 text-amber-700'
      : 'border-emerald-200 bg-emerald-50/80 text-emerald-700'

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm ${className}`}>
      <div className={`border-b px-5 py-4 ${headerTone}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-current/15 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
              <ClipboardCheck className="h-3.5 w-3.5" />
              投递前检查
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">正式导出前，先把这几个关键点过一遍</h3>
            <p className="mt-1 text-sm text-slate-600">
              比单纯打分更直接，重点看联系方式、成果量化、经历表达和项目亮点是否已经到位。
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-center shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Ready Score</p>
            <motion.p
              initial={{ scale: 0.96, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-1 text-3xl font-semibold tracking-tight text-slate-900"
            >
              {result.readyScore}
            </motion.p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full border border-red-200 bg-white px-3 py-1 text-red-600">严重问题 {result.criticalCount}</span>
          <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-amber-600">待优化 {result.warningCount}</span>
          <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-emerald-600">已通过 {result.goodCount}</span>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {result.items.map((item, index) => {
          const tone = item.level === 'critical'
            ? {
                wrapper: 'border-red-200 bg-red-50/60',
                icon: <ShieldAlert className="h-4 w-4 text-red-500" />,
                badge: '严重问题',
                badgeClass: 'border-red-200 bg-white text-red-600'
              }
            : item.level === 'warning'
              ? {
                  wrapper: 'border-amber-200 bg-amber-50/60',
                  icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
                  badge: '待优化',
                  badgeClass: 'border-amber-200 bg-white text-amber-600'
                }
              : {
                  wrapper: 'border-emerald-200 bg-emerald-50/60',
                  icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                  badge: '已通过',
                  badgeClass: 'border-emerald-200 bg-white text-emerald-600'
                }

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`rounded-2xl border p-4 ${tone.wrapper}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 rounded-xl border border-white/70 bg-white/80 p-2 shadow-sm">
                  {tone.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tone.badgeClass}`}>
                      {tone.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
