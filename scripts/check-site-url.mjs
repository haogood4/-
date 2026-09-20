#!/usr/bin/env node
// scripts/check-site-url.mjs
// 部署前校验 PUBLIC_SITE_URL：必须设置、格式合法、https 协议、非占位/本地。
// 用法：node scripts/check-site-url.mjs（依赖环境变量 PUBLIC_SITE_URL）

const PLACEHOLDER_HOSTS = new Set([
  "example-calculator.cn",
  "example.com",
  "example.org",
  "example.net",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

const value = process.env.PUBLIC_SITE_URL ?? "";

if (!value) {
  console.error(
    "❌ PUBLIC_SITE_URL 未设置。部署前必须设置部署域名，例如：\n" +
      "   export PUBLIC_SITE_URL=https://your-domain.com"
  );
  process.exit(1);
}

let url;
try {
  url = new URL(value);
} catch (e) {
  console.error(`❌ PUBLIC_SITE_URL 格式不合法: ${value}`);
  process.exit(1);
}

if (url.protocol !== "https:") {
  console.error(`❌ PUBLIC_SITE_URL 必须使用 https 协议，当前: ${url.protocol}`);
  process.exit(1);
}

const host = url.hostname || "";
if (host.length === 0 || host.length > 253) {
  console.error(`❌ PUBLIC_SITE_URL host 长度异常: ${host.length}`);
  process.exit(1);
}

if (PLACEHOLDER_HOSTS.has(host)) {
  console.error(
    `❌ PUBLIC_SITE_URL 使用了占位/本地域名: ${host}\n` +
      "   请设置正式部署域名（不得使用 example-* / localhost / 127.0.0.1）。"
  );
  process.exit(1);
}

// 保留字检查：test/staging/dev（除非显式 OPT_IN 暂未启用）
if (/(^|\.)(test|staging|dev)(\.|$)/i.test(host)) {
  console.error(
    `❌ PUBLIC_SITE_URL host 含保留字（test/staging/dev）: ${host}\n` +
      "   生产部署请使用正式域名。"
  );
  process.exit(1);
}

console.log(`✅ PUBLIC_SITE_URL 校验通过: ${url.href}`);
console.log(`   Node ${process.version} | ${new Date().toISOString()}`);
