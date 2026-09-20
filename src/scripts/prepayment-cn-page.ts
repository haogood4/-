// 提前还款计算器页面交互
import {
  calculatePrepayment,
  formatPrepayment,
} from "../lib/calculators/prepayment-cn";
import { validateNumber } from "../lib/calculators/_shared";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";

const form = el<HTMLFormElement>("#calc-form");
const principalInput = el<HTMLInputElement>("#principal");
const yearsInput = el<HTMLInputElement>("#years");
const rateInput = el<HTMLInputElement>("#rate");
const paidInput = el<HTMLInputElement>("#paidMonths");
const prepayInput = el<HTMLInputElement>("#prepay");
const errP = el<HTMLParagraphElement>("#field-error-principal");
const errY = el<HTMLParagraphElement>("#field-error-years");
const errR = el<HTMLParagraphElement>("#field-error-rate");
const errN = el<HTMLParagraphElement>("#field-error-paidMonths");
const errX = el<HTMLParagraphElement>("#field-error-prepay");
const resultCaption = el<HTMLParagraphElement>("#result-caption");
const resultMain = el<HTMLParagraphElement>("#result-main");
const resultDetail1 = el<HTMLParagraphElement>("#result-detail1");
const resultDetail2 = el<HTMLParagraphElement>("#result-detail2");
const resultDetail3 = el<HTMLParagraphElement>("#result-detail3");
const copyBtn = el<HTMLButtonElement>("#copy-btn");
const resetBtn = el<HTMLButtonElement>("#reset-btn");

const fields: Array<{
  input: HTMLInputElement;
  err: HTMLParagraphElement;
  msg: string;
}> = [
  { input: principalInput, err: errP, msg: "请输入有效的贷款本金" },
  { input: yearsInput, err: errY, msg: "请输入有效的贷款年限" },
  { input: rateInput, err: errR, msg: "请输入有效的年利率" },
  { input: paidInput, err: errN, msg: "请输入有效的已还期数" },
  { input: prepayInput, err: errX, msg: "请输入有效的提前还款金额" },
];

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: el("#result-empty"),
  resultContent: el("#result-content"),
  staleHint: el("#result-stale-hint"),
  buttons: [copyBtn],
});
let lastCopy = "";

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  fields.forEach((f) => clearError(f.input, f.err));
  let invalid = false;
  fields.forEach((f) => {
    if (!validateNumber(f.input.value).ok) {
      setError(f.input, f.err, f.msg);
      invalid = true;
    }
  });
  if (invalid) {
    setState("empty");
    return;
  }
  const r = calculatePrepayment({
    principal: principalInput.value,
    years: yearsInput.value,
    rate: rateInput.value,
    paidMonths: paidInput.value,
    prepay: prepayInput.value,
  });
  if (!r.ok) {
    const m = r.error.message;
    if (m.includes("本金")) setError(principalInput, errP, m);
    else if (m.includes("年限")) setError(yearsInput, errY, m);
    else if (m.includes("利率")) setError(rateInput, errR, m);
    else if (m.includes("已还期数")) setError(paidInput, errN, m);
    else setError(prepayInput, errX, m);
    setState("empty");
    return;
  }
  const fmt = formatPrepayment(r.value);
  resultCaption.textContent = `原月供 ${fmt.originalMonthly} · 已还 ${paidInput.value} 期后剩余本金 ${fmt.balance}`;
  resultMain.textContent = `方案 A（缩短年限）：剩 ${r.value.planA.months} 期，节省利息 ${fmt.planA.savedInterest}`;
  resultDetail1.textContent = `方案 A 月供维持 ${fmt.planA.monthly} 基本不变（最后一期按剩余本金结算），剩余总利息 ${fmt.planA.totalInterest}`;
  resultDetail2.textContent = `方案 B（年限不变）：新月供 ${fmt.planB.monthly}，剩 ${r.value.planB.months} 期，节省利息 ${fmt.planB.savedInterest}，剩余总利息 ${fmt.planB.totalInterest}`;
  resultDetail3.textContent = `提前还款 ${prepayInput.value} 元后剩余本金 ${fmt.newPrincipal}；若不提前还款，剩余总利息约 ¥${r.value.baselineInterest.toFixed(2)}`;
  lastCopy = `提前还款对比：方案 A 缩短年限剩 ${r.value.planA.months} 期，节省利息 ${fmt.planA.savedInterest}；方案 B 降低月供至 ${fmt.planB.monthly}，节省利息 ${fmt.planB.savedInterest}`;
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  fields.forEach((f) => {
    f.input.value = "";
    clearError(f.input, f.err);
  });
  lastCopy = "";
  setState("empty");
});

fields.forEach((f) => {
  f.input.addEventListener("input", () => {
    goStaleIfComputed();
  });
});

setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
