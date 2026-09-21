// 交通事故赔偿计算器页面交互（外部脚本）
import { calculateTraffic } from "../lib/calculators/traffic-cn";
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
const fields = {
  medical: requireEl<HTMLInputElement>("#input-medical"),
  income: requireEl<HTMLInputElement>("#input-income"),
  missDays: requireEl<HTMLInputElement>("#input-miss-days"),
  careDays: requireEl<HTMLInputElement>("#input-care-days"),
  dailyCare: requireEl<HTMLInputElement>("#input-daily-care"),
  hospitalDays: requireEl<HTMLInputElement>("#input-hospital-days"),
  nutrition: requireEl<HTMLInputElement>("#input-nutrition"),
  transport: requireEl<HTMLInputElement>("#input-transport"),
  disability: requireEl<HTMLInputElement>("#input-disability"),
  age: requireEl<HTMLInputElement>("#input-age"),
  disposable: requireEl<HTMLInputElement>("#input-disposable"),
  liability: requireEl<HTMLInputElement>("#input-liability"),
  funeralBase: requireEl<HTMLInputElement>("#input-funeral-base"),
};
const errors = {
  medical: requireEl<HTMLParagraphElement>("#field-error-medical"),
  income: requireEl<HTMLParagraphElement>("#field-error-income"),
  miss: requireEl<HTMLParagraphElement>("#field-error-miss"),
  care: requireEl<HTMLParagraphElement>("#field-error-care"),
  dailyCare: requireEl<HTMLParagraphElement>("#field-error-daily-care"),
  hospital: requireEl<HTMLParagraphElement>("#field-error-hospital"),
  nutrition: requireEl<HTMLParagraphElement>("#field-error-nutrition"),
  transport: requireEl<HTMLParagraphElement>("#field-error-transport"),
  disability: requireEl<HTMLParagraphElement>("#field-error-disability"),
  age: requireEl<HTMLParagraphElement>("#field-error-age"),
  disposable: requireEl<HTMLParagraphElement>("#field-error-disposable"),
  liability: requireEl<HTMLParagraphElement>("#field-error-liability"),
  funeral: requireEl<HTMLParagraphElement>("#field-error-funeral"),
};
const selectDeath = requireEl<HTMLSelectElement>("#input-death");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

const textFields: FieldPair[] = [
  { input: fields.medical, error: errors.medical },
  { input: fields.income, error: errors.income },
  { input: fields.missDays, error: errors.miss },
  { input: fields.careDays, error: errors.care },
  { input: fields.dailyCare, error: errors.dailyCare },
  { input: fields.hospitalDays, error: errors.hospital },
  { input: fields.nutrition, error: errors.nutrition },
  { input: fields.transport, error: errors.transport },
  { input: fields.disability, error: errors.disability },
  { input: fields.age, error: errors.age },
  { input: fields.disposable, error: errors.disposable },
  { input: fields.liability, error: errors.liability },
  { input: fields.funeralBase, error: errors.funeral },
];

function clearAll(): void {
  for (const f of textFields) clearFieldError(f.input, f.error);
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearAll();

  const result = calculateTraffic({
    income: fields.income.value,
    liability: fields.liability.value,
    medical: fields.medical.value,
    missDays: fields.missDays.value,
    careDays: fields.careDays.value,
    dailyCare: fields.dailyCare.value,
    hospitalDays: fields.hospitalDays.value,
    nutrition: fields.nutrition.value,
    transport: fields.transport.value,
    disability: fields.disability.value,
    age: fields.age.value,
    death: selectDeath.value,
    disposableIncome: fields.disposable.value,
    funeralBase: fields.funeralBase.value,
  });
  if (!result.ok) {
    const msg = result.error.message;
    const field = result.error.field;
    const target: FieldPair | undefined = textFields.find(
      (f) =>
        (field === "income" && f.input === fields.income) ||
        (field === "disposableIncome" && f.input === fields.disposable) ||
        (field === "age" && f.input === fields.age) ||
        (field === "disability" && f.input === fields.disability),
    );
    if (target) setFieldError(target.input, target.error, msg);
    else setFieldError(fields.medical, errors.medical, msg);
    goStaleIfComputed();
    return;
  }

  const deathText = selectDeath.value === "true" ? "死亡" : "伤残";
  resultCaption.textContent = `责任比例 ${(result.liabilityRatio * 100).toFixed(0)}% · ${deathText}`;
  resultMain.textContent = `估算赔付 ¥${result.total.toFixed(2)}（项目小计 ¥${result.subtotal.toFixed(2)}）`;
  resultProcess.textContent = result.formulaText;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  for (const f of textFields) f.input.value = "";
  selectDeath.value = "false";
  clearAll();
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  for (const f of textFields) {
    if (!f.error.hidden && f.input.value.trim() !== "")
      clearFieldError(f.input, f.error);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
for (const f of textFields) f.input.addEventListener("input", onFieldInput);
selectDeath.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
