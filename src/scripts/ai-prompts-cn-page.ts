// AI 提示词大全页面交互：词库 lazy fetch（模块级 Promise 缓存，失败可重试），
// 分类/关键词过滤走 ai-prompts-cn 引擎，纯文本渲染。
import {
  filterPrompts,
  type PromptItem,
} from "../lib/calculators/ai-prompts-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

let libraryPromise: Promise<PromptItem[] | null> | null = null;

function loadPrompts(): Promise<PromptItem[] | null> {
  if (!libraryPromise) {
    libraryPromise = fetch("/data/ai-prompts.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ prompts: PromptItem[] }>;
      })
      .then((data) => data.prompts)
      .catch(() => {
        libraryPromise = null; // 失败后允许下次重试
        return null;
      });
  }
  return libraryPromise;
}

const form = requireEl<HTMLFormElement>("#calc-form");
const categorySelect = requireEl<HTMLSelectElement>("#prompt-category");
const keywordInput = requireEl<HTMLInputElement>("#prompt-keyword");
const keywordError = requireEl<HTMLParagraphElement>("#field-error-keyword");
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

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearFieldError(keywordInput, keywordError);
  const prompts = await loadPrompts();
  if (!prompts) {
    setFieldError(
      keywordInput,
      keywordError,
      "提示词库加载失败，请检查网络后重试",
    );
    keywordInput.focus();
    goStaleIfComputed();
    return;
  }
  const category = categorySelect.value;
  const keyword = keywordInput.value;
  const list = filterPrompts(prompts, category, keyword);
  if (list.length === 0) {
    setFieldError(
      keywordInput,
      keywordError,
      "没有匹配的提示词，请换个分类或关键词",
    );
    keywordInput.focus();
    goStaleIfComputed();
    return;
  }
  lastText = list
    .map((p) => `【${p.title}】（${p.category}）\n${p.content}`)
    .join("\n\n");
  resultCaption.textContent = `筛选出 ${list.length} 条提示词`;
  resultMain.textContent = lastText;
  const kw = keyword.trim();
  resultProcess.textContent = `分类：${category === "全部" ? "全部" : category}${kw !== "" ? ` · 关键词：${kw}` : ""}`;
  setState("computed");
}

function handleReset(): void {
  categorySelect.value = "全部";
  keywordInput.value = "";
  clearFieldError(keywordInput, keywordError);
  lastText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!keywordError.hidden && keywordInput.value !== "") {
    clearFieldError(keywordInput, keywordError);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", (event) => {
  void handleSubmit(event);
});
resetBtn.addEventListener("click", handleReset);
keywordInput.addEventListener("input", onFieldInput);
categorySelect.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
