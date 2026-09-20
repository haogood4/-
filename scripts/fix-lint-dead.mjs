// scripts/fix-lint-dead.mjs — 一次性 codemod：删除 P1-5 标记的两类死代码
// 1) firstErrorEl 未使用函数（3 行块）  2) 未使用的 `const v = r.value as any;` 行
// 仅按 /tmp/eslint-errors2.txt 中 eslint 确认的行号删除，删除前校验行内容，防止误删。
import { readFileSync, writeFileSync } from "node:fs";

const errors = readFileSync("/tmp/eslint-errors2.txt", "utf8").split("\n").filter(Boolean);
const targets = new Map(); // file -> Set<line>

for (const l of errors) {
  const m = l.match(/^(.+?):(\d+) @typescript-eslint\/no-unused-vars '(\w+)'/);
  if (!m) continue;
  const [, f, ln, name] = m;
  if (name !== "firstErrorEl" && name !== "v") continue;
  if (!targets.has(f)) targets.set(f, new Set());
  targets.get(f).add(+ln);
}

let removed = 0;
for (const [f, lnSet] of targets) {
  const lines = readFileSync(f, "utf8").split("\n");
  const kill = new Set();
  for (const ln of lnSet) {
    const text = lines[ln - 1];
    if (/^function firstErrorEl\(\)/.test(text)) {
      // 删除函数体（到匹配的 } 行，固定 3 行结构）
      if (/^\s*return document\.querySelector/.test(lines[ln]) && lines[ln + 1] === "}") {
        kill.add(ln - 1); kill.add(ln); kill.add(ln + 1);
      }
    } else if (/^const v = r\.value as any;$/.test(text.trim())) {
      kill.add(ln - 1);
    }
  }
  if (kill.size) {
    writeFileSync(f, lines.filter((_, i) => !kill.has(i)).join("\n"));
    removed += kill.size;
    console.log(`${f}: 删除 ${kill.size} 行`);
  }
}
console.log(`total lines removed: ${removed}`);
