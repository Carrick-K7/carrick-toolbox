#!/bin/bash
set -e

# === 部署脚本唯一性检查 ===
# 1. 确保在项目根目录执行
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 必须在项目根目录下执行本脚本（需存在 package.json）"
    exit 1
fi

# 2. 检查是否存在其他 deploy*.sh 脚本（备份文件除外）
OTHER_DEPLOY_SCRIPTS=$(find . -type f -name "deploy*.sh" ! -name "*.bak" ! -path "./deploy.sh" 2>/dev/null)
if [ -n "$OTHER_DEPLOY_SCRIPTS" ]; then
    echo "❌ 错误: 发现以下非法部署脚本："
    echo "$OTHER_DEPLOY_SCRIPTS"
    echo "请先清理这些脚本，确保 deploy.sh 为唯一部署入口。"
    exit 1
fi

PROJECT_DIR="/root/.openclaw/workspace/projects/carrick-toolbox"
DEPLOY_DIR="/var/www/toolbox.carrick7.com"

# 【v10.4 Verified锁】检查最后一次提交是否包含[Verified]
if ! git log --format="%s" -n 1 | grep -q "\[Verified\]"; then
    echo "❌ 错误: 最后一次提交缺少 [Verified] 签名！"
    echo "按 v10.4 协议，必须由 Miku 执行 git commit --amend -m '[Verified]'"
    exit 1
fi

cd "$PROJECT_DIR"

# 【身份锁】检查是否有未提交的代码
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 错误: 检测到未提交的内容！"
    echo "按照 Carrick 协议，必须先 git commit 产生 Hash，才能执行构建。"
    exit 1
fi

echo "📦 步骤1: 构建项目..."
npm run build

echo "📤 步骤2: 物理置换..."
sudo rm -rf "$DEPLOY_DIR"/*
sudo cp -r dist/* "$DEPLOY_DIR/"

echo "✅ 部署完成！"
echo ""
echo "💡 提示: Caddy配置由 carrick-infra 项目独立管理"
echo "   如需更新路由，请修改 carrick-infra/caddy/projects/toolbox.caddy"