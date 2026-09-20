// 批量生成 Tier 2 的 13 个页面 + 13 个脚本
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const TOOLS = [
  { slug: "equal-installment-cn", title: "等额本息计算器", dir: "finance", desc: "免费在线等额本息月供计算器", fields: [{ id: "principal", label: "贷款本金（¥）", ph: "1000000" }, { id: "years", label: "贷款年限", ph: "30（1-30 年）" }, { id: "rate", label: "年利率（%）", ph: "4.2（参考 LPR）" }], fn: "calculateEqualInstallment", call: '{ principal: principalInput.value, years: yearsInput.value, rate: rateInput.value, type: "equal-installment" }', main: "monthlyFirst", formatFn: "formatEqualInstallment", caption: `等额本息 · \${yearsInput.value} 年`, detailFmt: () => `本金 \${principalInput.value} 元，年利率 \${rateInput.value}%，总还款 \${v.totalPayment}，总利息 \${v.totalInterest}`, related: [["房贷计算器", "/finance/mortgage-cn/"], ["贷款计算器", "/finance/loan-cn/"], ["提前还款", "/finance/prepayment-cn/"]], faq: [["等额本息总利息如何计算？", "总利息 = 月供 × 总期数 - 贷款本金。"], ["等额本息 vs 等额本金？", "等额本息每月固定，等额本金每月递减，总利息等额本金更少但前期压力大。"]] },
  { slug: "auto-loan-cn", title: "车贷计算器", dir: "finance", desc: "免费在线车贷月供计算器", fields: [{ id: "principal", label: "贷款本金（¥）", ph: "100000" }, { id: "years", label: "贷款年限", ph: "3（1-5 年）" }, { id: "rate", label: "年利率（%）", ph: "5" }], fn: "calculateAutoLoan", call: '{ principal: principalInput.value, years: yearsInput.value, rate: rateInput.value }', main: "monthly", formatFn: "formatAutoLoan", caption: `车贷 · \${yearsInput.value} 年`, detailFmt: () => `总还款 \${v.totalPayment}，总利息 \${v.totalInterest}`, related: [["贷款计算器", "/finance/loan-cn/"], ["房贷计算器", "/finance/mortgage-cn/"], ["信用卡分期", "/finance/credit-installment-cn/"]], faq: [["车贷首付多少？", "常见 20%-30% 首付，本工具计算贷款部分月供。"], ["车贷年限？", "常见 1-5 年，新能源车可至 7 年。"]] },
  { slug: "deposit-interest-cn", title: "存款利息计算器", dir: "finance", desc: "免费在线存款利息计算器（单利/复利）", fields: [{ id: "principal", label: "本金（¥）", ph: "100000" }, { id: "rate", label: "年利率（%）", ph: "3" }, { id: "years", label: "存期（年）", ph: "3" }, { id: "type", label: "计息方式", select: [{ v: "compound", l: "复利" }, { v: "simple", l: "单利" }] }], fn: "calculateDeposit", call: '{ principal: principalInput.value, rate: rateInput.value, years: yearsInput.value, type: typeSelect.value }', main: "total", formatFn: "formatDeposit", caption: `存款利息 · \${yearsInput.value} 年`, detailFmt: () => `利息 \${v.interest}`, related: [["复利计算器", "/finance/compound-interest-cn/"], ["年化收益率", "/finance/annualized-return-cn/"], ["贷款计算器", "/finance/loan-cn/"]], faq: [["单利 vs 复利？", "单利仅本金产生利息；复利将每期利息加入下期本金。"], ["大额存单？", "通常 20 万起，年利率高于普通定期 30-50bp。"]] },
  { slug: "annualized-return-cn", title: "年化收益率计算器", dir: "finance", desc: "免费在线年化收益率换算", fields: [{ id: "totalReturn", label: "总收益（%）", ph: "7" }, { id: "days", label: "持有天数", ph: "365" }], fn: "calculateAnnualizedReturn", call: '{ totalReturn: totalReturnInput.value, days: daysInput.value }', main: "value", formatFn: "formatAnnualizedReturn", caption: `年化收益率`, detailFmt: () => `总收益 \${totalReturnInput.value}% / \${daysInput.value} 天`, related: [["复利计算器", "/finance/compound-interest-cn/"], ["基金定投", "/finance/fund-dca-cn/"], ["IRR", "/finance/irr-cn/"]], faq: [["年化如何计算？", "年化 = ((1 + 总收益)^(365/天数) - 1) × 100。"]] },
  { slug: "irr-cn", title: "IRR 内部收益率计算器", dir: "finance", desc: "免费在线 IRR（内部收益率）计算器，支持现金流序列", fields: [{ id: "cashflows", label: "现金流序列（逗号/换行/空格分隔，首期为负）", ph: "-10000, 3000, 4000, 5000", textarea: true }], fn: "calculateIrrFromInput", call: 'cashflowsInput.value', main: "value", formatFn: "formatIrr", caption: `IRR`, detailFmt: () => `Newton-Raphson 数值求解`, related: [["年化收益率", "/finance/annualized-return-cn/"], ["基金定投", "/finance/fund-dca-cn/"]], faq: [["IRR 含义？", "内部收益率使所有现金流现值之和为零的折现率，常用于投资评估。"]] },
  { slug: "pension-cn", title: "养老金计算器", dir: "finance", desc: "免费在线养老金估算", fields: [{ id: "currentAge", label: "当前年龄", ph: "30" }, { id: "retireAge", label: "退休年龄", ph: "60" }, { id: "monthlySalary", label: "当前月薪（¥）", ph: "10000" }, { id: "cityAvgSalary", label: "当地社平工资（¥）", ph: "8000" }], fn: "calculatePension", call: '{ currentAge: currentAgeInput.value, retireAge: retireAgeInput.value, monthlySalary: monthlySalaryInput.value, cityAvgSalary: cityAvgSalaryInput.value }', main: "monthlyPension", formatFn: "formatPension", caption: `养老金估算`, detailFmt: () => `个人账户累计 \${v.accountTotal}`, related: [["个税计算器", "/finance/income-tax-cn/"], ["五险一金", "/finance/social-insurance-cn/"]], faq: [["养老金构成？", "基础养老金 + 个人账户养老金；本工具为简化估算。"]] },
  { slug: "bonus-tax-cn", title: "年终奖个税计算器", dir: "finance", desc: "免费在线年终奖个税（单独计税）", fields: [{ id: "bonus", label: "年终奖金额（¥）", ph: "36000" }], fn: "calculateBonus", call: '{ bonus: bonusInput.value }', main: "tax", formatFn: "formatBonus", caption: `年终奖 · 单独计税`, detailFmt: () => `应纳税 \${v.tax}，税后 \${v.afterTax}`, related: [["个税计算器", "/finance/income-tax-cn/"], ["五险一金", "/finance/social-insurance-cn/"]], faq: [["单独 vs 并入？", "2027 年底前可单独计税，通常更优。"]] },
  { slug: "credit-installment-cn", title: "信用卡分期计算器", dir: "finance", desc: "免费在线信用卡分期月供与实际年化", fields: [{ id: "principal", label: "分期本金（¥）", ph: "10000" }, { id: "monthlyRate", label: "月手续费率（%）", ph: "0.6" }, { id: "months", label: "期数", ph: "12" }], fn: "calculateCredit", call: '{ principal: principalInput.value, monthlyRate: monthlyRateInput.value, months: monthsInput.value }', main: "monthlyPayment", formatFn: "formatCredit", caption: `信用卡分期 · \${monthsInput.value} 期`, detailFmt: () => `总手续费 \${v.totalFee}，实际年化约 \${v.effectiveAnnualRate}`, related: [["贷款计算器", "/finance/loan-cn/"], ["车贷计算器", "/finance/auto-loan-cn/"]], faq: [["实际年化如何换算？", "信用卡分期月费率 0.6% ≈ 实际年化 13% 以上。"]] },
  { slug: "renovation-budget-cn", title: "装修预算计算器", dir: "renovation", desc: "免费在线装修预算（硬装 60% + 软装 40%）", fields: [{ id: "area", label: "建筑面积（m²）", ph: "90" }, { id: "perSqm", label: "装修单价（元/m²）", ph: "2000" }], fn: "calculateReno", call: '{ area: areaInput.value, perSqm: perSqmInput.value }', main: "total", formatFn: "formatReno", caption: `装修预算 · \${areaInput.value} 平`, detailFmt: () => `硬装 \${v.hard} · 软装 \${v.soft}`, related: [["瓷砖数量", "/renovation/tile-quantity-cn/"], ["乳胶漆用量", "/renovation/paint-quantity-cn/"], ["房屋面积", "/renovation/floor-area-cn/"]], faq: [["硬装 vs 软装？", "硬装：水电、墙地、吊顶；软装：家具、家电、装饰。"]] },
  { slug: "tile-quantity-cn", title: "瓷砖数量计算器", dir: "renovation", desc: "免费在线瓷砖数量 + 损耗估算", fields: [{ id: "area", label: "铺设面积（m²）", ph: "20" }, { id: "tileLength", label: "瓷砖长（mm）", ph: "800" }, { id: "tileWidth", label: "瓷砖宽（mm）", ph: "800" }, { id: "waste", label: "损耗率（%）", ph: "5" }], fn: "calculateTile", call: '{ area: areaInput.value, tileLength: tileLengthInput.value, tileWidth: tileWidthInput.value, waste: wasteInput.value }', main: "count", formatFn: "formatTile", caption: `瓷砖数量`, detailFmt: () => `总覆盖面积 \${v.tilesArea}`, related: [["装修预算", "/renovation/renovation-budget-cn/"], ["乳胶漆用量", "/renovation/paint-quantity-cn/"], ["房屋面积", "/renovation/floor-area-cn/"]], faq: [["损耗率多少？", "常规铺贴 5-10%，复杂拼花 10-15%。"]] },
  { slug: "paint-quantity-cn", title: "乳胶漆用量计算器", dir: "renovation", desc: "免费在线乳胶漆升数与桶数估算", fields: [{ id: "wallArea", label: "墙面面积（m²）", ph: "60" }, { id: "coats", label: "涂刷遍数", ph: "2" }, { id: "coveragePerLiter", label: "1L 涂刷面积（m²）", ph: "12" }], fn: "calculatePaint", call: '{ wallArea: wallAreaInput.value, coats: coatsInput.value, coveragePerLiter: coveragePerLiterInput.value }', main: "cans", formatFn: "formatPaint", caption: `乳胶漆用量`, detailFmt: () => `总用量 \${v.liters}`, related: [["装修预算", "/renovation/renovation-budget-cn/"], ["瓷砖数量", "/renovation/tile-quantity-cn/"]], faq: [["涂刷遍数？", "新房 2 底 2 面（4 遍），旧房翻 2 遍即可。"]] },
  { slug: "floor-area-cn", title: "房屋面积计算器", dir: "renovation", desc: "免费在线各房间面积求和", fields: [{ id: "rooms", label: "各房间面积（m²，逗号或换行分隔）", ph: "客厅 30, 卧室 15, 厨房 8", textarea: true }], fn: "calculateFloorArea", call: '{ rooms: roomsInput.value }', main: "total", formatFn: "formatArea", caption: `房屋面积`, detailFmt: () => `共 \${v.count} 个房间`, related: [["装修预算", "/renovation/renovation-budget-cn/"], ["瓷砖数量", "/renovation/tile-quantity-cn/"]], faq: [["套内 vs 建筑面积？", "建筑面积含公摊；套内更接近实际可用面积。"]] },
  { slug: "fuel-consumption-cn", title: "油耗计算器", dir: "daily", desc: "免费在线油耗（百公里）计算器", fields: [{ id: "distance", label: "里程（km）", ph: "500" }, { id: "fuel", label: "耗油量（L）", ph: "30" }], fn: "calculateFuel", call: '{ distance: distanceInput.value, fuel: fuelInput.value }', main: "perHundred", formatFn: "formatFuel", caption: `油耗 · \${distanceInput.value} km`, detailFmt: () => `每公里 \${v.perKm}`, related: [["四则运算", "/daily/basic/"], ["百分比", "/math/percentage/"]], faq: [["百公里油耗如何计算？", "百公里油耗 = (耗油量 / 里程) × 100。"]] },
];

