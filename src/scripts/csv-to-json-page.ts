// CSV 转 JSON 页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import {
  csvToJson,
  toPrettyJson,
  type CsvDelimiterChoice,
} from "../lib/calculators/csv-to-json";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const csvInput = requireEl<HTMLTextAreaElement>("#csv");
const errorText = requireEl<HTMLParagraphElement>("#field-error-csv");
const delimiterSelect = requireEl<HTMLSelectElement>("#delimiter");
const indentSelect = requireEl<HTMLSelectElement>("#indent");
const hasHeaderBox = requireEl<HTMLInputElement>("#has-header");
const convertBtn = requireEl<HTMLButtonElement>("#convert-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const output = requireEl<HTMLTextAreaElement>("#output");
const stats = requireEl<HTMLParagraphElement>("#result-stats");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn],
});

const DELIMITER_MAP: Record<string, CsvDelimiterChoice> = {
  auto: "auto",
  comma: ",",
  semicolon: ";",
  tab: "\t",
};

function convert(): void {
  clearFieldError(csvInput, errorText);
  const r = csvToJson({
    csv: csvInput.value,
    delimiter: DELIMITER_MAP[delimiterSelect.value] ?? "auto",
    hasHeader: hasHeaderBox.checked,
  });
  if (!r.ok) {
    setFieldError(csvInput, errorText, r.error.message);
    csvInput.focus();
    goStaleIfComputed();
    return;
  }
  const indent = Number(indentSelect.value);
  // 输出走 textarea.value，禁止 innerHTML
  output.value = toPrettyJson(
    r.value.rows,
    Number.isFinite(indent) ? indent : 2,
  );
  stats.textContent = `共 ${r.value.count} 行数据 × ${r.value.fields} 个字段（字段值均为字符串）`;
  lastCopy = output.value;
  setState("computed");
}

function onEdit(): void {
  if (!errorText.hidden && csvInput.value.trim() !== "") {
    clearFieldError(csvInput, errorText);
  }
  goStaleIfComputed();
}

convertBtn.addEventListener("click", convert);

resetBtn.addEventListener("click", () => {
  csvInput.value = "";
  clearFieldError(csvInput, errorText);
  output.value = "";
  stats.textContent = "";
  lastCopy = "";
  setState("empty");
});

csvInput.addEventListener("input", onEdit);
delimiterSelect.addEventListener("change", goStaleIfComputed);
indentSelect.addEventListener("change", goStaleIfComputed);
hasHeaderBox.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopy);

setState("empty");
