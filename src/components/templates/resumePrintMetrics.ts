/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-14
 */

export interface UnifiedResumeMetrics {
  nameSize: number
  roleSize: number
  sectionTitleSize: number
  itemTitleSize: number
  metaSize: number
  bodyLineHeight: number
  summaryLineHeight: number
  sectionGap: number
  sectionTitlePaddingBottom: number
  sectionTitleMarginBottom: number
  entryGap: number
  bulletGap: number
  dateColumnWidth: number
  headerAvatarSize: number
  nameWeight: number
  roleWeight: number
  sectionTitleWeight: number
  itemTitleWeight: number
  metaWeight: number
}

interface UnifiedResumeMetricOptions {
  baseContentSize: number
  sectionSpacing?: number
}

/**
 * 生成统一投递版排版参数
 * 对齐主流招聘工具的导出观感，统一标题比例、时间列宽和条目间距。
 */
export const getUnifiedResumeMetrics = ({
  baseContentSize,
  sectionSpacing
}: UnifiedResumeMetricOptions): UnifiedResumeMetrics => {
  const safeBase = Math.max(12, baseContentSize)
  return {
    nameSize: Math.round(safeBase * 2.14),
    roleSize: Math.round(safeBase * 1.24),
    sectionTitleSize: Math.round(safeBase * 1.0),
    itemTitleSize: Math.round(safeBase * 1.08),
    metaSize: Math.round(safeBase * 0.86),
    bodyLineHeight: 1.58,
    summaryLineHeight: 1.64,
    sectionGap: Math.min(Math.max(sectionSpacing || 24, 20), 24),
    sectionTitlePaddingBottom: 6,
    sectionTitleMarginBottom: 10,
    entryGap: 12,
    bulletGap: 6,
    dateColumnWidth: 124,
    headerAvatarSize: 72,
    nameWeight: 700,
    roleWeight: 500,
    sectionTitleWeight: 700,
    itemTitleWeight: 600,
    metaWeight: 500
  }
}
