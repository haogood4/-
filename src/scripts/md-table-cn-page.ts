// Markdown 表格生成页面交互（样板见 _page-kit.ts）
// 注意：input 变化不触发重算（避免大文本抖动），仅点击「生成表格」触发计算。
import { toMarkdownTable } from "../lib/calculators/md-table-cn";
import type { MdAlign, MdDelimiter } from "../lib/calculators/md-table-cn";
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
const delimiterSelect = requireEl<HTMLSelectElement>("#delimiter");
const hasHeaderBox = requireEl<HTMLInputElement>("#has-header");
const alignSelect = requireEl<HTMLSelectElement>("#align");
const stats = requireEl<HTMLParagraphElement>("#result-stats");
const output = requireEl<HTMLTextAreaElement>("#output");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn],
});

const DELIMITER_MAP: Record<string, MdDelimiter> = {
  auto: "auto",
  tab: "tab",
  comma: "comma",
  pipe: "pipe",
};
const ALIGN_MAP: Record<string, MdAlign> = {
  left: "left",
  center: "center",
  right: "right",
};
const DELIMITER_LABEL: Record<string, string> = {
  tab: "Tab",
  comma: "逗号",
  pipe: "竖线",
};

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(textInput, errText);
  const r = toMarkdownTable({
    text: textInput.value,
    delimiter: DELIMITER_MAP[delimiterSelect.value] ?? "auto",
    hasHeader: hasHeaderBox.checked,
    align: ALIGN_MAP[alignSelect.value] ?? "left",
  });
  if (!r.ok) {
    setFieldError(textInput, errText, r.error.message);
    setState("empty");
    return;
  }
  // 输出走 textarea.value，禁止 innerHTML
  output.value = r.value.output;
  stats.textContent = `共 ${r.value.rows} 行数据 × ${r.value.cols} 列 · 分隔符：${
    DELIMITER_LABEL[r.value.delimiter] ?? r.value.delimiter
  }${hasHeaderBox.checked ? "（首行为表头）" : ""}`;
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  textInput.value = "";
  delimiterSelect.value = "auto";
  hasHeaderBox.checked = true;
  alignSelect.value = "left";
  output.value = "";
  stats.textContent = "";
  clearFieldError(textInput, errText);
  setState("empty");
});

textInput.addEventListener("input", () => {
  if (!errText.hidden && textInput.value.trim() !== "") {
    clearFieldError(textInput, errText);
  }
  goStaleIfComputed();
});
delimiterSelect.addEventListener("change", goStaleIfComputed);
hasHeaderBox.addEventListener("change", goStaleIfComputed);
alignSelect.addEventListener("change", goStaleIfComputed);
bindCopyButton(copyBtn, () => output.value);
setState("empty");
