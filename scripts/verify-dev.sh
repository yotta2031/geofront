#!/usr/bin/env bash
# 修改后开发环境验证：编译 + 接口冒烟
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}!${NC} $1"; }

echo "========== 1/4 后端 TypeScript 编译 =========="
(cd backend && npm run build) && pass "后端编译通过"

echo ""
echo "========== 2/4 前端生产构建 =========="
(cd frontend && npm run build) && pass "前端构建通过"

echo ""
echo "========== 3/4 后端健康检查 =========="
API_BASE="${API_BASE:-http://localhost:3001}"
HEALTH_URL="${API_BASE}/health"

if curl -sf --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
  pass "健康检查 ${HEALTH_URL}"
else
  warn "后端未运行（${HEALTH_URL}），跳过接口冒烟。请先执行: cd backend && npm run dev"
  echo ""
  echo "========== 验证摘要 =========="
  echo "编译检查：通过 | 接口冒烟：已跳过（服务未启动）"
  exit 0
fi

echo ""
echo "========== 4/5 接口冒烟（登录 + 网站媒体列表）=========="
LOGIN_RESP=$(curl -sf --max-time 10 -X POST "${API_BASE}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}') || fail "登录接口请求失败"

TOKEN=$(echo "$LOGIN_RESP" | node -e "
  let s=''; process.stdin.on('data',d=>s+=d);
  process.stdin.on('end',()=>{
    try {
      const j=JSON.parse(s);
      if (j.code!==1||!j.data?.token) process.exit(1);
      console.log(j.data.token);
    } catch { process.exit(1); }
  });
") || fail "登录响应解析失败（请确认 admin/123456 已 seed）"

pass "登录成功"

MEDIA_RESP=$(curl -sf --max-time 15 "${API_BASE}/api/webmedia/media?page=1&pageSize=2" \
  -H "Authorization: Bearer ${TOKEN}") || fail "网站媒体列表接口失败"

echo "$MEDIA_RESP" | node -e "
  let s=''; process.stdin.on('data',d=>s+=d);
  process.stdin.on('end',()=>{
    const j=JSON.parse(s);
    if (j.code!==1) { console.error('code=', j.code, j.msg); process.exit(1); }
    const n=(j.data?.list||[]).length;
    if (n<1) { console.error('列表为空'); process.exit(1); }
    console.log('媒体条数:', n, '总计:', j.data?.total);
  });
" && pass "网站媒体列表 API 正常"

echo ""
echo "========== 5/5 个人自媒体账号列表 =========="
WEIXIN_RESP=$(curl -sf --max-time 15 "${API_BASE}/api/weixin/accounts?page=1&pageSize=2" \
  -H "Authorization: Bearer ${TOKEN}") || fail "个人自媒体账号接口失败"

echo "$WEIXIN_RESP" | node -e "
  let s=''; process.stdin.on('data',d=>s+=d);
  process.stdin.on('end',()=>{
    const j=JSON.parse(s);
    if (j.code!==1) { console.error(j.msg); process.exit(1); }
    const n=(j.data?.list||[]).length;
    if (n<1) { console.error('自媒体账号列表为空，请执行: cd backend && npm run db:seed:weixin'); process.exit(1); }
    console.log('账号条数:', n);
  });
" && pass "个人自媒体 API 正常"

echo ""
echo "========== 全部验证通过 =========="
