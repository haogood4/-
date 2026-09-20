#!/usr/bin/env node
// scripts/check-astro-fix.mjs — P3-15 上游修复探针
// 用途：检测 Astro 7 内联脚本 bug 是否已被官方修复。
// 用法：node scripts/check-astro-fix.mjs
// 退出码：0 = silent exit（不阻塞 CI，仅输出诊断信息到 stderr）
//
// 当前状态：astro 7.3.3，bug 未修复 → silent exit 0
// 触发修复后：检测到 ≥7.3.4 + changelog 关键词 → stderr 输出「P3-15 可启动」
//
// 注意：本探针不联网（沙箱网络受限时降级为本地检查），
// 仅做本地版本号断言；版本号需手动在 P3-15 启动时由项目负责人更新阈值。

import { readFileSync } from "node:fs";
import { join } from "node:path";

const PKG = join(process.cwd(), "node_modules", "astro", "package.json");
let astroVersion = "0.0.0";
try {
  astroVersion = JSON.parse(readFileSync(PKG, "utf8")).version;
} catch {
  // astro 未安装（极少见，CI 必有）→ silent exit
  process.exit(0);
}

const [major, minor, patch] = astroVersion.split(".").map(Number);
const FIX_THRESHOLD = [7, 3, 4]; // 官方修复后由项目负责人更新

const cmp = [major, minor, patch];
const fixed =
  cmp[0] > FIX_THRESHOLD[0] ||
  (cmp[0] === FIX_THRESHOLD[0] && cmp[1] > FIX_THRESHOLD[1]) ||
  (cmp[0] === FIX_THRESHOLD[0] &&
    cmp[1] === FIX_THRESHOLD[1] &&
    cmp[2] >= FIX_THRESHOLD[2]);

if (fixed) {
  console.error(
    `[P3-15] Astro ${astroVersion} ≥ ${FIX_THRESHOLD.join(".")}：可启动 Content Collections 回归（见 docs/content-collections-regression.md）`,
  );
} else {
  // 未修复：silent exit 0，不阻塞 CI
}

process.exit(0);