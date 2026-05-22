#!/bin/bash
# 构建生产发布包
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RELEASE="$ROOT/release"
VERSION="$(date +%Y%m%d_%H%M%S)"
ARCHIVE="$ROOT/geo-crm-release-${VERSION}.tar.gz"

echo "==> 构建前后端..."
cd "$ROOT"
npm run build

echo "==> 组装发布目录..."
rm -rf "$RELEASE"
mkdir -p "$RELEASE/public" "$RELEASE/server" "$RELEASE/data"

cp -r "$ROOT/frontend/dist/"* "$RELEASE/public/"
cp -r "$ROOT/backend/dist" "$RELEASE/server/dist"
cp "$ROOT/backend/package.json" "$RELEASE/server/package.json"
cp "$ROOT/backend/.env.example" "$RELEASE/.env.example"
cp "$ROOT/scripts/start.sh" "$RELEASE/start.sh"
chmod +x "$RELEASE/start.sh"

echo "==> 安装后端生产依赖..."
cd "$RELEASE/server"
npm install --omit=dev --no-audit --no-fund

echo "==> 打包 tar.gz..."
cd "$ROOT"
tar -czf "$ARCHIVE" release

echo ""
echo "✅ 发布包已生成:"
echo "   目录: $RELEASE"
echo "   压缩包: $ARCHIVE"
echo ""
echo "上传到服务器后:"
echo "   tar -xzf geo-crm-release-*.tar.gz"
echo "   cd release && cp .env.example .env  # 编辑 JWT_SECRET 等"
echo "   ./start.sh"
