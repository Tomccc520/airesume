#!/bin/bash

# Shadcn/ui 增量安装脚本
# 不删除 node_modules，直接安装新依赖

echo "🚀 开始安装 Shadcn/ui 依赖..."
echo ""

# 安装 Radix UI 组件
echo "📦 安装 Radix UI 组件..."
npm install @radix-ui/react-slot@^1.0.2 --legacy-peer-deps

echo "📦 安装 Radix UI Dialog..."
npm install @radix-ui/react-dialog@^1.0.5 --legacy-peer-deps

echo "📦 安装 Radix UI Select..."
npm install @radix-ui/react-select@^2.0.0 --legacy-peer-deps

echo "📦 安装 Radix UI Label..."
npm install @radix-ui/react-label@^2.0.2 --legacy-peer-deps

# 安装 CVA
echo "📦 安装 class-variance-authority..."
npm install class-variance-authority@^0.7.0 --legacy-peer-deps

echo ""
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
echo "🎉 Shadcn/ui 依赖安装完成！"
echo ""
echo "📝 注意：旧的依赖（Three.js, Chakra UI 等）仍然存在"
echo "   如需完全清理，请手动删除 node_modules 后重新安装"
echo ""
echo "🎯 下一步："
echo "  1. 运行 npm run dev 启动开发服务器"
echo "  2. 测试 Button 组件是否正常工作"
echo ""

