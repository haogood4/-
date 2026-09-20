// 关键字密度分析页面交互（样板见 _page-kit.ts）
// 注意：input 变化不会触发重算（避免大文本抖动），仅点击「分析」触发计算。
import { analyzeDensity } from "../lib/calculators/keyword-density-cn";
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
const topNInput = requireEl<HTMLInputElement>("#top-n");
const minLenInput = requireEl<HTMLInputElement>("#min-len");
const useStopInput = requireEl<HTMLInputElement>("#use-stopwords");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const densityTbody = requireEl<HTMLTableSectionElement>("#density-tbody");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

function clampInt(
  value: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function buildTable(
  items: { word: string; count: number; density: number }[],
): void {
  // 清空旧行（createElement 构造，不使用 innerHTML 防 XSS）
  while (densityTbody.firstChild)
    densityTbody.removeChild(densityTbody.firstChild);
  // 找出最大 count 用于进度条归一化
  const maxCount = items.reduce((m, x) => (x.count > m ? x.count : m), 0);
  for (const it of items) {
    const tr = document.createElement("tr");

    const tdWord = document.createElement("td");
    tdWord.textContent = it.word;
    tr.appendChild(tdWord);

    const tdCount = document.createElement("td");
    tdCount.textContent = String(it.count);
    tr.appendChild(tdCount);

    const tdDensity = document.createElement("td");
    tdDensity.textContent = `${it.density.toFixed(2)}%`;
    tr.appendChild(tdDensity);

    const tdBar = document.createElement("td");
    tdBar.className = "density-bar-cell";
    const barOuter = document.createElement("div");
    barOuter.className = "density-bar";
    barOuter.setAttribute("role", "progressbar");
    barOuter.setAttribute("aria-valuemin", "0");
    barOuter.setAttribute("aria-valuemax", "100");
    barOuter.setAttribute("aria-valuenow", String(Math.round(it.density)));
    barOuter.setAttribute(
      "aria-label",
      `${it.word} 密度 ${it.density.toFixed(2)}%`,
    );
    const barInner = document.createElement("div");
    barInner.className = "density-bar-inner";
    const widthPct =
      maxCount > 0 ? Math.max(2, Math.round((it.count / maxCount) * 100)) : 0;
    barInner.style.width = `${widthPct}%`;
    barOuter.appendChild(barInner);
    tdBar.appendChild(barOuter);
    tr.appendChild(tdBar);

    densityTbody.appendChild(tr);
  }
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(textInput, errText);
  const text = textInput.value;
  if (!text.trim()) {
    setFieldError(textInput, errText, "请输入要分析的文本");
    setState("empty");
    return;
  }
  // 顶部选项同步读取 UI 值（避免大文本每次 input 触发抖动）
  const topN = clampInt(topNInput.value, 10, 1, 20);
  const minLen = clampInt(minLenInput.value, 2, 1, 4);
  const useStopwords = useStopInput.checked;
  const opts: { topN: number; minLen: number; stopwords?: string[] } = {
    topN,
    minLen,
  };
  if (!useStopwords) opts.stopwords = [];

  const r = analyzeDensity(text, opts);
  resultCaption.textContent = "关键字密度分析结果";
  resultMain.textContent = `${r.total} 词次 · ${r.unique} 不重复词 · ${r.totalChars} 字符`;
  resultDetail.textContent = `TOP ${r.items.length}（TOP N=${topN}, 最低词长=${minLen}, 停用词${useStopwords ? "开" : "关"}）`;
  buildTable(r.items);
  // 复制格式：表格行 → TSV 文本
  const lines: string[] = ["词\t次数\t密度%"];
  for (const it of r.items)
    lines.push(`${it.word}\t${it.count}\t${it.density.toFixed(2)}`);
  lastCopy = lines.join("\n");
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  textInput.value = "";
  topNInput.value = "10";
  minLenInput.value = "2";
  useStopInput.checked = true;
  clearFieldError(textInput, errText);
  while (densityTbody.firstChild)
    densityTbody.removeChild(densityTbody.firstChild);
  setState("empty");
});

textInput.addEventListener("input", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
