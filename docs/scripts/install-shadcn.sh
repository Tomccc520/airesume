#!/bin/bash

# Shadcn/ui 集成脚本
# 作者：UIED技术团队
# 日期：2026.1.31

echo "🚀 开始集成 Shadcn/ui..."

# 1. 删除旧的 node_modules 和 package-lock.json
echo "📦 清理旧依赖..."
rm -rf node_modules package-lock.json

# 2. 安装新依赖
echo "📥 安装新依赖..."
npm install

# 3. 验证安装
echo "✅ 验证安装..."
if [ -d "node_modules/@radix-ui" ]; then
    echo "✅ Radix UI 安装成功"
else
    echo "❌ Radix UI 安装失败"
    exit 1
fi

if [ -d "node_modules/class-variance-authority" ]; then
    echo "✅ CVA 安装成功"
else
    echo "❌ CVA 安装失败"
    exit 1
fi

echo ""
echo "🎉 Shadcn/ui 集成完成！"
echo ""
echo "📝 已删除的多余依赖："
echo "  ❌ @chakra-ui/react"
echo "  ❌ @emotion/react"
echo "  ❌ @emotion/styled"
echo "  ❌ @react-three/fiber"
echo "  ❌ @react-three/drei"
echo "  ❌ three.js"
echo "  ❌ gsap"
echo "  ❌ ogl"
echo ""
echo "✅ 已添加的新依赖："
echo "  ✅ @radix-ui/react-slot"
echo "  ✅ @radix-ui/react-dialog"
echo "  ✅ @radix-ui/react-select"
echo "  ✅ @radix-ui/react-label"
echo "  ✅ class-variance-authority"
echo ""
echo "🎯 下一步："
echo "  1. 运行 npm run dev 启动开发服务器"
echo "  2. 查看 SHADCN_INTEGRATION.md 了解如何使用新组件"
echo ""

