// 长尾关键词扩展页面交互：笛卡尔拼接走 seo-keywords-cn 引擎
import {
  generateLongTail,
  parseLines,
} from "../lib/calculators/seo-keywords-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const coreInput = requireEl<HTMLInputElement>("#kw-core");
const coreError = requireEl<HTMLParagraphElement>("#field-error-core");
const prefixesInput = requireEl<HTMLTextAreaElement>("#kw-prefixes");
const suffixesInput = requireEl<HTMLTextAreaElement>("#kw-suffixes");
const questionsInput = requireEl<HTMLTextAreaElement>("#kw-questions");
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
  clearFieldError(coreInput, coreError);
  let words: string[];
  try {
    words = generateLongTail(coreInput.value, {
      prefixes: parseLines(prefixesInput.value),
      suffixes: parseLines(suffixesInput.value),
      questions: parseLines(questionsInput.value),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "扩展失败，请重试";
    setFieldError(coreInput, coreError, message);
    coreInput.focus();
    goStaleIfComputed();
    return;
  }
  lastText = words.join("\n");
  resultCaption.textContent = `扩展出 ${words.length} 个长尾词`;
  resultMain.textContent = lastText;
  resultProcess.textContent =
    "核心词 + 前置词 / 后缀词 / 疑问句模板三组笛卡尔拼接，已去重保序";
  setState("computed");
}

function handleReset(): void {
  coreInput.value = "";
  prefixesInput.value = "";
  suffixesInput.value = "";
  questionsInput.value = "";
  clearFieldError(coreInput, coreError);
  lastText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!coreError.hidden && coreInput.value !== "") {
    clearFieldError(coreInput, coreError);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
for (const el of [coreInput, prefixesInput, suffixesInput, questionsInput]) {
  el.addEventListener("input", onFieldInput);
}

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
