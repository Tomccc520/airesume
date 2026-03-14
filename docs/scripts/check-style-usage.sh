#!/bin/bash

# StyleContext使用情况检查脚本
# 用于检查哪些样式配置已使用，哪些未使用

echo "======================================"
echo "StyleContext 使用情况检查"
echo "======================================"
echo ""

# 设置项目路径
PROJECT_PATH="/Users/tangxiaoda/Desktop/网站备份/简历/resume"
cd "$PROJECT_PATH"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📊 检查各配置项的使用情况..."
echo ""

# 1. 检查 contactLayout
echo "1️⃣  检查 contactLayout (联系信息布局):"
CONTACT_LAYOUT_COUNT=$(grep -r "contactLayout" src/components/ --include="*.tsx" | wc -l)
if [ $CONTACT_LAYOUT_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ 已使用 ($CONTACT_LAYOUT_COUNT 处)${NC}"
    grep -r "contactLayout" src/components/ --include="*.tsx" -n | head -5
else
    echo -e "${RED}❌ 未使用${NC}"
fi
echo ""

# 2. 检查 sectionOrder
echo "2️⃣  检查 sectionOrder (模块顺序):"
SECTION_ORDER_COUNT=$(grep -r "sectionOrder" src/components/ --include="*.tsx" | wc -l)
if [ $SECTION_ORDER_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ 已使用 ($SECTION_ORDER_COUNT 处)${NC}"
    grep -r "sectionOrder" src/components/ --include="*.tsx" -n | head -5
else
    echo -e "${RED}❌ 未使用${NC}"
fi
echo ""

# 3. 检查 columnSectionOrder
echo "3️⃣  检查 columnSectionOrder (双栏内容顺序):"
COLUMN_ORDER_COUNT=$(grep -r "columnSectionOrder" src/components/ --include="*.tsx" | wc -l)
if [ $COLUMN_ORDER_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ 已使用 ($COLUMN_ORDER_COUNT 处)${NC}"
    grep -r "columnSectionOrder" src/components/ --include="*.tsx" -n | head -5
else
    echo -e "${RED}❌ 未使用${NC}"
fi
echo ""

# 4. 检查 displayStyle
echo "4️⃣  检查 skills.displayStyle (技能展示样式):"
DISPLAY_STYLE_COUNT=$(grep -r "displayStyle" src/components/ --include="*.tsx" | wc -l)
if [ $DISPLAY_STYLE_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ 已使用 ($DISPLAY_STYLE_COUNT 处)${NC}"
    grep -r "displayStyle" src/components/ --include="*.tsx" -n | head -5
else
    echo -e "${RED}❌ 未使用${NC}"
fi
echo ""

# 5. 检查 avatar.url
echo "5️⃣  检查 avatar.url (头像URL):"
AVATAR_URL_COUNT=$(grep -r "avatar.*url\|avatar\.url" src/components/ --include="*.tsx" | wc -l)
if [ $AVATAR_URL_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ 已使用 ($AVATAR_URL_COUNT 处)${NC}"
    grep -r "avatar.*url\|avatar\.url" src/components/ --include="*.tsx" -n | head -5
else
    echo -e "${RED}❌ 未使用${NC}"
fi
echo ""

# 6. 检查 headerLayout
echo "6️⃣  检查 headerLayout (头部布局):"
HEADER_LAYOUT_COUNT=$(grep -r "headerLayout" src/components/ --include="*.tsx" | wc -l)
if [ $HEADER_LAYOUT_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ 已使用 ($HEADER_LAYOUT_COUNT 处)${NC}"
    grep -r "headerLayout" src/components/ --include="*.tsx" -n | head -5
else
    echo -e "${RED}❌ 未使用${NC}"
fi
echo ""

# 7. 检查 sectionSpacing
echo "7️⃣  检查 sectionSpacing (模块间距):"
SECTION_SPACING_COUNT=$(grep -r "sectionSpacing" src/components/ --include="*.tsx" | wc -l)
if [ $SECTION_SPACING_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ 已使用 ($SECTION_SPACING_COUNT 处)${NC}"
    grep -r "sectionSpacing" src/components/ --include="*.tsx" -n | head -5
else
    echo -e "${RED}❌ 未使用${NC}"
fi
echo ""

# 8. 检查 alignment
echo "8️⃣  检查 alignment (对齐方式):"
ALIGNMENT_COUNT=$(grep -r "alignment" src/components/ --include="*.tsx" | grep -v "items-center\|justify-center" | wc -l)
if [ $ALIGNMENT_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ 已使用 ($ALIGNMENT_COUNT 处)${NC}"
    grep -r "alignment" src/components/ --include="*.tsx" -n | grep -v "items-center\|justify-center" | head -5
else
    echo -e "${RED}❌ 未使用${NC}"
fi
echo ""

# 9. 检查 groupByCategory
echo "9️⃣  检查 skills.groupByCategory (技能分类):"
GROUP_BY_CATEGORY_COUNT=$(grep -r "groupByCategory" src/components/ --include="*.tsx" | wc -l)
if [ $GROUP_BY_CATEGORY_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ 已使用 ($GROUP_BY_CATEGORY_COUNT 处)${NC}"
    grep -r "groupByCategory" src/components/ --include="*.tsx" -n | head -5
else
    echo -e "${RED}❌ 未使用${NC}"
fi
echo ""

# 10. 检查 showCategory
echo "🔟 检查 skills.showCategory (显示分类):"
SHOW_CATEGORY_COUNT=$(grep -r "showCategory" src/components/ --include="*.tsx" | wc -l)
if [ $SHOW_CATEGORY_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ 已使用 ($SHOW_CATEGORY_COUNT 处)${NC}"
    grep -r "showCategory" src/components/ --include="*.tsx" -n | head -5
else
    echo -e "${RED}❌ 未使用${NC}"
fi
echo ""

echo "======================================"
echo "📈 统计总结"
echo "======================================"

# 统计使用情况
TOTAL_CONFIGS=10
USED_CONFIGS=0

[ $CONTACT_LAYOUT_COUNT -gt 0 ] && ((USED_CONFIGS++))
[ $SECTION_ORDER_COUNT -gt 0 ] && ((USED_CONFIGS++))
[ $COLUMN_ORDER_COUNT -gt 0 ] && ((USED_CONFIGS++))
[ $DISPLAY_STYLE_COUNT -gt 0 ] && ((USED_CONFIGS++))
[ $AVATAR_URL_COUNT -gt 0 ] && ((USED_CONFIGS++))
[ $HEADER_LAYOUT_COUNT -gt 0 ] && ((USED_CONFIGS++))
[ $SECTION_SPACING_COUNT -gt 0 ] && ((USED_CONFIGS++))
[ $ALIGNMENT_COUNT -gt 0 ] && ((USED_CONFIGS++))
[ $GROUP_BY_CATEGORY_COUNT -gt 0 ] && ((USED_CONFIGS++))
[ $SHOW_CATEGORY_COUNT -gt 0 ] && ((USED_CONFIGS++))

UNUSED_CONFIGS=$((TOTAL_CONFIGS - USED_CONFIGS))
USAGE_PERCENT=$((USED_CONFIGS * 100 / TOTAL_CONFIGS))

echo ""
echo "总配置项: $TOTAL_CONFIGS"
echo -e "${GREEN}已使用: $USED_CONFIGS${NC}"
echo -e "${RED}未使用: $UNUSED_CONFIGS${NC}"
echo "使用率: $USAGE_PERCENT%"
echo ""

if [ $UNUSED_CONFIGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  建议：${NC}"
    echo "1. 检查未使用的配置项是否需要实现"
    echo "2. 如果不需要，考虑从 StyleContext.tsx 中移除"
    echo "3. 更新相关的 TypeScript 类型定义"
fi

echo ""
echo "======================================"
echo "✅ 检查完成"
echo "======================================"

