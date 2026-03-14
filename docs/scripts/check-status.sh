#!/bin/bash

echo "🔍 检查项目状态..."
echo ""

# 检查 node_modules
if [ -d "node_modules" ]; then
    echo "✅ node_modules 存在"
    
    # 检查关键依赖
    if [ -d "node_modules/next" ]; then
        echo "✅ Next.js 已安装"
    else
        echo "❌ Next.js 未安装"
    fi
    
    if [ -d "node_modules/@radix-ui" ]; then
        echo "✅ Radix UI 已安装"
    else
        echo "⚠️  Radix UI 未安装（Shadcn/ui 需要）"
    fi
    
    if [ -d "node_modules/class-variance-authority" ]; then
        echo "✅ CVA 已安装"
    else
        echo "⚠️  CVA 未安装（Shadcn/ui 需要）"
    fi
else
    echo "❌ node_modules 不存在，需要运行 npm install"
fi

echo ""
echo "🌐 检查开发服务器..."
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ 开发服务器正在运行 (http://localhost:3002)"
else
    echo "⚠️  开发服务器未运行"
fi

echo ""
echo "📝 Shadcn/ui 文件状态："
if [ -f "src/components/ui/button.tsx" ]; then
    echo "✅ Button 组件已创建"
else
    echo "❌ Button 组件未创建"
fi

if [ -f "src/lib/utils.ts" ]; then
    echo "✅ 工具函数已创建"
else
    echo "❌ 工具函数未创建"
fi

if [ -f "components.json" ]; then
    echo "✅ Shadcn/ui 配置已创建"
else
    echo "❌ Shadcn/ui 配置未创建"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 下一步："
echo "  1. 如果依赖未安装，运行: npm install"
echo "  2. 如果服务器未运行，运行: npm run dev"
echo "  3. 访问: http://localhost:3002"
echo ""

