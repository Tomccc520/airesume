/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.29
 * @description 模板收藏功能 - 本地存储
 */

const FAVORITES_KEY = 'resume_favorite_templates'

/**
 * 获取收藏的模板ID列表
 */
export const getFavoriteTemplates = (): string[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY)
    return favorites ? JSON.parse(favorites) : []
  } catch (error) {
    console.error('获取收藏模板失败:', error)
    return []
  }
}

/**
 * 添加模板到收藏
 */
export const addFavoriteTemplate = (templateId: string): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    const favorites = getFavoriteTemplates()
    if (!favorites.includes(templateId)) {
      favorites.push(templateId)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
      return true
    }
    return false
  } catch (error) {
    console.error('添加收藏失败:', error)
    return false
  }
}

/**
 * 从收藏中移除模板
 */
export const removeFavoriteTemplate = (templateId: string): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    const favorites = getFavoriteTemplates()
    const filtered = favorites.filter(id => id !== templateId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('移除收藏失败:', error)
    return false
  }
}

/**
 * 检查模板是否已收藏
 */
export const isFavoriteTemplate = (templateId: string): boolean => {
  const favorites = getFavoriteTemplates()
  return favorites.includes(templateId)
}

/**
 * 切换模板收藏状态
 */
export const toggleFavoriteTemplate = (templateId: string): boolean => {
  if (isFavoriteTemplate(templateId)) {
    removeFavoriteTemplate(templateId)
    return false
  } else {
    addFavoriteTemplate(templateId)
    return true
  }
}

