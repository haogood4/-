// 房贷计算器页面交互
import {
  calculateMortgage,
  formatMortgage,
} from "../lib/calculators/mortgage-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";

const form = el<HTMLFormElement>("#calc-form");
const typeSelect = el<HTMLSelectElement>("#type");
const principalInput = el<HTMLInputElement>("#principal");
const yearsInput = el<HTMLInputElement>("#years");
const rateInput = el<HTMLInputElement>("#rate");
const errP = el<HTMLParagraphElement>("#field-error-principal");
const errY = el<HTMLParagraphElement>("#field-error-years");
const errR = el<HTMLParagraphElement>("#field-error-rate");
const resultCaption = el<HTMLParagraphElement>("#result-caption");
const resultMain = el<HTMLParagraphElement>("#result-main");
const resultDetail1 = el<HTMLParagraphElement>("#result-detail1");
const resultDetail2 = el<HTMLParagraphElement>("#result-detail2");
const copyBtn = el<HTMLButtonElement>("#copy-btn");
const resetBtn = el<HTMLButtonElement>("#reset-btn");
const scheduleWrap = el<HTMLDetailsElement>("#schedule-wrap");
const scheduleTbody = el<HTMLTableSectionElement>("#schedule-tbody");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: el("#result-empty"),
  resultContent: el("#result-content"),
  staleHint: el("#result-stale-hint"),
  buttons: [copyBtn],
});
let lastCopy = "";

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearError(principalInput, errP);
  clearError(yearsInput, errY);
  clearError(rateInput, errR);
  const type = typeSelect.value as "equal-installment" | "equal-principal";
  const r = calculateMortgage({
    principal: principalInput.value,
    years: yearsInput.value,
    rate: rateInput.value,
    type,
  });
  if (!r.ok) {
    const m = r.error.message;
    if (m.includes("本金")) setError(principalInput, errP, m);
    else if (m.includes("年限")) setError(yearsInput, errY, m);
    else setError(rateInput, errR, m);
    setState("empty");
    return;
  }
  const fmt = formatMortgage(r.value);
  const typeLabel = type === "equal-installment" ? "等额本息" : "等额本金";
  resultCaption.textContent = `${typeLabel} · ${yearsInput.value} 年`;
  resultMain.textContent = `月供 ${fmt.monthlyFirst}`;
  resultDetail1.textContent = `本金 ${principalInput.value} 元，年利率 ${rateInput.value}%，总期数 ${r.value.totalMonths} 月`;
  resultDetail2.textContent = `总还款 ${fmt.totalPayment}，总利息 ${fmt.totalInterest}`;
  if (type === "equal-principal" && fmt.monthlyDecrease) {
    resultDetail2.textContent += `，每月递减 ${fmt.monthlyDecrease}`;
  }
  // 渲染前 12 期月供明细表（合并自外部实现）
  scheduleTbody.innerHTML = r.value.schedule
    .map(
      (row) =>
        `<tr><td>${row.month}</td><td>¥${row.payment.toFixed(2)}</td><td>¥${row.principal.toFixed(2)}</td><td>¥${row.interest.toFixed(2)}</td><td>¥${row.balance.toFixed(2)}</td></tr>`,
    )
    .join("");
  scheduleWrap.hidden = r.value.schedule.length === 0;
  lastCopy = `${typeLabel} 月供 ${fmt.monthlyFirst}，总利息 ${fmt.totalInterest}`;
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  principalInput.value = "";
  yearsInput.value = "";
  rateInput.value = "";
  typeSelect.value = "equal-installment";
  clearError(principalInput, errP);
  clearError(yearsInput, errY);
  clearError(rateInput, errR);
  scheduleTbody.innerHTML = "";
  scheduleWrap.hidden = true;
  lastCopy = "";
  setState("empty");
});

[principalInput, yearsInput, rateInput].forEach((i) => {
  i.addEventListener("input", () => {
    goStaleIfComputed();
  });
});

setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
