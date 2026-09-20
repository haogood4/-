// 百分比计算器页面交互（外部脚本，无内联事件）
// 复用 src/lib/calculators/percentage.ts 的校验 / 计算 / 格式化
import {
  calculatePercentage,
  formatResult,
  validateInput,
  type PercentageMode,
} from "../lib/calculators/percentage";
import {
  bindCopyButton,
  bindShareButton,
  clearFieldError,
  createResultState,
  requireEl,
  setFieldError,
} from "./_page-kit";

interface ModeMeta {
  labelA: string;
  labelB: string;
  desc: string;
  caption: (a: string, b: string) => string;
  process: (a: string, b: string, value: string) => string;
  suffix: "%" | "";
  sign: boolean; // 是否为正值补「+」前缀（变化率模式）
}

const MODE_META: Record<PercentageMode, ModeMeta> = {
  "percent-of": {
    labelA: "数值 a（原值）",
    labelB: "百分比 b（%）",
    desc: "计算 a 的 b% 是多少。例如：200 的 15% = 30。",
    caption: (a, b) => `${a} 的 ${b}% 等于`,
    process: (a, b, v) => `${a} × ${b} ÷ 100 = ${v}`,
    suffix: "",
    sign: false,
  },
  "what-percent": {
    labelA: "数值 a（部分）",
    labelB: "数值 b（总数）",
    desc: "计算 a 占 b 的百分比。例如：30 占 200 = 15%。",
    caption: (a, b) => `${a} 占 ${b} 的百分比`,
    process: (a, b, v) => `${a} ÷ ${b} × 100 = ${v}`,
    suffix: "%",
    sign: false,
  },
  change: {
    labelA: "数值 a（原值）",
    labelB: "数值 b（新值）",
    desc: "计算从 a 到 b 的变化率，正数为增长、负数为下降。例如：100 → 150 = +50%。",
    caption: (a, b) => `${a} → ${b} 的变化率`,
    process: (a, b, v) => `(${b} − ${a}) ÷ ${a} × 100 = ${v}`,
    suffix: "%",
    sign: true,
  },
};

const form = requireEl<HTMLFormElement>("#calc-form");
const modeSelect = requireEl<HTMLSelectElement>("#mode");
const inputA = requireEl<HTMLInputElement>("#input-a");
const inputB = requireEl<HTMLInputElement>("#input-b");
const labelA = requireEl<HTMLLabelElement>("#label-a");
const labelB = requireEl<HTMLLabelElement>("#label-b");
const modeDesc = requireEl<HTMLParagraphElement>("#mode-desc");
const errorA = requireEl<HTMLParagraphElement>("#field-error-a");
const errorB = requireEl<HTMLParagraphElement>("#field-error-b");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});
let lastCopyText = "";

function requireMeta(mode: PercentageMode): ModeMeta {
  return MODE_META[mode] ?? MODE_META["percent-of"];
}

function applyModeMeta(): void {
  const meta = requireMeta(modeSelect.value as PercentageMode);
  labelA.textContent = meta.labelA;
  labelB.textContent = meta.labelB;
  modeDesc.textContent = meta.desc;
}

function clearAllErrors(): void {
  clearFieldError(inputA, errorA);
  clearFieldError(inputB, errorB);
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearAllErrors();

  const rawA = inputA.value;
  const rawB = inputB.value;
  const checkA = validateInput(rawA);
  const checkB = validateInput(rawB);

  let firstInvalid: HTMLInputElement | null = null;
  if (!checkA.ok) {
    setFieldError(inputA, errorA, checkA.error.message);
    firstInvalid = inputA;
  }
  if (!checkB.ok) {
    setFieldError(inputB, errorB, checkB.error.message);
    firstInvalid ??= inputB;
  }

  if (firstInvalid) {
    goStaleIfComputed();
    firstInvalid.focus();
    return;
  }

  const mode = modeSelect.value as PercentageMode;
  const result = calculatePercentage(mode, rawA, rawB);
  if (!result.ok) {
    // 业务校验失败（除零 / 变化率基数为 0）：定位到对应字段
    if (result.error.code === "DIVIDE_BY_ZERO") {
      setFieldError(inputB, errorB, result.error.message);
      inputB.focus();
    } else {
      setFieldError(inputA, errorA, result.error.message);
      inputA.focus();
    }
    goStaleIfComputed();
    return;
  }

  const meta = requireMeta(mode);
  const a = rawA.trim();
  const b = rawB.trim();
  const formatted = formatResult(result.value);
  const mainText = `${meta.sign && result.value > 0 ? "+" : ""}${formatted}${meta.suffix}`;
  resultCaption.textContent = meta.caption(a, b);
  resultMain.textContent = mainText;
  resultProcess.textContent = meta.process(a, b, formatted);
  lastCopyText = `${resultCaption.textContent}：${mainText}（${resultProcess.textContent}）`;
  setState("computed");
}

function handleReset(): void {
  inputA.value = "";
  inputB.value = "";
  modeSelect.value = "percent-of";
  applyModeMeta();
  clearAllErrors();
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(
  input: HTMLInputElement,
  err: HTMLParagraphElement,
): void {
  if (!err.hidden && validateInput(input.value).ok) {
    clearFieldError(input, err);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
modeSelect.addEventListener("change", () => {
  applyModeMeta();
  goStaleIfComputed();
});
inputA.addEventListener("input", () => onFieldInput(inputA, errorA));
inputB.addEventListener("input", () => onFieldInput(inputB, errorB));

applyModeMeta();
setState("empty");
bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);