function makeAstro(t) {
  const inputFields = t.fields.map(f => {
    if (f.textarea) return `<div class="field"><label for="${f.id}">${f.label}</label><textarea id="${f.id}" class="field-input" rows="3" placeholder="${f.ph}"></textarea><p class="field-error" id="field-error-${f.id}" hidden></p></div>`;
    if (f.select) return `<div class="field"><label for="${f.id}">${f.label}</label><select id="${f.id}" class="field-select">${f.select.map(o => `<option value="${o.v}">${o.l}</option>`).join("")}</select></div>`;
    return `<div class="field"><label for="${f.id}">${f.label}</label><input id="${f.id}" class="field-input" type="text" inputmode="decimal" autocomplete="off" placeholder="${f.ph}" /><p class="field-error" id="field-error-${f.id}" hidden></p></div>`;
  }).join("\n      ");
  const related = t.related.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join("\n        ");
  const faq = t.faq.map(([q, a]) => `{ q: ${JSON.stringify(q)}, a: ${JSON.stringify(a)} }`).join(",\n    ");
  const ymyNotice = t.dir === "finance" || t.dir === "investment" ? `<p class="result-hint"><strong>⚠️ 计算结果仅供参考，不构成投资/理财/税务建议。</strong></p>` : "";
  const breadcrumbs = t.dir === "renovation" ? `[{label:"首页",href:"/"},{label:"装修家居"},{label:"${t.title}"}]` : t.dir === "daily" ? `[{label:"首页",href:"/"},{label:"日常工具"},{label:"${t.title}"}]` : `[{label:"首页",href:"/"},{label:"金融理财"},{label:"${t.title}"}]`;
  return `---
import BaseLayout from "../../layouts/BaseLayout.astro";
import Breadcrumb from "../../components/Breadcrumb.astro";
import AdContainer from "../../components/AdContainer.astro";
import FaqSection from "../../components/FaqSection.astro";
const faqItems = [${faq}];
---
<BaseLayout title="${t.title} — 在线 ${t.title}" description="${t.desc}" >
  <main id="main">
    <Breadcrumb items={${breadcrumbs}} />
    <h1>${t.title}</h1>
    <p class="lead">${t.desc.split("：")[1] || t.desc}</p>
    ${ymyNotice}
    <form id="calc-form" class="card" novalidate>
      ${inputFields}
      <div class="form-actions"><button id="calc-btn" type="submit" class="btn btn-primary">计算</button><button id="reset-btn" type="button" class="btn btn-secondary">重置</button></div>
    </form>
    <div id="result" class="result" role="status" aria-live="polite"><p id="result-empty" class="result-empty">填写上方字段后显示结果</p><div id="result-content" hidden><p id="result-caption" class="result-caption"></p><p id="result-main" class="result-main"></p><p id="result-detail" class="result-process"></p><p id="result-stale-hint" class="result-hint" hidden>输入已变更，请重新计算</p><div class="result-actions"><button type="button" id="copy-btn" class="btn btn-secondary" disabled>复制结果</button></div></div></div>
    <AdContainer />
    <FaqSection items={faqItems} />
    <section class="section"><h2>相关工具</h2><ul class="tool-list">
        ${related}
      </ul></section>
  </main>
  <script src="../../scripts/${t.slug}-page.ts"></script>
</BaseLayout>
`;
}

