// 信用卡免息期计算器页面交互（外部脚本）
import { calculateCreditGrace } from "../lib/calculators/credit-card-grace";
import type { GraceField } from "../lib/calculators/credit-card-grace";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

interface FieldPair {
  input: HTMLInputElement;
  error: HTMLParagraphElement;
}

const form = requireEl<HTMLFormElement>("#calc-form");
const inputYear = requireEl<HTMLInputElement>("#input-year");
const inputMonth = requireEl<HTMLInputElement>("#input-month");
const inputDay = requireEl<HTMLInputElement>("#input-day");
const inputStatement = requireEl<HTMLInputElement>("#input-statement");
const inputGrace = requireEl<HTMLInputElement>("#input-grace");
const errorYear = requireEl<HTMLParagraphElement>("#field-error-year");
const errorMonth = requireEl<HTMLParagraphElement>("#field-error-month");
const errorDay = requireEl<HTMLParagraphElement>("#field-error-day");
const errorStatement = requireEl<HTMLParagraphElement>(
  "#field-error-statement",
);
const errorGrace = requireEl<HTMLParagraphElement>("#field-error-grace");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const fieldMap: Record<GraceField, FieldPair> = {
  year: { input: inputYear, error: errorYear },
  month: { input: inputMonth, error: errorMonth },
  day: { input: inputDay, error: errorDay },
  statement: { input: inputStatement, error: errorStatement },
  grace: { input: inputGrace, error: errorGrace },
};
const fieldPairs: FieldPair[] = Object.values(fieldMap);

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

function clearAllErrors(): void {
  for (const f of fieldPairs) clearFieldError(f.input, f.error);
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearAllErrors();

  const result = calculateCreditGrace({
    consumeYear: inputYear.value,
    consumeMonth: inputMonth.value,
    consumeDay: inputDay.value,
    statementDay: inputStatement.value,
    graceN: inputGrace.value,
  });
  if (!result.ok) {
    const target = fieldMap[result.error.field];
    setFieldError(target.input, target.error, result.error.message);
    goStaleIfComputed();
    return;
  }

  const statement = inputStatement.value.trim();
  const grace = inputGrace.value.trim();
  const consumeText = `${inputYear.value.trim()}-${inputMonth.value.trim()}-${inputDay.value.trim()}`;
  resultCaption.textContent = `消费 ${consumeText} · 账单日 ${statement} 日 · 还款宽限 ${grace} 天`;
  resultMain.textContent = `计入${result.cycleLabel} · 到期还款日 ${result.dueDateText} · 免息期 ${result.graceDays} 天`;
  resultProcess.textContent = `账单日 ${result.billDateText}；到期还款日 = 账单日 + ${grace} 天 = ${result.dueDateText}；${result.tipText}`;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputYear.value = "";
  inputMonth.value = "";
  inputDay.value = "";
  inputStatement.value = "10";
  inputGrace.value = "20";
  clearAllErrors();
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(pair: FieldPair): void {
  if (!pair.error.hidden && pair.input.value.trim() !== "")
    clearFieldError(pair.input, pair.error);
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
for (const pair of fieldPairs) {
  pair.input.addEventListener("input", () => onFieldInput(pair));
}

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
