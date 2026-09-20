// 标题字数检测页面交互（样板见 _page-kit.ts）
import {
  analyzeTitle,
  type TitleAnalysis,
  type TitleSuggestion,
} from "../lib/calculators/title-length-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const titleInput = requireEl<HTMLTextAreaElement>("#title");
const err_title = requireEl<HTMLParagraphElement>("#field-error-title");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const sugBox = requireEl<HTMLDivElement>("#suggestions");

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

/** 用 createElement 渲染 4 平台建议表格（禁止 innerHTML，杜绝 XSS） */
function renderSuggestions(list: TitleSuggestion[]): void {
  while (sugBox.firstChild) sugBox.removeChild(sugBox.firstChild);
  if (list.length === 0) return;
  const table = document.createElement("table");
  table.className = "sug-table";
  const thead = document.createElement("thead");
  const htr = document.createElement("tr");
  for (const h of ["平台", "建议规则", "状态", "建议"]) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = h;
    htr.appendChild(th);
  }
  thead.appendChild(htr);
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  for (const s of list) {
    const tr = document.createElement("tr");
    const cells: Array<[string, string]> = [
      [s.platform, ""],
      [s.rule, ""],
      [s.status, `sug-status sug-${s.status.toLowerCase()}`],
      [s.advice, ""],
    ];
    for (const [text, cls] of cells) {
      const td = document.createElement("td");
      td.textContent = text;
      if (cls) td.className = cls;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  sugBox.appendChild(table);
}

function buildSummary(title: string, v: TitleAnalysis): string {
  const lines = [
    `标题：${title}`,
    `字符数：${v.chars} · UTF-8 字节数：${v.bytes} · 显示宽度：${v.units}`,
  ];
  for (const s of v.suggestions) {
    lines.push(`${s.platform}（${s.rule}）：${s.status} — ${s.advice}`);
  }
  return lines.join("\n");
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(titleInput, err_title);
  const r = analyzeTitle(titleInput.value);
  if (!r.ok) {
    renderSuggestions([]);
    setFieldError(titleInput, err_title, r.error.message);
    setState("empty");
    return;
  }
  resultCaption.textContent = "标题检测结果";
  resultMain.textContent = `${r.value.chars} 字符 · ${r.value.bytes} UTF-8 字节 · 显示宽度 ${r.value.units}`;
  resultDetail.textContent =
    "字符按 Unicode 码点计；显示宽度按 CJK/全角 2、其余 1 估算。";
  renderSuggestions(r.value.suggestions);
  lastCopy = buildSummary(titleInput.value, r.value);
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  titleInput.value = "";
  renderSuggestions([]);
  clearFieldError(titleInput, err_title);
  setState("empty");
});

titleInput.addEventListener("input", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
