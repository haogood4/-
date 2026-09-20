#!/usr/bin/env bash
# scripts/deploy-cf-pages.sh
# 用途：把 dist/ 部署到 Cloudflare Pages（项目名 CF_PAGES_PROJECT_NAME，默认 calculator-site）。
# 用法：
#   1. export PUBLIC_SITE_URL=https://你的域名   # 必填，predeploy 守卫会校验
#   2. export CF_API_TOKEN=***                   # wrangler login 后自动管理；或显式提供
#   3. export CF_PAGES_PROJECT_NAME=calculator-site  # 可选，默认 calculator-site
#   4. export CF_ACCOUNT_ID=***                  # 可选；首次会通过 wrangler 自动推断
#   5. PATH=/usr/bin:$PATH bash scripts/deploy-cf-pages.sh
# 安全机制：dry-run 默认 + --execute 才落地；落地前打印计划部署信息并等待 5 秒。

set -euo pipefail

DRY_RUN=true
if [[ "${1:-}" == "--execute" ]]; then
  DRY_RUN=false
fi

if [[ -z "${PUBLIC_SITE_URL:-}" ]]; then
  echo "❌ PUBLIC_SITE_URL 未设置。部署前必须设置部署域名，例如："
  echo "   export PUBLIC_SITE_URL=https://jisuanqi.cn"
  exit 1
fi

# 兼容 Corepack shim 假绿
export PATH="/usr/bin:$PATH"

PROJECT_NAME="${CF_PAGES_PROJECT_NAME:-calculator-site}"
SITE_URL="$PUBLIC_SITE_URL"

echo "============================================================"
echo "🚀 Cloudflare Pages 部署命令"
echo "============================================================"
echo "📅 时间：$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "🌐 目标域名：$SITE_URL"
echo "📦 项目名：$PROJECT_NAME"
echo "🔧 模式：$(if $DRY_RUN; then echo 'DRY-RUN（请加 --execute 落地）'; else echo 'EXECUTE'; fi)"
echo "============================================================"

if $DRY_RUN; then
  echo ""
  echo "📋 将要执行的步骤（顺序）："
  echo "  1. PATH=/usr/bin:\$PATH /usr/bin/pnpm predeploy          # URL 校验 + verify"
  echo "  2. PATH=/usr/bin:\$PATH /usr/bin/pnpm build              # 构建 dist/"
  echo "  3. wrangler pages deploy dist --project-name $PROJECT_NAME  # 上传"
  echo "  4. Cloudflare Dashboard 检查 Pages → 部署列表（5–10 分钟生效）"
  echo "  5. 访问 $SITE_URL 验证首页与一个计算器页"
  echo ""
  echo "⚠️ DRY-RUN 完成。加 --execute 部署。"
  exit 0
fi

echo ""
echo "⚡ 即将开始部署：5 秒后继续。Ctrl+C 取消。"
sleep 5

echo "🔍 Step 1/3: predeploy (URL 校验 + verify)..."
PATH=/usr/bin:$PATH /usr/bin/pnpm predeploy

echo "🔨 Step 2/3: build..."
PATH=/usr/bin:$PATH /usr/bin/pnpm build

echo "☁️  Step 3/3: wrangler pages deploy..."
wrangler pages deploy dist --project-name "$PROJECT_NAME"

echo ""
echo "✅ 部署命令已发送。Cloudflare 需要 5–10 分钟同步到全球边缘节点。"
echo "📍 部署后检查清单："
echo "   - Cloudflare Dashboard → Pages → $PROJECT_NAME → 部署列表（看最新部署是否成功）"
echo "   - 访问 $SITE_URL 验证首页 200 + 一个计算器页（如 /finance/mortgage-cn/）"
echo "   - 访问 $SITE_URL/sitemap-index.xml 验证 sitemap"
echo "   - 访问 $SITE_URL/robots.txt 验证 robots"
echo ""
echo "📝 回滚命令（若部署后站点异常）："
echo "   wrangler pages deployment rollback --project-name $PROJECT_NAME"
echo "   # 或在 Dashboard → Pages → Deployments → 点旧版本 → 'Rollback to this deploy'"