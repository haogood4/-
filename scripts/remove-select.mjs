// 把所有 "*Select" 错误引用替换为对应 input/output
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

// 工具 → 真实字段列表（来自生成器）
const FIELDS = {
  "deposit-interest-cn-page.ts": { inputs: ["principal", "rate", "years"], selects: ["type"] },
  "equal-installment-cn-page.ts": { inputs: ["principal", "years", "rate"], selects: [] },
  "floor-area-cn-page.ts": { inputs: ["rooms"], selects: [] },
  "fuel-consumption-cn-page.ts": { inputs: ["distance", "fuel"], selects: [] },
  "irr-cn-page.ts": { inputs: ["cashflows"], selects: [] },
  "renovation-budget-cn-page.ts": { inputs: ["area", "perSqm"], selects: [] },
};

const files = execSync("ls src/scripts/*-page.ts", { encoding: "utf8" }).trim().split("\n");

for (const f of files) {
  const p = resolve(f);
  let s = readFileSync(p, "utf8");
  const baseName = f.split("/").pop();
  const cfg = FIELDS[baseName];
  if (!cfg) continue;
  let changed = false;
  for (const id of cfg.inputs) {
    // 把 idSelect 替换为 idInput
    const re = new RegExp(`\\b${id}Select\\b`, "g");
    if (re.test(s)) {
      s = s.replace(re, `${id}Input`);
      changed = true;
    }
  }
  // 特殊处理：deposit-interest-cn 的 type 字段
  if (baseName === "deposit-interest-cn-page.ts") {
    s = s.replace(/clearError\(yearsSelect, err_years\);/g, "clearError(yearsInput, err_years);");
    s = s.replace(/err_type/g, "err_principal");
    s = s.replace(/type: typeSelect\.value as "compound" \| "simple"\)/g, 'type: typeSelect.value as "compound" | "simple")');
  }
  if (baseName === "equal-installment-cn-page.ts") {
    // 需要补充 type 字段
    s = s.replace(/const r = calculateEqualInstallment\({ principal: principalInput\.value, years: yearsInput\.value, rate: rateInput\.value \}\);/g,
      'const r = calculateEqualInstallment({ principal: principalInput.value, years: yearsInput.value, rate: rateInput.value, type: "equal-installment" });');
  }
  if (baseName === "irr-cn-page.ts") {
    s = s.replace(/const r = calculateIrrFromInput\({ cashflows: cashflowsInput\.value \}\);/g, "const r = calculateIrrFromInput(cashflowsInput.value);");
  }
  if (changed) writeFileSync(p, s);
}
console.log("Done.");
