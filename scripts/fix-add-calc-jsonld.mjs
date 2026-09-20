// scripts/fix-add-calc-jsonld.mjs — P1-9 一次性 codemod：
// 为 51 个计算器页插入 CalcJsonLd 组件（import + 使用），数据从页面自身提取：
// name = <h1> 文本；description = BaseLayout 的 description 属性；faqItems = 页面已有变量。
// 幂等：已含 CalcJsonLd 的文件跳过。
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIRS = ["finance", "health", "daily", "efficiency", "investment", "math", "unit", "dev", "renovation"];
const files = [];
for (const d of DIRS) {
  for (const f of readdirSync(join("src/pages", d))) {
    if (f.endsWith(".astro")) files.push(join("src/pages", d, f));
  }
}

const skipped = [];
const failed = [];
let changed = 0;

for (const file of files) {
  let src = readFileSync(file, "utf8");
  if (src.includes("CalcJsonLd")) {
    skipped.push(file);
    continue;
  }
  const h1 = src.match(/<h1>([^<]+)<\/h1>/);
  const desc = src.match(/description="([^"]+)"/);
  if (!h1 || !desc) {
    failed.push(`${file} (h1:${!!h1} desc:${!!desc})`);
    continue;
  }
  const name = h1[1].trim();
  const description = desc[1];
  if (name.includes('"') || description.includes('"')) {
    failed.push(`${file} (含 ASCII 双引号)`);
    continue;
  }

  // 1) import：插到最后一条 import 之后
  const importLines = [...src.matchAll(/^import .*$/gm)];
  const lastImport = importLines[importLines.length - 1];
  const importEnd = lastImport.index + lastImport[0].length;
  src = src.slice(0, importEnd) + `\nimport CalcJsonLd from "../../components/CalcJsonLd.astro";` + src.slice(importEnd);

  // 2) 使用：插在 </main> 之前
  const mainClose = src.lastIndexOf("</main>");
  if (mainClose === -1) {
    failed.push(`${file} (无 </main>)`);
    continue;
  }
  const usage = `\n    <CalcJsonLd name="${name}" description="${description}" faqItems={faqItems} />\n  `;
  src = src.slice(0, mainClose) + usage + src.slice(mainClose);

  writeFileSync(file, src);
  changed++;
}

console.log(`changed=${changed} skipped=${skipped.length} failed=${failed.length}`);
if (failed.length > 0) {
  console.log("FAILED:\n" + failed.join("\n"));
  process.exit(1);
}
