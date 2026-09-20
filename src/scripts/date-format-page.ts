// 日期格式转换计算器页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import { formatDate } from "../lib/calculators/date-format";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const rawInput = requireEl<HTMLInputElement>("#input-raw");
const patternSelect = requireEl<HTMLSelectElement>("#select-pattern");
const customPatternField = requireEl<HTMLDivElement>("#custom-pattern-field");
const patternInput = requireEl<HTMLInputElement>("#input-pattern");
const offsetSelect = requireEl<HTMLSelectElement>("#select-offset");
const errorRaw = requireEl<HTMLParagraphElement>("#field-error-raw");
const errorPattern = requireEl<HTMLParagraphElement>("#field-error-pattern");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const DEFAULT_PATTERN = "YYYY-MM-DD";

/** 浏览器本地时区偏移（分钟，东为正）：getTimezoneOffset 返回东为负，取反 */
const localOffsetMinutes = (): number => -new Date().getTimezoneOffset();

function currentOffsetLabel(): string {
  const selected = offsetSelect.options[offsetSelect.selectedIndex];
  return selected ? selected.textContent : offsetSelect.value;
}

function resolveOffsetMinutes(): number {
  const value = offsetSelect.value;
  if (value === "local") return localOffsetMinutes();
  if (value === "utc") return 0;
  return Number(value);
}

/** 返回 null 表示自定义模板为空（已就地报错） */
function resolvePattern(): string | null {
  if (patternSelect.value === "custom") {
    const trimmed = patternInput.value.trim();
    if (trimmed === "") {
      setFieldError(patternInput, errorPattern, "请输入输出模板");
      return null;
    }
    clearFieldError(patternInput, errorPattern);
    return trimmed;
  }
  return patternSelect.value;
}

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn],
});

function syncCustomField(): void {
  customPatternField.hidden = patternSelect.value !== "custom";
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(rawInput, errorRaw);

  const pattern = resolvePattern();
  if (pattern === null) {
    patternInput.focus();
    goStaleIfComputed();
    return;
  }

  const result = formatDate({
    raw: rawInput.value,
    pattern,
    utcOffset: resolveOffsetMinutes(),
  });
  if (!result.ok) {
    setFieldError(rawInput, errorRaw, result.error.message);
    rawInput.focus();
    goStaleIfComputed();
    return;
  }

  resultCaption.textContent = `输入「${rawInput.value.trim()}」→ 模板「${pattern}」（${currentOffsetLabel()}）`;
  resultMain.textContent = result.formatted;
  resultDetail.textContent =
    `星期：${result.weekday} ｜ 年内第 ${result.dayOfYear} 天（全年 ${result.daysInYear} 天，${result.isLeapYear ? "闰年" : "平年"}）｜ ` +
    `Unix 时间戳：${result.timestampSec} 秒 / ${result.timestampMs} 毫秒 ｜ ISO：${result.iso}`;
  lastCopyText = `${result.formatted}（${resultDetail.textContent}）`;
  setState("computed");
}

function handleReset(): void {
  rawInput.value = "";
  patternSelect.value = DEFAULT_PATTERN;
  patternInput.value = "";
  clearFieldError(rawInput, errorRaw);
  clearFieldError(patternInput, errorPattern);
  syncCustomField();
  lastCopyText = "";
  setState("empty");
}

function onRawInput(): void {
  if (!errorRaw.hidden && rawInput.value.trim() !== "") {
    clearFieldError(rawInput, errorRaw);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
rawInput.addEventListener("input", onRawInput);
patternSelect.addEventListener("change", () => {
  syncCustomField();
  goStaleIfComputed();
});
patternInput.addEventListener("input", () => {
  if (!errorPattern.hidden && patternInput.value.trim() !== "") {
    clearFieldError(patternInput, errorPattern);
  }
  goStaleIfComputed();
});
offsetSelect.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);

// 默认按浏览器本地时区
offsetSelect.value = "local";
syncCustomField();
setState("empty");
