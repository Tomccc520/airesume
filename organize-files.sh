#!/bin/bash

# 文件整理脚本
# 将根目录下的文档和脚本文件整理到对应的文件夹

echo "开始整理文件..."

# 创建分类文件夹
mkdir -p docs/optimization
mkdir -p docs/features
mkdir -p docs/deployment
mkdir -p docs/templates
mkdir -p docs/scripts

# 移动优化相关文档
mv AI_OPTIMIZATION_SUMMARY.md docs/optimization/ 2>/dev/null
mv OPTIMIZATION_PLAN.md docs/optimization/ 2>/dev/null
mv OPTIMIZATION_PROGRESS.md docs/optimization/ 2>/dev/null
mv OPTIMIZATION_REPORT.md docs/optimization/ 2>/dev/null
mv OPTIMIZATION_SUMMARY.md docs/optimization/ 2>/dev/null
mv optimization_done.txt docs/optimization/ 2>/dev/null
mv MAGIC_RESUME_OPTIMIZATION.md docs/optimization/ 2>/dev/null
mv SKILLS_THEME_OPTIMIZATION.md docs/optimization/ 2>/dev/null
mv EDITOR_UI_OPTIMIZATION.md docs/optimization/ 2>/dev/null

# 移动功能相关文档
mv AVATAR_BORDER_RADIUS_FEATURE.md docs/features/ 2>/dev/null
mv AVATAR_EDITOR_UI_FEATURE.md docs/features/ 2>/dev/null
mv AVATAR_SHAPE_FEATURE.md docs/features/ 2>/dev/null
mv CORE_FEATURES_INTEGRATION.md docs/features/ 2>/dev/null
mv IMPLEMENTATION_COMPLETE.md docs/features/ 2>/dev/null
mv UPDATES_PAGE_SUMMARY.md docs/features/ 2>/dev/null

# 移动模板相关文档
mv BLACK_WHITE_TEMPLATES.md docs/templates/ 2>/dev/null
mv CANVA_ZHILIAN_TEMPLATES.md docs/templates/ 2>/dev/null
mv TEMPLATE_DESIGN_OPTIMIZATION.md docs/templates/ 2>/dev/null
mv TEMPLATE_OPTIMIZATION_2026_02_02.md docs/templates/ 2>/dev/null
mv TEMPLATE_OPTIMIZATION_COMPLETE.md docs/templates/ 2>/dev/null
mv TEMPLATE_OPTIMIZATION_SUMMARY.md docs/templates/ 2>/dev/null
mv TEMPLATE_SYSTEM_OPTIMIZATION_REPORT.md docs/templates/ 2>/dev/null
mv TEMPLATE_UI_OPTIMIZATION.md docs/templates/ 2>/dev/null
mv TEMPLATE_UNIFIED_STANDARD.md docs/templates/ 2>/dev/null

# 移动部署相关文档
mv NPM_PERMISSION_FIX.md docs/deployment/ 2>/dev/null
mv DYNAMIC_IMPORT_FIX.md docs/deployment/ 2>/dev/null
mv EXPORT_FIX_SUMMARY.md docs/deployment/ 2>/dev/null
mv FINAL_FIX.md docs/deployment/ 2>/dev/null
mv QUICK_FIX.md docs/deployment/ 2>/dev/null

# 移动集成相关文档
mv SHADCN_BUTTON_INTEGRATION.md docs/features/ 2>/dev/null
mv SHADCN_COMPLETE_REPORT.md docs/features/ 2>/dev/null
mv SHADCN_INTEGRATION_FINAL.md docs/features/ 2>/dev/null
mv SHADCN_INTEGRATION.md docs/features/ 2>/dev/null
mv README_SHADCN.md docs/features/ 2>/dev/null

# 移动版权和任务文档
mv COPYRIGHT_AUDIT.md docs/ 2>/dev/null
mv TASK_1_SUMMARY.md docs/ 2>/dev/null
mv TASK_2_SUMMARY.md docs/ 2>/dev/null
mv TASK_8_SUMMARY.md docs/ 2>/dev/null
mv TASK_9_SUMMARY.md docs/ 2>/dev/null
mv TODAY_SUMMARY.md docs/ 2>/dev/null

# 移动脚本文件到 scripts 文件夹
mv check-status.sh docs/scripts/ 2>/dev/null
mv check-style-usage.sh docs/scripts/ 2>/dev/null
mv fix-nextjs-error.sh docs/scripts/ 2>/dev/null
mv install-shadcn-incremental.sh docs/scripts/ 2>/dev/null
mv install-shadcn.sh docs/scripts/ 2>/dev/null
mv MANUAL_INSTALL.sh docs/scripts/ 2>/dev/null
mv quick-start.sh docs/scripts/ 2>/dev/null

# 移动压缩包到单独文件夹
mkdir -p archives
mv *.tar.gz archives/ 2>/dev/null

# 删除 my-resume-builder 空文件夹（如果为空）
rmdir my-resume-builder 2>/dev/null

echo "文件整理完成！"
echo ""
echo "文件夹结构："
echo "  docs/optimization/    - 优化相关文档"
echo "  docs/features/        - 功能相关文档"
echo "  docs/templates/       - 模板相关文档"
echo "  docs/deployment/      - 部署和修复文档"
echo "  docs/scripts/         - 脚本文件"
echo "  archives/             - 压缩包文件"

