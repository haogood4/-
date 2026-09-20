// 日期间隔计算器页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import { daysBetween } from "../lib/calculators/date-diff";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputStart = requireEl<HTMLInputElement>("#input-start");
const inputEnd = requireEl<HTMLInputElement>("#input-end");
const errorStart = requireEl<HTMLParagraphElement>("#field-error-start");
const errorEnd = requireEl<HTMLParagraphElement>("#field-error-end");
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
  clearFieldError(inputStart, errorStart);
  clearFieldError(inputEnd, errorEnd);
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearAllErrors();

  const result = daysBetween(inputStart.value, inputEnd.value);
  if (!result.ok) {
    if (result.error.code === "END_BEFORE_START") {
      setFieldError(inputEnd, errorEnd, result.error.message);
      inputEnd.focus();
    } else {
      if (inputStart.value.trim() === "") {
        setFieldError(inputStart, errorStart, result.error.message);
        inputStart.focus();
      } else {
        setFieldError(inputEnd, errorEnd, result.error.message);
        inputEnd.focus();
      }
    }
    goStaleIfComputed();
    return;
  }

  const startTrim = inputStart.value.trim();
  const endTrim = inputEnd.value.trim();
  const caption = `从 ${startTrim} 到 ${endTrim}`;
  resultCaption.textContent = caption;
  resultMain.textContent = `${result.days} 天`;
  // 聚合显示：周/月/年 + 倒计时（外部实现要求）
  const parts: string[] = [];
  if (result.weeks > 0) parts.push(`${result.weeks} 周`);
  parts.push(`${result.months} 月`);
  if (result.years > 0) parts.push(`${result.years} 年`);
  const aggregate = parts.join(" + ");
  const cd = result.countDownToTarget;
  const cdText =
    cd === 0
      ? "今天就是目标日"
      : cd > 0
        ? `距离 ${endTrim} 还有 ${cd} 天`
        : `${endTrim} 已过去 ${Math.abs(cd)} 天`;
  resultProcess.textContent = `${aggregate}｜${cdText}`;
  lastCopyText = `${caption}：${resultMain.textContent}（${aggregate}）｜${cdText}`;
  setState("computed");
}

function handleReset(): void {
  inputStart.value = "";
  inputEnd.value = "";
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
inputStart.addEventListener("input", () =>
  onFieldInput(inputStart, errorStart),
);
inputEnd.addEventListener("input", () => onFieldInput(inputEnd, errorEnd));

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
