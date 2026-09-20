// 把所有 `(xxxInput || xxxSelect)` 简化为 `xxxInput`
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const files = execSync("ls src/scripts/*-page.ts", { encoding: "utf8" }).trim().split("\n");
let n = 0;
for (const f of files) {
  const p = resolve(f);
  let s = readFileSync(p, "utf8");
  const before = s;
  // 替换  (xxxInput || xxxSelect)  为  xxxInput
  s = s.replace(/\((\w+)Input \|\| \w+Select\)/g, "$1Input");
  if (s !== before) {
    writeFileSync(p, s);
    n++;
  }
}
console.log(`Fixed ${n} files.`);
