/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.30
 * @description 模板系统测试脚本
 */

import { resumeTemplates, templateCategories, popularTemplateIds } from '../data/templates'
import { validateTemplates, printValidationReport, getValidationSummary } from '../utils/templateValidator'

/**
 * 测试模板系统的完整性
 */
export const testTemplateSystem = () => {
  console.log('\n========================================')
  console.log('🧪 开始测试模板系统')
  console.log('========================================\n')

  // 1. 基本统计
  console.log('📊 基本统计信息:')
  console.log(`  总模板数: ${resumeTemplates.length}`)
  console.log(`  分类数: ${templateCategories.length}`)
  console.log(`  热门模板数: ${popularTemplateIds.length}`)
  
  // 2. 布局类型统计
  const layoutStats = {
    'top-bottom': 0,
    'left-right': 0,
    'undefined': 0
  }
  
  resumeTemplates.forEach(template => {
    if (template.layoutType === 'top-bottom') {
      layoutStats['top-bottom']++
    } else if (template.layoutType === 'left-right') {
      layoutStats['left-right']++
    } else {
      layoutStats['undefined']++
    }
  })
  
  console.log('\n📐 布局类型分布:')
  console.log(`  上下栏布局: ${layoutStats['top-bottom']}`)
  console.log(`  左右栏布局: ${layoutStats['left-right']}`)
  console.log(`  未定义布局: ${layoutStats['undefined']}`)
  
  // 3. 分类统计
  console.log('\n📁 分类分布:')
  const categoryStats: Record<string, number> = {}
  resumeTemplates.forEach(template => {
    categoryStats[template.category] = (categoryStats[template.category] || 0) + 1
  })
  
  Object.entries(categoryStats).forEach(([category, count]) => {
    const categoryInfo = templateCategories.find(c => c.id === category)
    console.log(`  ${categoryInfo?.name || category}: ${count}`)
  })
  
  // 4. 国际化检查
  console.log('\n🌍 国际化完整性:')
  const i18nStats = {
    hasNameEn: 0,
    hasDescriptionEn: 0,
    complete: 0
  }
  
  resumeTemplates.forEach(template => {
    if (template.nameEn) i18nStats.hasNameEn++
    if (template.descriptionEn) i18nStats.hasDescriptionEn++
    if (template.nameEn && template.descriptionEn) i18nStats.complete++
  })
  
  console.log(`  有英文名称: ${i18nStats.hasNameEn}/${resumeTemplates.length}`)
  console.log(`  有英文描述: ${i18nStats.hasDescriptionEn}/${resumeTemplates.length}`)
  console.log(`  完全国际化: ${i18nStats.complete}/${resumeTemplates.length}`)
  
  // 5. 预览图检查
  console.log('\n🖼️  预览图路径检查:')
  const previewStats = {
    valid: 0,
    invalid: 0,
    missing: 0
  }
  
  const previewPaths = new Set<string>()
  resumeTemplates.forEach(template => {
    if (!template.preview) {
      previewStats.missing++
    } else if (template.preview.startsWith('/templates/')) {
      previewStats.valid++
      previewPaths.add(template.preview)
    } else {
      previewStats.invalid++
    }
  })
  
  console.log(`  有效路径: ${previewStats.valid}`)
  console.log(`  无效路径: ${previewStats.invalid}`)
  console.log(`  缺失路径: ${previewStats.missing}`)
  console.log(`  唯一预览图: ${previewPaths.size}`)
  
  // 6. 高级模板统计
  console.log('\n👑 高级模板统计:')
  const premiumCount = resumeTemplates.filter(t => t.isPremium).length
  const freeCount = resumeTemplates.length - premiumCount
  console.log(`  免费模板: ${freeCount}`)
  console.log(`  高级模板: ${premiumCount}`)
  
  // 7. 隐藏模板统计
  console.log('\n👁️  可见性统计:')
  const hiddenCount = resumeTemplates.filter(t => t.hidden).length
  const visibleCount = resumeTemplates.length - hiddenCount
  console.log(`  可见模板: ${visibleCount}`)
  console.log(`  隐藏模板: ${hiddenCount}`)
  
  // 8. 验证所有模板
  console.log('\n✅ 模板数据验证:')
  const validationResults = validateTemplates(resumeTemplates)
  const summary = getValidationSummary(validationResults)
  
  console.log(`  验证通过率: ${summary.validationRate}`)
  console.log(`  有效模板: ${summary.validTemplates}/${summary.totalTemplates}`)
  console.log(`  总错误数: ${summary.totalErrors}`)
  console.log(`  总警告数: ${summary.totalWarnings}`)
  
  // 9. 详细验证报告
  if (summary.totalErrors > 0 || summary.totalWarnings > 0) {
    console.log('\n⚠️  详细验证报告:')
    printValidationReport(validationResults)
  }
  
  // 10. 热门模板检查
  console.log('\n⭐ 热门模板检查:')
  const invalidPopularIds = popularTemplateIds.filter(
    id => !resumeTemplates.find(t => t.id === id)
  )
  
  if (invalidPopularIds.length > 0) {
    console.log(`  ❌ 无效的热门模板ID: ${invalidPopularIds.join(', ')}`)
  } else {
    console.log(`  ✅ 所有热门模板ID有效`)
  }
  
  // 11. 分类完整性检查
  console.log('\n📂 分类完整性检查:')
  templateCategories.forEach(category => {
    const templateCount = category.templates.length
    const actualCount = resumeTemplates.filter(t => t.category === category.id && !t.hidden).length
    
    if (templateCount !== actualCount) {
      console.log(`  ⚠️  ${category.name}: 分类中有${templateCount}个，实际有${actualCount}个`)
    } else {
      console.log(`  ✅ ${category.name}: ${templateCount}个模板`)
    }
  })
  
  // 12. 布局一致性检查
  console.log('\n🔍 布局一致性检查:')
  let inconsistentCount = 0
  
  resumeTemplates.forEach(template => {
    const layoutType = template.layoutType
    const columnCount = template.layout.columns.count
    
    if (layoutType === 'top-bottom' && columnCount === 2) {
      console.log(`  ⚠️  ${template.id}: 布局类型为top-bottom但分栏数为2`)
      inconsistentCount++
    }
    
    if (layoutType === 'left-right' && columnCount === 1) {
      console.log(`  ⚠️  ${template.id}: 布局类型为left-right但分栏数为1`)
      inconsistentCount++
    }
  })
  
  if (inconsistentCount === 0) {
    console.log(`  ✅ 所有模板布局配置一致`)
  } else {
    console.log(`  ⚠️  发现${inconsistentCount}个布局不一致的模板`)
  }
  
  // 13. 颜色配置检查
  console.log('\n🎨 颜色配置检查:')
  let colorIssues = 0
  
  resumeTemplates.forEach(template => {
    const requiredColors = ['primary', 'secondary', 'accent', 'text', 'background']
    const missingColors = requiredColors.filter(
      color => !template.colors[color as keyof typeof template.colors]
    )
    
    if (missingColors.length > 0) {
      console.log(`  ❌ ${template.id}: 缺少颜色 ${missingColors.join(', ')}`)
      colorIssues++
    }
  })
  
  if (colorIssues === 0) {
    console.log(`  ✅ 所有模板颜色配置完整`)
  } else {
    console.log(`  ❌ ${colorIssues}个模板颜色配置不完整`)
  }
  
  // 14. 字体配置检查
  console.log('\n🔤 字体配置检查:')
  let fontIssues = 0
  
  resumeTemplates.forEach(template => {
    if (!template.fonts.heading || !template.fonts.body) {
      console.log(`  ❌ ${template.id}: 字体配置不完整`)
      fontIssues++
    }
  })
  
  if (fontIssues === 0) {
    console.log(`  ✅ 所有模板字体配置完整`)
  } else {
    console.log(`  ❌ ${fontIssues}个模板字体配置不完整`)
  }
  
  // 15. 总结
  console.log('\n========================================')
  console.log('📝 测试总结')
  console.log('========================================')
  
  const allPassed = 
    layoutStats['undefined'] === 0 &&
    summary.totalErrors === 0 &&
    invalidPopularIds.length === 0 &&
    inconsistentCount === 0 &&
    colorIssues === 0 &&
    fontIssues === 0
  
  if (allPassed) {
    console.log('✅ 所有测试通过！模板系统运行正常。')
  } else {
    console.log('⚠️  发现一些问题，请查看上面的详细报告。')
  }
  
  console.log('\n测试完成时间:', new Date().toLocaleString('zh-CN'))
  console.log('========================================\n')
  
  return {
    passed: allPassed,
    stats: {
      total: resumeTemplates.length,
      layoutStats,
      categoryStats,
      i18nStats,
      previewStats,
      premiumCount,
      freeCount,
      hiddenCount,
      visibleCount
    },
    validation: summary,
    issues: {
      invalidPopularIds,
      inconsistentCount,
      colorIssues,
      fontIssues
    }
  }
}

// 如果直接运行此文件
if (typeof window === 'undefined' && require.main === module) {
  testTemplateSystem()
}

export default testTemplateSystem

