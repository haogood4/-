// HTTP 状态码查询页面交互：状态码表 lazy fetch（模块级 Promise 缓存），
// 分类过滤 + 关键词搜索组合；结果以多行文本呈现在结果区。
import {
  filterByCategory,
  searchStatus,
  type HttpStatusCategory,
  type HttpStatusEntry,
} from "../lib/calculators/http-status-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const LOAD_FAIL_MSG = "状态码数据加载失败，请刷新页面重试";

let codesPromise: Promise<HttpStatusEntry[]> | null = null;

function loadCodes(): Promise<HttpStatusEntry[]> {
  if (!codesPromise) {
    codesPromise = fetch("/data/http-status-codes.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<HttpStatusEntry[]>;
      })
      .catch((err: unknown) => {
        codesPromise = null; // 失败后允许下次提交重试
        throw err;
      });
  }
  return codesPromise;
}

const form = requireEl<HTMLFormElement>("#calc-form");
const searchInput = requireEl<HTMLInputElement>("#status-search");
const catSelect = requireEl<HTMLSelectElement>("#status-category");
const errorText = requireEl<HTMLParagraphElement>("#field-error-search");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

let lastText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearFieldError(searchInput, errorText);
  let codes: HttpStatusEntry[];
  try {
    codes = await loadCodes();
  } catch {
    setFieldError(searchInput, errorText, LOAD_FAIL_MSG);
    goStaleIfComputed();
    return;
  }
  const cat = catSelect.value as HttpStatusCategory | "全部";
  const filtered = searchStatus(
    filterByCategory(codes, cat),
    searchInput.value,
  );
  if (filtered.length === 0) {
    setFieldError(searchInput, errorText, "没有匹配的状态码，试试其他关键词");
    goStaleIfComputed();
    return;
  }
  lastText = filtered
    .map((c) => `${c.code} ${c.name} — ${c.desc}（${c.category}）`)
    .join("\n");
  resultCaption.textContent = "查询结果";
  resultMain.textContent = lastText;
  resultProcess.textContent = `共 ${filtered.length} 条 · 分类「${cat}」`;
  setState("computed");
}

function handleReset(): void {
  searchInput.value = "";
  catSelect.value = "全部";
  clearFieldError(searchInput, errorText);
  lastText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorText.hidden && searchInput.value.trim() !== "") {
    clearFieldError(searchInput, errorText);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", (event) => {
  void handleSubmit(event);
});
resetBtn.addEventListener("click", handleReset);
searchInput.addEventListener("input", onFieldInput);
catSelect.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
