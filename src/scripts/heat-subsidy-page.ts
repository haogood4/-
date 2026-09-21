// 高温津贴计算器页面交互（外部脚本）
// 省份预设数据外置于 /data/heat-subsidy-presets.json：初始化时 fetch
// （模块级 Promise 缓存），就绪后按首个预设填充表单；加载失败走字段错误提示。
import {
  calculateHeatSubsidy,
  type HeatSubsidyField,
  type HeatSubsidyMode,
} from "../lib/calculators/heat-subsidy";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

/** 省份预设条目（与 /data/heat-subsidy-presets.json 结构一致） */
interface HeatPreset {
  province: string;
  mode: HeatSubsidyMode;
  /** 发放标准（元/月 或 元/日） */
  rate: number;
  /** 月数（monthly）或天数（daily） */
  duration: number;
  /** 发放月份说明 */
  months: string;
  note: string;
}

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

const LOAD_FAIL_MSG = "数据加载失败，请刷新页面重试";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

// ---------- 懒加载省份预设：首次使用时 fetch，之后复用缓存 ----------
let presetsPromise: Promise<HeatPreset[]> | null = null;
let presetsCache: HeatPreset[] = [];

function loadPresets(): Promise<HeatPreset[]> {
  if (!presetsPromise) {
    presetsPromise = fetch("/data/heat-subsidy-presets.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<HeatPreset[]>;
      })
      .catch((err: unknown) => {
        presetsPromise = null; // 失败后允许下次操作重试
        throw err;
      });
  }
  return presetsPromise;
}

/** 确保预设可用并写入缓存；失败时抛错由调用方提示 */
async function ensurePresets(): Promise<HeatPreset[]> {
  const presets = await loadPresets();
  presetsCache = presets;
  return presets;
}

function findPreset(province: string): HeatPreset | undefined {
  return presetsCache.find((p) => p.province === province);
}

/** 选择省份后自动填充计发方式/标准/时长（纯 DOM 赋值；自定义不覆盖） */
async function applyProvince(): Promise<void> {
  try {
    await ensurePresets();
  } catch {
    return; // 数据加载失败：保持当前表单值，后续操作可重试
  }
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

async function handleSubmit(event: Event): Promise<void> {
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

  // 省份标签依赖预设数据；未就绪/加载失败时给通用错误提示
  try {
    await ensurePresets();
  } catch {
    setFieldError(inputRate, errorRate, LOAD_FAIL_MSG);
    return;
  }

  resultCaption.textContent = provinceLabel();
  resultMain.textContent = `高温津贴合计 ¥${result.total.toFixed(2)}`;
  resultProcess.textContent = result.formulaText;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

async function handleReset(): Promise<void> {
  // 默认选中首个预设（上海）；数据未就绪时回退「自定义」
  try {
    const presets = await ensurePresets();
    selectProvince.value = presets[0]?.province ?? "custom";
  } catch {
    selectProvince.value = "custom";
  }
  await applyProvince();
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

form.addEventListener("submit", (event) => {
  void handleSubmit(event);
});
resetBtn.addEventListener("click", () => {
  void handleReset();
});
selectProvince.addEventListener("change", () => {
  void applyProvince();
});
selectMode.addEventListener("change", goStaleIfComputed);
for (const f of textFields) f.input.addEventListener("input", onFieldInput);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

void applyProvince(); // 数据就绪后按首个预设（上海）填充
setState("empty");
