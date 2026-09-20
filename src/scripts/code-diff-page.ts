// 在线代码/文本对比页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import { diffLines, type DiffRow } from "../lib/calculators/code-diff";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const leftInput = requireEl<HTMLTextAreaElement>("#left");
const rightInput = requireEl<HTMLTextAreaElement>("#right");
const errLeft = requireEl<HTMLParagraphElement>("#field-error-left");
const errRight = requireEl<HTMLParagraphElement>("#field-error-right");
const compareBtn = requireEl<HTMLButtonElement>("#compare-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn],
});

/** 与引擎一致的拆分口径（空串=空文件 0 行），仅用于把 TOO_LARGE 提示路由到超限一侧 */
function lineCount(text: string): number {
  return text === "" ? 0 : text.split(/\r?\n/).length;
}

function showEngineError(message: string): void {
  const leftTooBig = lineCount(leftInput.value) > 5000;
  const rightTooBig = lineCount(rightInput.value) > 5000;
  if (rightTooBig && !leftTooBig) {
    setFieldError(rightInput, errRight, message);
  } else {
    setFieldError(leftInput, errLeft, message);
  }
}

/** 逐行结果表：createElement 构建，禁止 innerHTML */
function renderRows(rows: DiffRow[]): void {
  resultMain.replaceChildren();
  for (const row of rows) {
    const line = document.createElement("div");
    line.className = `diff-line diff-${row.type}`;
    const oldNo = document.createElement("span");
    oldNo.className = "diff-no";
    oldNo.textContent = row.oldLine === null ? "" : String(row.oldLine);
    const newNo = document.createElement("span");
    newNo.className = "diff-no";
    newNo.textContent = row.newLine === null ? "" : String(row.newLine);
    const text = document.createElement("span");
    text.className = "diff-text";
    text.textContent = row.text === "" ? " " : row.text;
    line.append(oldNo, newNo, text);
    resultMain.appendChild(line);
  }
}

/** unified 风格差异报告：+ 新增 / - 删除 / 空格 相同 */
function buildReport(rows: DiffRow[]): string {
  return rows
    .map(
      (row) =>
        (row.type === "add" ? "+" : row.type === "del" ? "-" : " ") + row.text,
    )
    .join("\n");
}

function compare(): void {
  clearFieldError(leftInput, errLeft);
  clearFieldError(rightInput, errRight);
  const r = diffLines(leftInput.value, rightInput.value);
  if (!r.ok) {
    showEngineError(r.error.message);
    leftInput.focus();
    goStaleIfComputed();
    return;
  }
  resultCaption.textContent = "对比结果";
  renderRows(r.value.rows);
  resultDetail.textContent = `新增 ${r.value.added} 行 · 删除 ${r.value.deleted} 行 · 相同 ${r.value.unchanged} 行`;
  lastCopy = buildReport(r.value.rows);
  setState("computed");
}

compareBtn.addEventListener("click", compare);

resetBtn.addEventListener("click", () => {
  leftInput.value = "";
  rightInput.value = "";
  clearFieldError(leftInput, errLeft);
  clearFieldError(rightInput, errRight);
  lastCopy = "";
  resultMain.replaceChildren();
  setState("empty");
});

function onEdit(input: HTMLTextAreaElement, err: HTMLParagraphElement): void {
  if (!err.hidden && input.value !== "") clearFieldError(input, err);
  goStaleIfComputed();
}

leftInput.addEventListener("input", () => onEdit(leftInput, errLeft));
rightInput.addEventListener("input", () => onEdit(rightInput, errRight));
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
