// 游戏昵称生成器页面交互：随机抽取走 game-nickname-cn 引擎
import { pickNames } from "../lib/calculators/game-nickname-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const categorySelect = requireEl<HTMLSelectElement>("#nick-category");
const countSelect = requireEl<HTMLSelectElement>("#nick-count");
const countError = requireEl<HTMLParagraphElement>("#field-error-count");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

let lastText = "";

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(countSelect, countError);
  let names: string[];
  try {
    names = pickNames(categorySelect.value, Number(countSelect.value));
  } catch (err) {
    const message = err instanceof Error ? err.message : "生成失败，请重试";
    setFieldError(countSelect, countError, message);
    goStaleIfComputed();
    return;
  }
  lastText = names.join("\n");
  resultCaption.textContent = `生成 ${names.length} 个昵称（已随机打乱）`;
  resultMain.textContent = lastText;
  resultProcess.textContent = `分类：${categorySelect.value} · 再次生成可换一批`;
  setState("computed");
}

function handleReset(): void {
  categorySelect.value = "随机";
  countSelect.value = "10";
  clearFieldError(countSelect, countError);
  lastText = "";
  setState("empty");
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
categorySelect.addEventListener("change", goStaleIfComputed);
countSelect.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
