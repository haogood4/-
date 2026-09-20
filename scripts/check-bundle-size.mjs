// 检查 dist/ 产物体积：JS gzip 后 ≤ 100KB，CSS gzip 后 ≤ 30KB
// dist/ 不存在时跳过（Task 10 将升级为强制检查）
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const JS_LIMIT = 100 * 1024; // 100 KB
const CSS_LIMIT = 30 * 1024; // 30 KB

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

function gzipSize(file) {
  return gzipSync(readFileSync(file)).length;
}

let failed = false;
for (const [ext, limit, label] of [
  [".js", JS_LIMIT, "JS"],
  [".css", CSS_LIMIT, "CSS"],
]) {
  const files = collectFiles(distDir, ext);
  if (files.length === 0) continue;
  const total = files.reduce((sum, f) => sum + gzipSize(f), 0);
  const totalKB = (total / 1024).toFixed(2);
  const limitKB = (limit / 1024).toFixed(0);
  const ok = total <= limit;
  console.log(
    `${label} gzip total: ${totalKB} KB / ${limitKB} KB ${ok ? "OK" : "EXCEEDS LIMIT"}`,
  );
  if (!ok) failed = true;
}

if (failed) {
  process.exit(1);
}
console.log("OK: bundle size within limits");
