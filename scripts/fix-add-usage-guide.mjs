// scripts/fix-add-usage-guide.mjs — 一次性 codemod：
// 为全部工具页插入 <UsageGuide />（h1 之后，即收藏按钮注入点下方），
// 并在 frontmatter 末尾追加组件 import。幂等：已含 UsageGuide 的页面跳过。
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";

const DIRS = ["finance", "health", "renovation", "investment", "efficiency", "daily", "dev", "math", "unit"];

function walk(dir, acc = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (f.endsWith(".astro")) acc.push(p);
  }
  return acc;
}

const pages = DIRS.flatMap((d) => (existsSync(`src/pages/${d}`) ? walk(`src/pages/${d}`) : []));
let changed = 0;
const skipped = [];

for (const file of pages) {
  const src = readFileSync(file, "utf8");
  if (src.includes("UsageGuide")) { skipped.push(file); continue; }
  const lines = src.split("\n");
  // 1) frontmatter 最后一个 import 行后追加
  let lastImport = -1;
  for (let i = 0; i < lines.length && i < 40; i++) {
    if (/^import .* from ".*\.astro";?$/.test(lines[i].trim()) || /^import .* from ".*\.astro";$/.test(lines[i])) lastImport = i;
  }
  if (lastImport === -1) { console.error(`SKIP(no import): ${file}`); continue; }
  // 2) 第一个 h1 行后插入组件
  const h1 = lines.findIndex((l) => /<h1[\s>]/.test(l));
  if (h1 === -1) { console.error(`SKIP(no h1): ${file}`); continue; }
  const out = [...lines];
  out.splice(h1 + 1, 0, "    <UsageGuide />");
  const rel = relative(dirname(file), "src/components/UsageGuide.astro").replace(/\\/g, "/");
  out.splice(lastImport + 1, 0, `import UsageGuide from "${rel.startsWith(".") ? rel : "./" + rel}";`);
  writeFileSync(file, out.join("\n"));
  changed++;
}

console.log(`插入 ${changed} 页；跳过（已存在）${skipped.length} 页`);
