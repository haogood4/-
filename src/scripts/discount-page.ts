// 折扣计算器页面交互（外部脚本，无内联事件）
import { calculateDiscount } from "../lib/calculators/discount";
import {
  bindCopyButton,
  bindShareButton,
  clearFieldError,
  createResultState,
  requireEl,
  setFieldError,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputPrice = requireEl<HTMLInputElement>("#input-price");
const inputDiscount = requireEl<HTMLInputElement>("#input-discount");
const errorPrice = requireEl<HTMLParagraphElement>("#field-error-price");
const errorDiscount = requireEl<HTMLParagraphElement>("#field-error-discount");
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

function clearAllErrors(): void {
  clearFieldError(inputPrice, errorPrice);
  clearFieldError(inputDiscount, errorDiscount);
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearAllErrors();

  const rawPrice = inputPrice.value;
  const rawDiscount = inputDiscount.value;
  const result = calculateDiscount(rawPrice, rawDiscount);
  if (!result.ok) {
    // 业务校验失败 → 定位到对应字段
    if (result.error.code === "DISCOUNT_OUT_OF_RANGE") {
      setFieldError(inputDiscount, errorDiscount, result.error.message);
      inputDiscount.focus();
    } else {
      setFieldError(inputPrice, errorPrice, result.error.message);
      inputPrice.focus();
    }
    goStaleIfComputed();
    return;
  }

  const priceTrim = rawPrice.trim();
  const discountTrim = rawDiscount.trim();
  const caption = `原价 ${priceTrim} 减 ${discountTrim}%`;
  const mainText = `实付 ${result.paidText}，省下 ${result.savedText}`;
  resultCaption.textContent = caption;
  resultMain.textContent = mainText;
  resultProcess.textContent = result.processText;
  lastCopyText = `${caption}：${mainText}（${result.processText}）`;
  setState("computed");
}

function handleReset(): void {
  inputPrice.value = "";
  inputDiscount.value = "";
  clearAllErrors();
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(
  input: HTMLInputElement,
  err: HTMLParagraphElement,
): void {
  if (!err.hidden) {
    // 简单试探：只要 trim 后不是空就清除错误
    if (input.value.trim() !== "") clearFieldError(input, err);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputPrice.addEventListener("input", () =>
  onFieldInput(inputPrice, errorPrice),
);
inputDiscount.addEventListener("input", () =>
  onFieldInput(inputDiscount, errorDiscount),
);

setState("empty");
bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);
