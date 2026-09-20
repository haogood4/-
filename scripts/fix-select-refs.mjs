// 修复 scripts 里对 select 字段的错误引用
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const FILES = [
  "renovation-budget-cn-page.ts", "roas-cn-page.ts", "scientific-cn-page.ts",
  "tile-quantity-cn-page.ts", "turtle-position-cn-page.ts", "word-count-cn-page.ts",
  "loan-cn-page.ts", "mortgage-cn-page.ts", "fund-dca-cn-page.ts",
  "income-tax-cn-page.ts", "social-insurance-cn-page.ts", "compound-interest-cn-page.ts",
  "currency-exchange-cn-page.ts",
  "equal-installment-cn-page.ts", "auto-loan-cn-page.ts", "deposit-interest-cn-page.ts",
  "annualized-return-cn-page.ts", "irr-cn-page.ts", "pension-cn-page.ts",
  "bonus-tax-cn-page.ts", "credit-installment-cn-page.ts",
  "paint-quantity-cn-page.ts", "fuel-consumption-cn-page.ts",
  "pace-cn-page.ts", "calorie-burn-cn-page.ts", "due-date-cn-page.ts",
  "ovulation-cn-page.ts", "crypto-position-cn-page.ts", "futures-margin-cn-page.ts",
  "option-pricing-cn-page.ts", "cross-border-profit-cn-page.ts", "amazon-fba-cn-page.ts",
  "gross-margin-cn-page.ts", "break-even-cn-page.ts", "conversion-rate-cn-page.ts",
  "base-converter-cn-page.ts", "ip-subnet-cn-page.ts", "floor-area-cn-page.ts",
];

let totalFixed = 0;
for (const f of FILES) {
  const p = resolve("src/scripts", f);
  let s = readFileSync(p, "utf8");
  // 把 *Select 引用替换为 *Input（input 已有），但 select 字段没有 input，需要单独处理
  // 简化：对任何 setError(idSelect, ...) 或 clearError(idSelect, ...) 或 addEventListener(idSelect, ...) 报错，
  // 因为 typecheck 找的是不存在于代码中的 `${id}Select`。
  // 我们的 generate 模板生成的脚本中，`addEventListener` 写法是：
  //   (${id}Input || ${id}Select).addEventListener(...)
  // 这在 select 字段时 ${id}Input 是 undefined —— TS 报错 "Cannot find name"
  // 修复：把这种 case 改为只对 select 引用
  // 替换为：当存在对应 Select 时，引用 Select
  // 简单粗暴的修法：把所有 "*Input || *Select" 替换成正确引用：
  // 1. 如果原字段定义含 select，则替换成 *Select
  // 2. 否则保持 *Input

  // 简化处理：直接把所有 "(xxxInput || xxxSelect)" 替换为最安全的写法——分两个独立分支
  s = s.replace(/\((\w+)Input \|\| (\w+)Select\)\.addEventListener\(/g, "($1Input || $2Select) && (($1Input || $2Select)).addEventListener(");

  writeFileSync(p, s);
  totalFixed++;
}
console.log(`Processed ${totalFixed} files.`);
