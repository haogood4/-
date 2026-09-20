// 生育津贴计算器页面交互（外部脚本）
import {
  calculateMaternityAllowance,
  type MaternityAllowanceField,
} from "../lib/calculators/maternity-allowance";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputWage = requireEl<HTMLInputElement>("#input-wage");
const selectBirth = requireEl<HTMLSelectElement>("#input-birth");
const inputBabies = requireEl<HTMLInputElement>("#input-babies");
const inputDaysOverride = requireEl<HTMLInputElement>("#input-days-override");
const errorWage = requireEl<HTMLParagraphElement>("#field-error-wage");
const errorBirth = requireEl<HTMLParagraphElement>("#field-error-birth");
const errorBabies = requireEl<HTMLParagraphElement>("#field-error-babies");
const errorDaysOverride = requireEl<HTMLParagraphElement>(
  "#field-error-days-override",
);
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const fieldMap: Record<
  MaternityAllowanceField,
  { input: HTMLInputElement | HTMLSelectElement; error: HTMLParagraphElement }
> = {
  wage: { input: inputWage, error: errorWage },
  birth: { input: selectBirth, error: errorBirth },
  babies: { input: inputBabies, error: errorBabies },
  daysOverride: { input: inputDaysOverride, error: errorDaysOverride },
};
const textFields = [fieldMap.wage, fieldMap.babies, fieldMap.daysOverride];

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

function handleSubmit(event: Event): void {
  event.preventDefault();
  for (const f of textFields) clearFieldError(f.input, f.error);
  clearFieldError(selectBirth, errorBirth);

  const result = calculateMaternityAllowance({
    avgWage: inputWage.value,
    birthType: selectBirth.value,
    babies: inputBabies.value,
    daysOverride: inputDaysOverride.value,
  });
  if (!result.ok) {
    const target = fieldMap[result.error.field];
    setFieldError(target.input, target.error, result.error.message);
    goStaleIfComputed();
    return;
  }

  const birthText = selectBirth.value === "difficult" ? "难产" : "顺产";
  resultCaption.textContent = `月均缴费工资 ${inputWage.value.trim()} 元 · ${birthText} · ${result.days} 天`;
  resultMain.textContent = `生育津贴 ¥${result.allowance.toFixed(2)}（日均基数 ¥${result.dailyBase.toFixed(2)}）`;
  resultProcess.textContent = result.formulaText;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputWage.value = "";
  selectBirth.value = "normal";
  inputBabies.value = "1";
  inputDaysOverride.value = "";
  for (const f of textFields) clearFieldError(f.input, f.error);
  clearFieldError(selectBirth, errorBirth);
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
selectBirth.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
