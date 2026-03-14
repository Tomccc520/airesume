#!/bin/bash

###############################################################################
# 推送开源项目完善内容
# @copyright Tomda (https://www.tomda.top)
# @copyright UIED技术团队 (https://fsuied.com)
# @author UIED技术团队
# @createDate 2026.3.6
###############################################################################

set -e

echo "🚀 推送开源项目完善内容..."
echo ""

cd "/Users/tangxiaoda/Desktop/网站备份/简历/resume"

# 1. 添加所有更改
echo "📦 添加所有更改..."
git add -A

# 2. 提交更改
echo "💾 提交更改..."
git commit -m "docs: 完善开源项目基础设施

- 增强 README.md（添加演示、路线图、Star History）
- 添加 SECURITY.md（安全政策）
- 添加 CODE_OF_CONDUCT.md（行为准则）
- 添加 CHANGELOG.md（变更日志）
- 添加 GitHub Issue 模板（Bug 报告、功能请求）
- 添加 GitHub PR 模板
- 添加 GitHub Actions CI/CD 配置
- 更新 .gitignore
- 添加开源项目完善清单"

# 3. 推送到所有远程仓库
echo ""
echo "⬆️  推送到 Gitee..."
git push gitee-new main

echo ""
echo "⬆️  推送到 GitHub..."
git push github-new main

echo ""
echo "✅ 完成！"
echo ""
echo "🎉 开源项目基础设施已完善！"
echo ""
echo "📋 已完成："
echo "   ✅ README 增强"
echo "   ✅ 安全政策"
echo "   ✅ 行为准则"
echo "   ✅ 变更日志"
echo "   ✅ Issue/PR 模板"
echo "   ✅ CI/CD 配置"
echo ""
echo "🔗 仓库地址："
echo "   Gitee:  https://gitee.com/tomdac/airesume"
echo "   GitHub: https://github.com/Tomccc520/airesume"
echo ""
echo "📝 下一步建议："
echo "   1. 添加项目截图到 docs/screenshots/"
echo "   2. 部署演示站点（Vercel/Netlify）"
echo "   3. 创建第一个 Release (v1.0.0)"
echo "   4. 启用 GitHub Discussions"
echo ""

