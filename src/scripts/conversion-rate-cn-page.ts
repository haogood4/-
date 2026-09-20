import { calculateCvr, formatCvr } from "../lib/calculators/conversion-rate-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const visitsInput = el<HTMLInputElement>("#visits");
const conversionsInput = el<HTMLInputElement>("#conversions");

const err_visits = el<HTMLParagraphElement>("#field-error-visits");
const err_conversions = el<HTMLParagraphElement>("#field-error-conversions");
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
  clearError(visitsInput, err_visits);
  clearError(conversionsInput, err_conversions);
  const r = calculateCvr({
    visits: visitsInput.value,
    conversions: conversionsInput.value,
  });
  if (!r.ok) {
    setError(visitsInput, err_visits, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatCvr(v);
  resultCaption.textContent = "转化率计算器";
  resultMain.textContent = String(f.cvr ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  visitsInput.value = "";
  conversionsInput.value = "";

  clearError(visitsInput, err_visits);
  clearError(conversionsInput, err_conversions);
  setState("empty");
});
visitsInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
conversionsInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
