// 敏感词检测工具页面交互（样板见 _page-kit.ts）
import {
  CATEGORY_META,
  detectSensitive,
  SENSITIVE_WORDS,
  summarizeHits,
  type SensitiveCategory,
  type SensitiveHit,
} from "../lib/calculators/sensitive-word-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const textInput = requireEl<HTMLTextAreaElement>("#text");
const errText = requireEl<HTMLParagraphElement>("#field-error-text");
const catCheckboxes = Array.from(
  document.querySelectorAll<HTMLInputElement>("input[data-cat]"),
);
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const catList = requireEl<HTMLUListElement>("#result-categories");
const hitList = requireEl<HTMLOListElement>("#result-hits");
const maskedEl = requireEl<HTMLPreElement>("#result-masked");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

let lastMasked = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

function getSelectedCategories(): SensitiveCategory[] {
  return catCheckboxes
    .filter((el) => el.checked)
    .map((el) => el.dataset.cat as SensitiveCategory);
}

function renderCategoryStats(stats: Record<SensitiveCategory, number>): void {
  catList.innerHTML = "";
  const order: SensitiveCategory[] = ["politics", "violence", "porn", "ad"];
  for (const cat of order) {
    const meta = CATEGORY_META[cat];
    const libTotal = SENSITIVE_WORDS[cat].length;
    const li = document.createElement("li");
    li.className = `cat-item cat-${meta.tone}`;
    const left = document.createElement("span");
    left.textContent = meta.label;
    const right = document.createElement("span");
    right.textContent = `${stats[cat]} 处 / 词库 ${libTotal} 条`;
    li.append(left, right);
    catList.appendChild(li);
  }
}

function renderHits(hits: SensitiveHit[]): void {
  hitList.innerHTML = "";
  if (hits.length === 0) {
    const li = document.createElement("li");
    li.className = "hit-empty";
    li.textContent = "（无命中）";
    hitList.appendChild(li);
    return;
  }
  for (const h of hits) {
    const meta = CATEGORY_META[h.category];
    const li = document.createElement("li");
    li.className = `hit-item hit-${meta.tone}`;
    const head = document.createElement("div");
    head.className = "hit-head";
    const catTag = document.createElement("span");
    catTag.className = `hit-tag hit-tag-${meta.tone}`;
    catTag.textContent = meta.label;
    const labelTag = document.createElement("strong");
    labelTag.textContent = h.label;
    const countTag = document.createElement("span");
    countTag.className = "hit-count";
    countTag.textContent = `× ${h.positions.length}`;
    head.append(catTag, labelTag, countTag);
    const suggest = document.createElement("p");
    suggest.className = "hit-suggest";
    suggest.textContent = `建议：${h.suggest}`;
    const pos = document.createElement("p");
    pos.className = "hit-pos";
    pos.textContent = `位置：${h.positions
      .map(([s, e]) => `${s}-${e}`)
      .join("、")}`;
    li.append(head, suggest, pos);
    hitList.appendChild(li);
  }
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(textInput, errText);
  const cats = getSelectedCategories();
  if (cats.length === 0) {
    setFieldError(textInput, errText, "请至少选择一个检测分类");
    setState("empty");
    return;
  }
  const r = detectSensitive({ text: textInput.value, categories: cats });
  if (!r.ok) {
    setFieldError(textInput, errText, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  resultCaption.textContent = "敏感词检测结果";
  resultMain.textContent = summarizeHits(v);
  resultMain.classList.toggle("result-pass", v.totalHits === 0);
  resultDetail.textContent = `共检测 ${v.totalHits} 处 · 耗时 ${v.elapsedMs}ms`;
  renderCategoryStats(v.categoryStats);
  renderHits(v.hits);
  maskedEl.textContent = v.masked || "（空）";
  lastMasked = v.masked;
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  textInput.value = "";
  catCheckboxes.forEach((el) => {
    el.checked = true;
  });
  clearFieldError(textInput, errText);
  setState("empty");
});

textInput.addEventListener("input", goStaleIfComputed);
catCheckboxes.forEach((el) => el.addEventListener("change", goStaleIfComputed));

bindCopyButton(copyBtn, () => lastMasked);
setState("empty");
