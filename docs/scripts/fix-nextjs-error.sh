#!/bin/bash

# Next.js 错误修复脚本
# 用于解决 "missing required error components" 错误

echo "=========================================="
echo "🔧 Next.js 错误修复脚本"
echo "=========================================="
echo ""

# 1. 停止所有 Next.js 进程
echo "1️⃣  停止所有 Next.js 进程..."
pkill -f "node.*next" 2>/dev/null
sleep 1
echo "✅ 已停止"
echo ""

# 2. 清理 .next 缓存
echo "2️⃣  清理 .next 缓存..."
rm -rf .next
echo "✅ 已清理 .next"
echo ""

# 3. 清理 node_modules 缓存
echo "3️⃣  清理 node_modules 缓存..."
rm -rf node_modules/.cache
echo "✅ 已清理 node_modules/.cache"
echo ""

# 4. 清理 TypeScript 缓存
echo "4️⃣  清理 TypeScript 缓存..."
rm -f tsconfig.tsbuildinfo
echo "✅ 已清理 TypeScript 缓存"
echo ""

echo "=========================================="
echo "✅ 清理完成！"
echo "=========================================="
echo ""
echo "📝 下一步操作："
echo "   请运行: npm run dev"
echo ""
echo "如果还有问题，请尝试："
echo "   1. 完全重启终端"
echo "   2. 运行: npm install"
echo "   3. 再次运行: npm run dev"
echo ""

