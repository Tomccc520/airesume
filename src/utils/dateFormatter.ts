/**
 * Date formatting utility for locale-aware date display
 */

import { Locale } from '@/types/i18n'

/**
 * Format a date string based on locale
 * @param date - Date string in YYYY-MM format
 * @param locale - Current locale ('zh' or 'en')
 * @param templateFormat - Optional template format override
 * @returns Formatted date string
 */
export function formatDate(
  date: string | undefined,
  locale: Locale,
  templateFormat?: 'YYYY-MM' | 'MM/YYYY' | 'YYYY年MM月' | 'YYYY' | 'YYYY.MM' | 'MMM YYYY'
): string {
  if (!date) return ''
  
  // Handle special cases like "至今" or "Present"
  if (date === '至今' || date.toLowerCase() === 'present') {
    return locale === 'en' ? 'Present' : '至今'
  }
  
  // Parse the date string (expected format: YYYY-MM)
  const parts = date.split('-')
  if (parts.length < 2) return date
  
  const [year, month] = parts
  
  // If template format is specified, use it
  if (templateFormat) {
    switch (templateFormat) {
      case 'MM/YYYY':
        return `${month}/${year}`
      case 'YYYY年MM月':
        return `${year}年${month}月`
      case 'YYYY.MM':
        return `${year}.${month}`
      case 'MMM YYYY': {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthIndex = Math.max(1, Math.min(12, Number(month))) - 1
        return `${monthNames[monthIndex]} ${year}`
      }
      case 'YYYY':
        return year
      case 'YYYY-MM':
      default:
        return date
    }
  }
  
  // Default locale-based formatting
  if (locale === 'en') {
    // English format: MM/YYYY (e.g., 03/2024)
    return `${month}/${year}`
  } else {
    // Chinese format: YYYY-MM (e.g., 2024-03)
    return date
  }
}

/**
 * Format a date range based on locale
 * @param startDate - Start date string in YYYY-MM format
 * @param endDate - End date string in YYYY-MM format or "至今"/"Present"
 * @param locale - Current locale ('zh' or 'en')
 * @param isCurrent - Whether this is a current position
 * @param templateFormat - Optional template format override
 * @returns Formatted date range string
 */
export function formatDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
  locale: Locale,
  isCurrent?: boolean,
  templateFormat?: 'YYYY-MM' | 'MM/YYYY' | 'YYYY年MM月' | 'YYYY' | 'YYYY.MM' | 'MMM YYYY'
): string {
  const formattedStart = formatDate(startDate, locale, templateFormat)
  
  if (isCurrent) {
    const presentText = locale === 'en' ? 'Present' : '至今'
    return `${formattedStart} - ${presentText}`
  }
  
  const formattedEnd = formatDate(endDate, locale, templateFormat)
  return `${formattedStart} - ${formattedEnd}`
}
