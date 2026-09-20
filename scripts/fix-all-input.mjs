// 全面修复：所有错误引用 *Select 改为 *Input
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

// 完整字段定义
const ALL_FIELDS = {
  "auto-loan-cn-page.ts": ["principal", "years", "rate"],
  "bonus-tax-cn-page.ts": ["bonus"],
  "credit-installment-cn-page.ts": ["principal", "monthlyRate", "months"],
  "crypto-position-cn-page.ts": ["equity", "leverage", "entryPrice"],
  "deposit-interest-cn-page.ts": ["principal", "rate", "years"],
  "fuel-consumption-cn-page.ts": ["distance", "fuel"],
  "loan-cn-page.ts": ["principal", "years", "rate"],
  "mortgage-cn-page.ts": ["principal", "years", "rate"],
  "annualized-return-cn-page.ts": ["totalReturn", "days"],
  "pension-cn-page.ts": ["currentAge", "retireAge", "monthlySalary", "cityAvgSalary"],
  "cross-border-profit-cn-page.ts": ["sellingPrice", "productCost", "shippingCost", "platformFee", "exchangeRate"],
  "amazon-fba-cn-page.ts": ["sellingPrice", "productCost"],
  "gross-margin-cn-page.ts": ["revenue", "cost"],
  "break-even-cn-page.ts": ["fixedCost", "pricePerUnit", "variablePerUnit"],
  "roas-cn-page.ts": ["adCost", "revenue", "profitRate"],
  "conversion-rate-cn-page.ts": ["visits", "conversions"],
  "scientific-cn-page.ts": ["expression"],
  "base-converter-cn-page.ts": ["value"],
  "ip-subnet-cn-page.ts": ["ip", "cidr"],
  "word-count-cn-page.ts": ["text"],
  "pace-cn-page.ts": ["distance", "hours", "minutes", "seconds"],
  "calorie-burn-cn-page.ts": ["weight", "minutes", "met"],
  "due-date-cn-page.ts": ["lastPeriod"],
  "ovulation-cn-page.ts": ["lastPeriod", "cycle"],
  "irr-cn-page.ts": ["cashflows"],
  "fund-dca-cn-page.ts": ["monthly", "rate", "years"],
  "income-tax-cn-page.ts": ["monthlySalary", "socialInsurance", "specialDeduction"],
  "currency-exchange-cn-page.ts": ["amount"],
  "tile-quantity-cn-page.ts": ["area", "tileLength", "tileWidth", "waste"],
  "floor-area-cn-page.ts": ["rooms"],
  "renovation-budget-cn-page.ts": ["area", "perSqm"],
  "compound-interest-cn-page.ts": ["principal", "fv", "rate", "years"],
};

const files = execSync("ls src/scripts/*-page.ts", { encoding: "utf8" }).trim().split("\n");

for (const f of files) {
  const p = resolve(f);
  let s = readFileSync(p, "utf8");
  const baseName = f.split("/").pop();
  const inputs = ALL_FIELDS[baseName] || [];
  let changed = false;
  for (const id of inputs) {
    const re = new RegExp(`\\b${id}Select\\b`, "g");
    if (re.test(s)) {
      s = s.replace(re, `${id}Input`);
      changed = true;
    }
  }
  // 特殊：crypto-position-cn 的 side 字段是 select
  if (baseName === "crypto-position-cn-page.ts") {
    s = s.replace(/side: sideSelect\.value\)/g, 'side: sideSelect.value as "long" | "short")');
  }
  if (baseName === "deposit-interest-cn-page.ts") {
    s = s.replace(/type: typeSelect\.value\)/g, 'type: typeSelect.value as "compound" | "simple")');
  }
  if (changed) writeFileSync(p, s);
}
console.log("Done.");
