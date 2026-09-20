// 预产期计算器页面交互（样板见 _page-kit.ts）
import {
  calculateDueDate,
  formatDueDate,
} from "../lib/calculators/due-date-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const lastPeriodInput = requireEl<HTMLInputElement>("#lastPeriod");
const err_lastPeriod = requireEl<HTMLParagraphElement>(
  "#field-error-lastPeriod",
);
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(lastPeriodInput, err_lastPeriod);
  const r = calculateDueDate({ lastPeriod: lastPeriodInput.value });
  if (!r.ok) {
    setFieldError(lastPeriodInput, err_lastPeriod, r.error.message);
    setState("empty");
    return;
  }
  const f = formatDueDate(r.value);
  resultCaption.textContent = "预产期计算器";
  resultMain.textContent = String(f.dueDate ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent ?? "";
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  lastPeriodInput.value = "";
  clearFieldError(lastPeriodInput, err_lastPeriod);
  setState("empty");
});
lastPeriodInput.addEventListener("input", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