function makePageScript(t) {
  const inputIds = t.fields.filter(f => !f.select).map(f => f.id);
  const inputSelectors = inputIds.map(id => `const ${id}Input = el<HTMLInputElement>("#${id}");`).join("\n");
  const selectIds = t.fields.filter(f => f.select).map(f => f.id);
  const selectSelectors = selectIds.map(id => `const ${id}Select = el<HTMLSelectElement>("#${id}");`).join("\n");
  const errorSelectors = inputIds.map(id => `const err_${id} = el<HTMLParagraphElement>("#field-error-${id}");`).join("\n");
  const callArgs = t.fields.map(f => f.select ? `${f.id}: ${f.id}Select.value` : `${f.id}: ${f.id}Input.value`).join(", ");
  const callObj = `{ ${callArgs} }`;
  return `import { ${t.fn}, ${t.formatFn} } from "../lib/calculators/${t.slug}";
function el<T extends HTMLElement>(s: string): T { const e = document.querySelector<T>(s); if (!e) throw new Error(s); return e; }
const form = el<HTMLFormElement>("#calc-form");
${inputSelectors}
${selectSelectors}
${errorSelectors}
const resultEmpty = el<HTMLParagraphElement>("#result-empty");
const resultContent = el<HTMLDivElement>("#result-content");
const resultCaption = el<HTMLParagraphElement>("#result-caption");
const resultMain = el<HTMLParagraphElement>("#result-main");
const resultDetail = el<HTMLParagraphElement>("#result-detail");
const staleHint = el<HTMLParagraphElement>("#result-stale-hint");
const copyBtn = el<HTMLButtonElement>("#copy-btn");
const resetBtn = el<HTMLButtonElement>("#reset-btn");
let state: "empty"|"computed"|"stale" = "empty";
let lastCopy = "";
function setError(i: HTMLInputElement | HTMLSelectElement, e: HTMLParagraphElement, m: string) { e.textContent = m; e.hidden = false; i.setAttribute("aria-invalid","true"); }
function clearError(i: HTMLInputElement | HTMLSelectElement, e: HTMLParagraphElement) { e.textContent = ""; e.hidden = true; i.removeAttribute("aria-invalid"); }
function setState(s: "empty"|"computed"|"stale") {
  state = s;
  resultEmpty.hidden = s !== "empty";
  resultContent.hidden = s === "empty";
  staleHint.hidden = s !== "stale";
  copyBtn.disabled = s !== "computed";
}
function getInputByError(errId: string): HTMLInputElement | HTMLSelectElement | null {
  const m = errId.match(/field-error-(.+)/);
  if (!m) return null;
  const id = m[1];
  return document.querySelector(\`#\${id}\`);
}
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  ${[...inputIds, ...selectIds].map(id => `clearError(${id}Input || ${id}Select, err_${id});`).join("\n  ")}
  const r = ${t.fn}(${callObj});
  if (!r.ok) {
    setError(getInputByError("field-error-principal") || getInputByError("field-error-bonus") || getInputByError("field-error-amount") || ${inputIds[0]}Input, ${inputIds.length > 0 ? `err_${inputIds[0]}` : "null"}, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value as any;
  const f = ${t.formatFn}(v);
  resultCaption.textContent = \`${t.caption}\`;
  resultMain.textContent = String(f.${t.main} ?? "");
  resultDetail.textContent = \`${t.detailFmt("v")}\`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  ${[...inputIds].map(id => `${id}Input.value = "";`).join("\n  ")}
  ${[...selectIds].map(id => `${id}Select.value = ${JSON.stringify(t.fields.find(f => f.select)?.select?.[0]?.v || "")};`).join("\n  ")}
  ${[...inputIds].map(id => `clearError(${id}Input, err_${id});`).join("\n  ")}
  setState("empty");
});
${[...inputIds, ...selectIds].map(id => `(${id}Input || ${id}Select).addEventListener("input", () => { if (state === "computed") setState("stale"); });`).join("\n")}
copyBtn.addEventListener("click", () => {
  const ok = navigator.clipboard ? navigator.clipboard.writeText(lastCopy).then(() => true).catch(() => false) : Promise.resolve(false);
  void ok.then(o => { copyBtn.textContent = o ? "已复制" : "复制失败"; setTimeout(() => copyBtn.textContent = "复制结果", 2000); });
});
setState("empty");
`;
}

for (const t of TOOLS) {
  const pageDir = resolve(ROOT, `src/pages/${t.dir}`);
  mkdirSync(pageDir, { recursive: true });
  writeFileSync(resolve(pageDir, `${t.slug}.astro`), makeAstro(t));
  writeFileSync(resolve(ROOT, `src/scripts/${t.slug}-page.ts`), makePageScript(t));
  console.log("✓ " + t.slug);
}
console.log("Done: " + TOOLS.length + " tools generated.");
