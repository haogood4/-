// scripts/fix-lint-guard.mjs — 一次性 codemod：将 `X && X.addEventListener(...)` /
// `(X || X) && (X || X).addEventListener(...)` 守卫统一改写为可选链 `X?.addEventListener(...)`
// （P1-5 ESLint 存量 error 修复；no-unused-expressions）
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "src/scripts";
let total = 0;
for (const f of readdirSync(dir).filter((n) => n.endsWith(".ts"))) {
  const p = join(dir, f);
  const src = readFileSync(p, "utf8");
  let out = src;
  // 模式 B：(X || X) && (X || X).addEventListener
  out = out.replace(
    /\(([A-Za-z_$][\w$]*) \|\| \1\) &&\s*\(\1 \|\| \1\)\.addEventListener/g,
    "$1?.addEventListener",
  );
  // 模式 A：X && X.addEventListener
  out = out.replace(
    /([A-Za-z_$][\w$]*) &&\s*\1\.addEventListener/g,
    "$1?.addEventListener",
  );
  if (out !== src) {
    const n = (src.match(/\.addEventListener/g) || []).length - (out.match(/\.addEventListener/g) || []).length;
    total += n;
    writeFileSync(p, out);
    console.log(`${p}: ${n} 处`);
  }
}
console.log(`total: ${total}`);
