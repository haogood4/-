// 检查 dist/ 产物体积（2026-09-21 体积专项：口径由「全站 JS 总和」改为「每页 JS 预算」）
//
// 为什么改口径：站点为多页纯静态架构，每个工具页只加载「自身 page script + 其 import 的
// kit chunk」+ 全站公共脚本（theme/menu/register-sw）。全站 JS 总和随工具数线性增长
// （~1KB/工具），与页面真实性能无关，100KB 总限与「持续加工具」在产品路线上架构性冲突。
// 审计证据（2026-09-21）：83 个 JS 文件最大仅 3.29KB（QR 编码算法，纯逻辑非数据），
// 无剩余数据外置候选；最差单页实载 6.08KB（page+kit）——每页口径才是正确的约束。
//
// 门禁模型（brotli 口径，Cloudflare Pages 默认下发 brotli）：
//   A. 每页 JS 预算：page script + 其静态 import 的 chunk（递归）≤ 8KB 硬限（7KB 预警）
//   B. 全站公共脚本：dist 根下 theme.js/menu.js/register-sw.js 合计 ≤ 4KB 硬限
//   C. 全站 JS 总和：≤ 175KB 硬限（仅作数据内联回归护栏，防有人把大字典塞回 JS；2026-09-21 外部清单导入批次 32 工具由 140 上调，每页实载仍 ~1.2KB）
//   D. CSS 总和：≤ 30KB 硬限（不变）
// dist/ 不存在时跳过。
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { brotliCompressSync, gzipSync } from "node:zlib";

const PAGE_BUDGET = 8 * 1024; // A. 每页硬限
const PAGE_WARN = 7 * 1024; // A. 每页预警
const CHROME_LIMIT = 4 * 1024; // B. 全站公共脚本
const TOTAL_GUARDRAIL = 175 * 1024; // C. 总量回归护栏（2026-09-21 外部清单导入批次由 140 上调并登记于 AI-IMPROVEMENT-PROMPT.md）
const CSS_LIMIT = 30 * 1024; // D. CSS

const distDir = join(process.cwd(), "dist");
if (!existsSync(distDir)) {
  console.log("skip: dist/ not built yet");
  process.exit(0);
}

function collectFiles(dir, ext, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectFiles(full, ext, acc);
    } else if (full.endsWith(ext)) {
      acc.push(full);
    }
  }
  return acc;
}

const brotliCache = new Map();
function brotliSize(file) {
  if (!brotliCache.has(file)) {
    brotliCache.set(file, brotliCompressSync(readFileSync(file)).length);
  }
  return brotliCache.get(file);
}

// 解析 ESM 静态 import 的本地产物（esbuild 输出形如 from"./kit-XXXX.js"，兼容带空格/双引号）
function importedChunks(file) {
  const src = readFileSync(file, "utf8");
  const out = [];
  const re = /from\s*"\.\/([^"]+\.js)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push(resolve(dirname(file), m[1]));
  }
  return out;
}

// A. 每页 JS 预算：page script + 递归 import 的 chunk
const pageScripts = collectFiles(join(distDir, "scripts"), "-page.js");
if (pageScripts.length === 0) {
  console.error("FAIL: dist/scripts 下未发现任何 *-page.js");
  process.exit(1);
}
let failed = false;
let worst = { file: "", payload: 0 };
const warnPages = [];
for (const f of pageScripts) {
  const seen = new Set([f]);
  let payload = brotliSize(f);
  const queue = [f];
  while (queue.length) {
    for (const dep of importedChunks(queue.shift())) {
      if (seen.has(dep) || !existsSync(dep)) continue;
      seen.add(dep);
      payload += brotliSize(dep);
      queue.push(dep);
    }
  }
  const rel = f.slice(distDir.length + 1);
  if (payload > worst.payload) worst = { file: rel, payload };
  if (payload > PAGE_BUDGET) {
    console.error(
      `FAIL: 每页预算超限 ${rel}: ${(payload / 1024).toFixed(2)} KB > ${(PAGE_BUDGET / 1024).toFixed(0)} KB`,
    );
    failed = true;
  } else if (payload > PAGE_WARN) {
    warnPages.push(`${rel} ${(payload / 1024).toFixed(2)}KB`);
  }
}
console.log(
  `A. 每页 JS 预算（${pageScripts.length} 页）：最差 ${worst.file} ${(worst.payload / 1024).toFixed(2)} KB / ${(PAGE_BUDGET / 1024).toFixed(0)} KB${worst.payload > PAGE_WARN ? " ⚠️" : ""}`,
);
if (warnPages.length) {
  console.log(
    `   ⚠️ 超 ${(PAGE_WARN / 1024).toFixed(0)}KB 预警线：${warnPages.join(", ")}`,
  );
}

// B. 全站公共脚本（BaseLayout 每页加载）
const chromeFiles = ["theme.js", "menu.js", "register-sw.js"]
  .map((n) => join(distDir, n))
  .filter((p) => existsSync(p));
const chromeTotal = chromeFiles.reduce((s, f) => s + brotliSize(f), 0);
const chromeKB = (chromeTotal / 1024).toFixed(2);
console.log(
  `B. 全站公共脚本（${chromeFiles.map((f) => f.slice(distDir.length + 1)).join(" + ")}）：${chromeKB} KB / ${(CHROME_LIMIT / 1024).toFixed(0)} KB ${chromeTotal <= CHROME_LIMIT ? "OK" : "EXCEEDS"}`,
);
if (chromeTotal > CHROME_LIMIT) failed = true;

// C. 全站 JS 总和（回归护栏）+ gzip 参考
const allJs = collectFiles(distDir, ".js");
const jsTotal = allJs.reduce((s, f) => s + brotliSize(f), 0);
const jsGzip = allJs.reduce((s, f) => s + gzipSync(readFileSync(f)).length, 0);
const jsTotalKB = (jsTotal / 1024).toFixed(2);
console.log(
  `C. 全站 JS 总和（护栏）：${jsTotalKB} KB / ${(TOTAL_GUARDRAIL / 1024).toFixed(0)} KB（gzip ref: ${(jsGzip / 1024).toFixed(2)} KB，${allJs.length} 文件）${jsTotal <= TOTAL_GUARDRAIL ? "OK" : "EXCEEDS"}`,
);
if (jsTotal > TOTAL_GUARDRAIL) failed = true;

// D. CSS 总和（不变）
const cssFiles = collectFiles(distDir, ".css");
if (cssFiles.length) {
  const cssTotal = cssFiles.reduce((s, f) => s + brotliSize(f), 0);
  const cssGzip = cssFiles.reduce(
    (s, f) => s + gzipSync(readFileSync(f)).length,
    0,
  );
  const ok = cssTotal <= CSS_LIMIT;
  console.log(
    `D. CSS brotli total: ${(cssTotal / 1024).toFixed(2)} KB / ${(CSS_LIMIT / 1024).toFixed(0)} KB (gzip ref: ${(cssGzip / 1024).toFixed(2)} KB) ${ok ? "OK" : "EXCEEDS"}`,
  );
  if (!ok) failed = true;
}

if (failed) {
  process.exit(1);
}
console.log("OK: bundle size within limits (per-page budget model)");
