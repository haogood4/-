// 人民币大写转换页面交互（样板见 _page-kit.ts；kit 加载即自动 initToolTracking）
import { convertRmbUppercase } from "../lib/calculators/rmb-uppercase-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const amountInput = requireEl<HTMLInputElement>("#amount");
const errAmount = requireEl<HTMLParagraphElement>("#field-error-amount");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

let lastText = "";

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(amountInput, errAmount);
  const value = amountInput.value;
  if (!value.trim()) {
    setFieldError(amountInput, errAmount, "请输入金额（如 123.45）");
    setState("empty");
    return;
  }

  const r = convertRmbUppercase({ value });
  if (!r.ok) {
    setFieldError(amountInput, errAmount, r.error.message);
    setState("empty");
    return;
  }
  lastText = r.text;
  resultCaption.textContent = "人民币大写";
  resultMain.textContent = r.text;
  resultDetail.textContent =
    r.cents % 100 === 0
      ? `输入 ¥${value.trim()}：无角无分，结尾写「整」`
      : `输入 ¥${value.trim()}：角位 ${Math.floor((r.cents % 100) / 10)}、分位 ${r.cents % 10}，按拾佰仟万亿与「零」规则转写`;
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  amountInput.value = "";
  lastText = "";
  clearFieldError(amountInput, errAmount);
  setState("empty");
});

amountInput.addEventListener("input", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastText);
setState("empty");
