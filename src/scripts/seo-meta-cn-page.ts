// SEO meta 标签生成页面交互：TDK 生成与长度检查走 seo-meta-cn 引擎
import {
  checkDescLength,
  checkTitleLength,
  generateMeta,
} from "../lib/calculators/seo-meta-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const titleInput = requireEl<HTMLInputElement>("#meta-title");
const titleError = requireEl<HTMLParagraphElement>("#field-error-title");
const descInput = requireEl<HTMLTextAreaElement>("#meta-desc");
const descError = requireEl<HTMLParagraphElement>("#field-error-desc");
const keywordsInput = requireEl<HTMLInputElement>("#meta-keywords");
const canonicalInput = requireEl<HTMLInputElement>("#meta-canonical");
const canonicalError = requireEl<HTMLParagraphElement>(
  "#field-error-canonical",
);
const robotsSelect = requireEl<HTMLSelectElement>("#meta-robots");
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
  clearFieldError(titleInput, titleError);
  clearFieldError(descInput, descError);
  clearFieldError(canonicalInput, canonicalError);
  const title = titleInput.value;
  if (title.trim() === "") {
    setFieldError(titleInput, titleError, "请输入页面标题（title）");
    titleInput.focus();
    goStaleIfComputed();
    return;
  }
  if (descInput.value.trim() === "") {
    setFieldError(descInput, descError, "请输入页面描述（description）");
    descInput.focus();
    goStaleIfComputed();
    return;
  }
  const r = generateMeta({
    title,
    description: descInput.value,
    keywords: keywordsInput.value,
    canonical: canonicalInput.value,
    robots: robotsSelect.value,
  });
  if (!r.ok) {
    setFieldError(canonicalInput, canonicalError, r.error);
    canonicalInput.focus();
    goStaleIfComputed();
    return;
  }
  lastText = r.html;
  const t = checkTitleLength(title);
  const d = checkDescLength(descInput.value);
  resultCaption.textContent = "meta 标签已生成";
  resultMain.textContent = r.html;
  resultProcess.textContent =
    `标题 ${t.length}/${t.limit} 字 ${t.ok ? "✓" : "⚠ 超限"}` +
    ` · 描述 ${d.length}/${d.limit} 字 ${d.ok ? "✓" : "⚠ 超限"}`;
  setState("computed");
}

function handleReset(): void {
  titleInput.value = "";
  descInput.value = "";
  keywordsInput.value = "";
  canonicalInput.value = "";
  robotsSelect.value = "";
  clearFieldError(titleInput, titleError);
  clearFieldError(descInput, descError);
  clearFieldError(canonicalInput, canonicalError);
  lastText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!titleError.hidden && titleInput.value !== "") {
    clearFieldError(titleInput, titleError);
  }
  if (!descError.hidden && descInput.value !== "") {
    clearFieldError(descInput, descError);
  }
  if (!canonicalError.hidden && canonicalInput.value !== "") {
    clearFieldError(canonicalInput, canonicalError);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
for (const el of [titleInput, descInput, keywordsInput, canonicalInput]) {
  el.addEventListener("input", onFieldInput);
}
robotsSelect.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
