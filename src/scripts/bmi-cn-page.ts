// BMI 计算器页面交互
import { calculateBmi, formatBmi } from "../lib/calculators/bmi-cn";
import { validateNumber } from "../lib/calculators/_shared";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";

const form = el<HTMLFormElement>("#calc-form");
const heightInput = el<HTMLInputElement>("#height");
const weightInput = el<HTMLInputElement>("#weight");
const errH = el<HTMLParagraphElement>("#field-error-height");
const errW = el<HTMLParagraphElement>("#field-error-weight");
const resultCaption = el<HTMLParagraphElement>("#result-caption");
const resultMain = el<HTMLParagraphElement>("#result-main");
const resultDetail1 = el<HTMLParagraphElement>("#result-detail1");
const resultDetail2 = el<HTMLParagraphElement>("#result-detail2");
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
  clearError(heightInput, errH);
  clearError(weightInput, errW);
  let invalid = false;
  if (!validateNumber(heightInput.value).ok) {
    setError(heightInput, errH, "请输入有效的身高数值");
    invalid = true;
  }
  if (!validateNumber(weightInput.value).ok) {
    setError(weightInput, errW, "请输入有效的体重数值");
    invalid = true;
  }
  if (invalid) {
    setState("empty");
    return;
  }
  const r = calculateBmi({
    height: heightInput.value,
    weight: weightInput.value,
  });
  if (!r.ok) {
    const m = r.error.message;
    if (m.includes("身高")) setError(heightInput, errH, m);
    else setError(weightInput, errW, m);
    setState("empty");
    return;
  }
  const fmt = formatBmi(r.value);
  resultCaption.textContent = `身高 ${heightInput.value} cm · 体重 ${weightInput.value} kg`;
  resultMain.textContent = `BMI ${fmt.bmi}`;
  resultDetail1.textContent = `中国标准：${fmt.categoryCn}（正常 18.5–23.9） · WHO 标准：${fmt.categoryWho}（正常 18.5–24.9）`;
  resultDetail2.textContent = `健康体重区间：中国标准 ${fmt.healthyRangeCn} · WHO 标准 ${fmt.healthyRangeWho}`;
  lastCopy = `BMI ${fmt.bmi}，中国标准：${fmt.categoryCn}，WHO 标准：${fmt.categoryWho}，健康体重区间（中国）${fmt.healthyRangeCn}`;
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  heightInput.value = "";
  weightInput.value = "";
  clearError(heightInput, errH);
  clearError(weightInput, errW);
  lastCopy = "";
  setState("empty");
});

[heightInput, weightInput].forEach((i) => {
  i.addEventListener("input", () => {
    goStaleIfComputed();
  });
});

setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
