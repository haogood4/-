// 最终清理：移除所有 `|| xxxSelect` 模式 + 修正少量错误
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const files = execSync("ls src/scripts/*-page.ts", { encoding: "utf8" }).trim().split("\n");

for (const f of files) {
  const p = resolve(f);
  let s = readFileSync(p, "utf8");
  const before = s;
  // 把 `(xxxInput || xxxSelect)` 替换为 `xxxInput`
  s = s.replace(/\((\w+)Input \|\| \w+Select\)/g, "$1Input");
  // 把 `(xxxInput || xxxSelect) &&` 替换为 `xxxInput &&`
  s = s.replace(/\((\w+)Input \|\| \w+Select\) &&/g, "$1Input &&");
  if (s !== before) writeFileSync(p, s);
}

// 单独修复几个特殊问题
const fixes = [
  // renovation-budget-cn 末尾的 perSqmInput 引用
  { file: "renovation-budget-cn-page.ts", from: "const r = calculateReno({ area: areaInput.value, perSqm: perSqmSelect.value });", to: "const r = calculateReno({ area: areaInput.value, perSqm: perSqmInput.value });" },
];
for (const f of fixes) {
  const p = resolve("src/scripts", f.file);
  let s = readFileSync(p, "utf8");
  if (s.includes(f.from)) {
    s = s.replace(f.from, f.to);
    writeFileSync(p, s);
  }
}

console.log("Done.");
