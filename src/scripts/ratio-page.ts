// 比例计算器页面交互（外部脚本，无内联事件）
import { solveRatio, type RatioMode } from "../lib/calculators/ratio";
import {
  bindCopyButton,
  bindShareButton,
  clearFieldError,
  createResultState,
  requireEl,
  setFieldError,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const modeSelect = requireEl<HTMLSelectElement>("#mode");
const modeDesc = requireEl<HTMLParagraphElement>("#mode-desc");
const inputA = requireEl<HTMLInputElement>("#input-a");
const inputB = requireEl<HTMLInputElement>("#input-b");
const inputC = requireEl<HTMLInputElement>("#input-c");
const errorA = requireEl<HTMLParagraphElement>("#field-error-a");
const errorB = requireEl<HTMLParagraphElement>("#field-error-b");
const errorC = requireEl<HTMLParagraphElement>("#field-error-c");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const MODE_DESC: Record<RatioMode, string> = {
  "find-d": "由 a、b、c 解出 x。例：2 : 4 = 3 : x → x = 6。",
  "find-c": "由 a、b、c 解出 x。例：2 : 4 = x : 6 → x = 3。",
};

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});
let lastCopyText = "";

function clearAllErrors(): void {
  clearFieldError(inputA, errorA);
  clearFieldError(inputB, errorB);
  clearFieldError(inputC, errorC);
}

function applyModeMeta(): void {
  const mode = modeSelect.value as RatioMode;
  modeDesc.textContent = MODE_DESC[mode] ?? MODE_DESC["find-d"];
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearAllErrors();

  const mode = modeSelect.value as RatioMode;
  const result = solveRatio(mode, inputA.value, inputB.value, inputC.value);
  if (!result.ok) {
    const code = result.error.code;
    if (code === "ZERO_RATIO_TERM") {
      // 同时标记 a、b 字段
      setFieldError(inputA, errorA, result.error.message);
      setFieldError(inputB, errorB, result.error.message);
      inputA.focus();
    } else if (
      code === "EMPTY" ||
      code === "INVALID_NUMBER" ||
      code === "TOO_MANY_DECIMALS" ||
      code === "OUT_OF_RANGE"
    ) {
      // 基础校验失败：定位到 a（首位）
      setFieldError(inputA, errorA, result.error.message);
      inputA.focus();
    } else {
      setFieldError(inputC, errorC, result.error.message);
      inputC.focus();
    }
    goStaleIfComputed();
    return;
  }

  const a = inputA.value.trim();
  const b = inputB.value.trim();
  const c = inputC.value.trim();
  const expr =
    mode === "find-d" ? `${a} : ${b} = ${c} : x` : `${a} : ${b} = x : ${c}`;
  resultCaption.textContent = expr;
  resultMain.textContent = `x = ${result.valueText}`;
  resultProcess.textContent = result.processText;
  lastCopyText = `${expr} → ${resultMain.textContent}（${result.processText}）`;
  setState("computed");
}

function handleReset(): void {
  inputA.value = "";
  inputB.value = "";
  inputC.value = "";
  modeSelect.value = "find-d";
  applyModeMeta();
  clearAllErrors();
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(
  input: HTMLInputElement,
  err: HTMLParagraphElement,
): void {
  if (!err.hidden && input.value.trim() !== "") {
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
inputC.addEventListener("input", () => onFieldInput(inputC, errorC));

applyModeMeta();
setState("empty");
bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);
