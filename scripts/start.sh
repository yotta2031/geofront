#!/bin/bash
# 生产环境启动脚本
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

if [ ! -f .env ]; then
  echo "请先复制并配置环境变量: cp .env.example .env"
  exit 1
fi

export NODE_ENV=production
export STATIC_DIR="${STATIC_DIR:-$DIR/public}"

mkdir -p "$DIR/data"

export ENV_FILE="$DIR/.env"
export STATIC_DIR="${STATIC_DIR:-$DIR/public}"

echo "启动析探GEO服务..."
echo "  端口: ${PORT:-3001}"
echo "  静态: $STATIC_DIR"
cd "$DIR/server"
exec node dist/index.js
