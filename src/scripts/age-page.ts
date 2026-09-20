// 年龄计算器页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import { calculateAge } from "../lib/calculators/age";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputBirth = requireEl<HTMLInputElement>("#input-birth");
const inputTarget = requireEl<HTMLInputElement>("#input-target");
const errorBirth = requireEl<HTMLParagraphElement>("#field-error-birth");
const errorTarget = requireEl<HTMLParagraphElement>("#field-error-target");
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

function clearAllErrors(): void {
  clearFieldError(inputBirth, errorBirth);
  clearFieldError(inputTarget, errorTarget);
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearAllErrors();

  const result = calculateAge(inputBirth.value, inputTarget.value);
  if (!result.ok) {
    if (result.error.code === "TARGET_BEFORE_BIRTH") {
      setFieldError(inputTarget, errorTarget, result.error.message);
      inputTarget.focus();
    } else {
      // INVALID_DATE：先看出生字段是否已填，定位到更可疑字段
      if (inputBirth.value.trim() === "") {
        setFieldError(inputBirth, errorBirth, result.error.message);
        inputBirth.focus();
      } else {
        setFieldError(inputTarget, errorTarget, result.error.message);
        inputTarget.focus();
      }
    }
    goStaleIfComputed();
    return;
  }

  const birthTrim = inputBirth.value.trim();
  const targetTrim = inputTarget.value.trim();
  const caption = `从 ${birthTrim} 到 ${targetTrim}`;
  resultCaption.textContent = caption;
  resultMain.textContent = `${result.years} 岁`;
  resultProcess.textContent = `${caption}：${result.years} 周岁`;
  lastCopyText = `${caption}：${resultMain.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputBirth.value = "";
  inputTarget.value = "";
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
inputBirth.addEventListener("input", () =>
  onFieldInput(inputBirth, errorBirth),
);
inputTarget.addEventListener("input", () =>
  onFieldInput(inputTarget, errorTarget),
);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
