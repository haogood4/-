// 年终奖计税方式对比计算器页面交互（外部脚本）
import { calculateBonusTaxCompare } from "../lib/calculators/bonus-tax-compare";
import type { BonusCompareField } from "../lib/calculators/bonus-tax-compare";
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
const inputBonus = requireEl<HTMLInputElement>("#input-bonus");
const inputTaxable = requireEl<HTMLInputElement>("#input-taxable");
const errorBonus = requireEl<HTMLParagraphElement>("#field-error-bonus");
const errorTaxable = requireEl<HTMLParagraphElement>("#field-error-taxable");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const fieldMap: Record<BonusCompareField, FieldPair> = {
  bonus: { input: inputBonus, error: errorBonus },
  taxable: { input: inputTaxable, error: errorTaxable },
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

  const result = calculateBonusTaxCompare({
    bonus: inputBonus.value,
    taxableIncome: inputTaxable.value,
  });
  if (!result.ok) {
    const target = fieldMap[result.error.field];
    setFieldError(target.input, target.error, result.error.message);
    goStaleIfComputed();
    return;
  }

  const bonusText = inputBonus.value.trim();
  const taxableText = inputTaxable.value.trim();
  resultCaption.textContent = `年终奖 ¥${bonusText} · 综合所得应纳税所得额 ¥${taxableText}`;
  resultMain.textContent = `${result.recommendedText}（单独计税 ¥${result.taxSeparate.toFixed(2)} / 并入实际多缴 ¥${result.incrementalMerge.toFixed(2)}）`;
  resultProcess.textContent = result.breakdownText;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputBonus.value = "";
  inputTaxable.value = "";
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
