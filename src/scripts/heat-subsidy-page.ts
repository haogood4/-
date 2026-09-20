// 高温津贴计算器页面交互（外部脚本）
import {
  calculateHeatSubsidy,
  HEAT_PRESETS,
  type HeatSubsidyField,
} from "../lib/calculators/heat-subsidy";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const selectProvince = requireEl<HTMLSelectElement>("#input-province");
const selectMode = requireEl<HTMLSelectElement>("#input-mode");
const inputRate = requireEl<HTMLInputElement>("#input-rate");
const inputDuration = requireEl<HTMLInputElement>("#input-duration");
const errorMode = requireEl<HTMLParagraphElement>("#field-error-mode");
const errorRate = requireEl<HTMLParagraphElement>("#field-error-rate");
const errorDuration = requireEl<HTMLParagraphElement>("#field-error-duration");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const fieldMap: Record<
  HeatSubsidyField,
  { input: HTMLInputElement | HTMLSelectElement; error: HTMLParagraphElement }
> = {
  mode: { input: selectMode, error: errorMode },
  rate: { input: inputRate, error: errorRate },
  duration: { input: inputDuration, error: errorDuration },
};
const textFields = [fieldMap.rate, fieldMap.duration];

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

function findPreset(province: string) {
  return HEAT_PRESETS.find((p) => p.province === province);
}

/** 选择省份后自动填充计发方式/标准/时长（纯 DOM 赋值；自定义不覆盖） */
function applyProvince(): void {
  const preset = findPreset(selectProvince.value);
  if (!preset) return;
  selectMode.value = preset.mode;
  inputRate.value = String(preset.rate);
  inputDuration.value = String(preset.duration);
  goStaleIfComputed();
}

function provinceLabel(): string {
  const preset = findPreset(selectProvince.value);
  if (!preset) return "自定义标准";
  const unit = preset.mode === "monthly" ? "元/月" : "元/日";
  const span = preset.mode === "monthly" ? "个月" : "日";
  return `${preset.province} ${preset.rate} ${unit} × ${preset.duration} ${span}`;
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(selectMode, errorMode);
  for (const f of textFields) clearFieldError(f.input, f.error);

  const result = calculateHeatSubsidy({
    mode: selectMode.value,
    rate: inputRate.value,
    duration: inputDuration.value,
  });
  if (!result.ok) {
    const target = fieldMap[result.error.field];
    setFieldError(target.input, target.error, result.error.message);
    goStaleIfComputed();
    return;
  }

  resultCaption.textContent = provinceLabel();
  resultMain.textContent = `高温津贴合计 ¥${result.total.toFixed(2)}`;
  resultProcess.textContent = result.formulaText;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  selectProvince.value = HEAT_PRESETS[0]?.province ?? "custom";
  applyProvince();
  for (const f of textFields) clearFieldError(f.input, f.error);
  clearFieldError(selectMode, errorMode);
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
selectProvince.addEventListener("change", applyProvince);
selectMode.addEventListener("change", goStaleIfComputed);
for (const f of textFields) f.input.addEventListener("input", onFieldInput);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

applyProvince(); // 初始按首个预设（上海）填充
setState("empty");
