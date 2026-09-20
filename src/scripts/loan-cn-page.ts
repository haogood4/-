import { calculateLoan, formatLoan } from "../lib/calculators/loan-cn";
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
const errP = el<HTMLParagraphElement>("#field-error-principal");
const errY = el<HTMLParagraphElement>("#field-error-years");
const errR = el<HTMLParagraphElement>("#field-error-rate");
const resultCaption = el<HTMLParagraphElement>("#result-caption");
const resultMain = el<HTMLParagraphElement>("#result-main");
const resultDetail = el<HTMLParagraphElement>("#result-detail");
const copyBtn = el<HTMLButtonElement>("#copy-btn");
const resetBtn = el<HTMLButtonElement>("#reset-btn");
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
  const r = calculateLoan({
    principal: principalInput.value,
    years: yearsInput.value,
    rate: rateInput.value,
  });
  if (!r.ok) {
    const m = r.error.message;
    if (m.includes("本金")) setError(principalInput, errP, m);
    else if (m.includes("年限")) setError(yearsInput, errY, m);
    else setError(rateInput, errR, m);
    setState("empty");
    return;
  }
  const f = formatLoan(r.value);
  resultCaption.textContent = `等额本息 · ${yearsInput.value} 年`;
  resultMain.textContent = `月供 ${f.monthly}`;
  resultDetail.textContent = `本金 ${principalInput.value} 元，年利率 ${rateInput.value}%，总还款 ${f.totalPayment}，总利息 ${f.totalInterest}`;
  lastCopy = `月供 ${f.monthly}，总利息 ${f.totalInterest}`;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  principalInput.value = "";
  yearsInput.value = "";
  rateInput.value = "";
  clearError(principalInput, errP);
  clearError(yearsInput, errY);
  clearError(rateInput, errR);
  setState("empty");
});
[principalInput, yearsInput, rateInput].forEach((i) =>
  i.addEventListener("input", () => {
    goStaleIfComputed();
  }),
);
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
