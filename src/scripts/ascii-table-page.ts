// 字符编码查询页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import {
  ASCII_TABLE,
  charToCodes,
  codeToChar,
  type CharCodeInfo,
} from "../lib/calculators/ascii-table";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const modeSelect = requireEl<HTMLSelectElement>("#mode");
const input = requireEl<HTMLTextAreaElement>("#input");
const errorText = requireEl<HTMLParagraphElement>("#field-error-input");
const queryBtn = requireEl<HTMLButtonElement>("#query-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const caption = requireEl<HTMLParagraphElement>("#result-caption");
const tbody = requireEl<HTMLTableSectionElement>("#result-tbody");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn],
});

const PLACEHOLDERS: Record<string, string> = {
  "char-to-code": "输入要查询的字符，如：A中😀",
  "code-to-char": "输入码点，如：65、0x4E2D 或 U+1F600",
};

/** 控制字符/空格在表格中不可见，用可读标签代替 */
function charCell(info: CharCodeInfo): string {
  const cp = info.codePoint;
  if (cp === 32) return "(空格)";
  if (cp < 32 || cp === 127) {
    const entry = ASCII_TABLE.control.find((c) => c.code === cp);
    return entry ? `(${entry.name})` : "(控制字符)";
  }
  return info.char;
}

function buildTable(items: CharCodeInfo[]): void {
  // 清空旧行（createElement 构造，不使用 innerHTML 防 XSS）
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
  for (const it of items) {
    const tr = document.createElement("tr");
    const cells = [
      charCell(it),
      String(it.codePoint),
      it.hex,
      it.unicode,
      it.utf8Bytes,
    ];
    for (const text of cells) {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function buildCopyText(items: CharCodeInfo[]): string {
  const lines = ["字符\t码点(十进制)\t十六进制\tUnicode\tUTF-8字节"];
  for (const it of items) {
    lines.push(
      `${charCell(it)}\t${it.codePoint}\t${it.hex}\t${it.unicode}\t${it.utf8Bytes}`,
    );
  }
  return lines.join("\n");
}

function query(): void {
  clearFieldError(input, errorText);
  const mode = modeSelect.value;
  let items: CharCodeInfo[];
  let captionText: string;

  if (mode === "code-to-char") {
    const r = codeToChar(input.value);
    if (!r.ok) {
      setFieldError(input, errorText, r.error.message);
      input.focus();
      goStaleIfComputed();
      return;
    }
    items = [r.value];
    captionText = `码点 ${r.value.hex}（${r.value.unicode}）对应字符：${charCell(r.value)}`;
  } else {
    if (input.value === "") {
      setFieldError(input, errorText, "请输入要查询的字符");
      input.focus();
      goStaleIfComputed();
      return;
    }
    const r = charToCodes(input.value);
    if (!r.ok) {
      setFieldError(input, errorText, r.error.message);
      input.focus();
      goStaleIfComputed();
      return;
    }
    items = r.value.items;
    captionText = `共 ${r.value.count} 个字符（代理对按 1 个码点计）`;
  }

  buildTable(items);
  caption.textContent = captionText;
  lastCopy = buildCopyText(items);
  setState("computed");
}

function onModeChange(): void {
  input.placeholder =
    PLACEHOLDERS[modeSelect.value] ?? PLACEHOLDERS["char-to-code"];
  goStaleIfComputed();
}

function onEdit(): void {
  if (!errorText.hidden && input.value !== "") {
    clearFieldError(input, errorText);
  }
  goStaleIfComputed();
}

queryBtn.addEventListener("click", query);
resetBtn.addEventListener("click", () => {
  input.value = "";
  clearFieldError(input, errorText);
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
  caption.textContent = "";
  lastCopy = "";
  setState("empty");
});
modeSelect.addEventListener("change", onModeChange);
input.addEventListener("input", onEdit);

bindCopyButton(copyBtn, () => lastCopy);

setState("empty");
