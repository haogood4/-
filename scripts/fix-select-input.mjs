// 智能修复：识别每个 select 字段，把它的 *Input 引用改为 *Select
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// 每个工具的 select 字段（从生成器元数据中提取）
const SELECT_FIELDS = {
  "renovation-budget-cn-page.ts": ["perSqm"],
  "roas-cn-page.ts": ["adCost", "revenue", "profitRate"],
  "scientific-cn-page.ts": ["expression"],
  "tile-quantity-cn-page.ts": ["area", "tileLength", "tileWidth", "waste"],
  "turtle-position-cn-page.ts": ["accountEquity", "atr", "riskPercent", "entryPrice"],
  "word-count-cn-page.ts": ["text"],
  "loan-cn-page.ts": [],
  "mortgage-cn-page.ts": ["type"],
  "fund-dca-cn-page.ts": [],
  "income-tax-cn-page.ts": [],
  "social-insurance-cn-page.ts": ["city"],
  "compound-interest-cn-page.ts": ["mode"],
  "currency-exchange-cn-page.ts": ["from", "to"],
  "equal-installment-cn-page.ts": [],
  "auto-loan-cn-page.ts": [],
  "deposit-interest-cn-page.ts": ["type"],
  "annualized-return-cn-page.ts": [],
  "irr-cn-page.ts": [],
  "pension-cn-page.ts": [],
  "bonus-tax-cn-page.ts": [],
  "credit-installment-cn-page.ts": [],
  "paint-quantity-cn-page.ts": ["coats"],
  "fuel-consumption-cn-page.ts": [],
  "pace-cn-page.ts": [],
  "calorie-burn-cn-page.ts": [],
  "due-date-cn-page.ts": [],
  "ovulation-cn-page.ts": [],
  "crypto-position-cn-page.ts": ["side"],
  "futures-margin-cn-page.ts": [],
  "option-pricing-cn-page.ts": ["type"],
  "cross-border-profit-cn-page.ts": [],
  "amazon-fba-cn-page.ts": ["size"],
  "gross-margin-cn-page.ts": [],
  "break-even-cn-page.ts": [],
  "conversion-rate-cn-page.ts": [],
  "base-converter-cn-page.ts": ["fromBase", "toBase"],
  "ip-subnet-cn-page.ts": [],
  "floor-area-cn-page.ts": [],
};

let totalFixed = 0;
for (const [file, selectFields] of Object.entries(SELECT_FIELDS)) {
  const p = resolve("src/scripts", file);
  let s = readFileSync(p, "utf8");
  let changed = false;
  for (const id of selectFields) {
    // 把 idInput.value 改为 idSelect.value
    const before = s;
    s = s.replace(new RegExp(`${id}Input\\.value`, "g"), `${id}Select.value`);
    s = s.replace(new RegExp(`\\b${id}Input\\b`, "g"), `${id}Select`);
    if (s !== before) changed = true;
  }
  if (changed) {
    writeFileSync(p, s);
    totalFixed++;
  }
}
console.log(`Fixed ${totalFixed} files.`);
