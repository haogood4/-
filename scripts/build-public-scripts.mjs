// scripts/build-public-scripts.mjs — 将全部页面脚本用 esbuild 预打包到
// public/scripts/（esm + code splitting），页面以绝对路径引用绕过打包器内联。
// 背景：Astro 7.3.3 对部分「页面+脚本」组合会输出内联 <script type="module">，
// 与 CSP script-src 'self' 冲突导致浏览器拦截、计算器不可用（P1-8 冒烟断言 7 捕获）。
// 触发条件未能从 Astro 侧根治，故采用此显式外置方案；Astro 修复后可回归 <script src> 标准范式。
// 体积：共享样板在 src/scripts/_page-kit.ts，splitting 将其提取为单一共享 chunk（跨页缓存）；
// 2026-09-20 起全部 51 页统一走此管线（原 42 个 Astro 打包页各自携带样板拷贝）。
import { build } from "esbuild";
import { mkdirSync, rmSync, readdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "public/scripts";

// 全量：src/scripts/ 下所有 *-page.ts（basic-page 亦包含，统一管线）
const ENTRIES = readdirSync("src/scripts")
  .filter((f) => f.endsWith("-page.ts"))
  .map((f) => f.replace(/\.ts$/, ""));

mkdirSync(OUT, { recursive: true });
// 清理旧产物（chunk 名带 hash，避免陈旧文件堆积）
for (const f of readdirSync(OUT)) {
  if (f.endsWith(".js")) rmSync(join(OUT, f));
}

await build({
  entryPoints: ENTRIES.map((n) => `src/scripts/${n}.ts`),
  outdir: OUT,
  bundle: true,
  splitting: true,
  format: "esm",
  minify: true,
  target: "es2020",
  entryNames: "[name]",
  chunkNames: "kit-[hash]",
});

console.log(
  `OK: ${ENTRIES.length} page scripts bundled (esm+splitting) to ${OUT}/`,
);
