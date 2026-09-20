// 产假工资计算器页面交互（外部脚本）
import {
  calculateMaternityLeavePay,
  type MaternityLeavePayField,
} from "../lib/calculators/maternity-leave-pay";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputSalary = requireEl<HTMLInputElement>("#input-salary");
const selectReward = requireEl<HTMLSelectElement>("#input-reward");
const customRewardField = requireEl<HTMLDivElement>("#custom-reward-field");
const inputRewardDays = requireEl<HTMLInputElement>("#input-reward-days");
const selectBirth = requireEl<HTMLSelectElement>("#input-birth");
const inputBabies = requireEl<HTMLInputElement>("#input-babies");
const errorSalary = requireEl<HTMLParagraphElement>("#field-error-salary");
const errorReward = requireEl<HTMLParagraphElement>("#field-error-reward");
const errorRewardDays = requireEl<HTMLParagraphElement>(
  "#field-error-reward-days",
);
const errorBirth = requireEl<HTMLParagraphElement>("#field-error-birth");
const errorBabies = requireEl<HTMLParagraphElement>("#field-error-babies");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const fieldMap: Record<
  MaternityLeavePayField,
  { input: HTMLInputElement | HTMLSelectElement; error: HTMLParagraphElement }
> = {
  salary: { input: inputSalary, error: errorSalary },
  reward: { input: selectReward, error: errorReward },
  rewardDays: { input: inputRewardDays, error: errorRewardDays },
  birth: { input: selectBirth, error: errorBirth },
  babies: { input: inputBabies, error: errorBabies },
};
const textFields = [fieldMap.salary, fieldMap.babies, fieldMap.rewardDays];

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

/** 仅在选择「自定义」预设时显示自定义天数输入框 */
function syncCustomRewardField(): void {
  customRewardField.hidden = selectReward.value !== "custom";
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  for (const f of textFields) clearFieldError(f.input, f.error);
  clearFieldError(selectReward, errorReward);
  clearFieldError(selectBirth, errorBirth);

  const result = calculateMaternityLeavePay({
    monthlySalary: inputSalary.value,
    rewardPreset: selectReward.value,
    rewardDaysCustom: inputRewardDays.value,
    birthType: selectBirth.value,
    babies: inputBabies.value,
  });
  if (!result.ok) {
    const target = fieldMap[result.error.field];
    setFieldError(target.input, target.error, result.error.message);
    goStaleIfComputed();
    return;
  }

  const birthText = selectBirth.value === "difficult" ? "难产" : "顺产";
  resultCaption.textContent = `月薪 ${inputSalary.value.trim()} 元 · ${birthText} · 产假 ${result.totalDays} 天（含奖励假 ${result.rewardDays} 天）`;
  resultMain.textContent = `产假工资 ¥${result.leavePay.toFixed(2)}（日工资 ¥${result.dailyWage.toFixed(2)}）`;
  resultProcess.textContent = result.formulaText;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputSalary.value = "";
  selectReward.value = "other";
  inputRewardDays.value = "";
  selectBirth.value = "normal";
  inputBabies.value = "1";
  syncCustomRewardField();
  for (const f of textFields) clearFieldError(f.input, f.error);
  clearFieldError(selectReward, errorReward);
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
selectReward.addEventListener("change", () => {
  syncCustomRewardField();
  goStaleIfComputed();
});
selectBirth.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

syncCustomRewardField();
setState("empty");
