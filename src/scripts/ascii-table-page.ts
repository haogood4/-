// 字符编码查询页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
// ASCII 对照数据外置于 /data/ascii-table.json：查询时 lazy fetch（模块级 Promise
// 缓存），就绪后再渲染表格（控制字符标签需要 control 表）；失败走字段错误提示。
import {
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

/** ASCII 对照表条目（与 /data/ascii-table.json 结构一致） */
interface ControlEntry {
  code: number;
  name: string;
  desc: string;
}

interface AsciiTable {
  control: ControlEntry[];
}

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

const LOAD_FAIL_MSG = "数据加载失败，请刷新页面重试";

// ---------- 懒加载对照表：首次查询时 fetch，之后复用缓存 ----------
let tablePromise: Promise<AsciiTable> | null = null;
let tableCache: AsciiTable | null = null;

function loadTable(): Promise<AsciiTable> {
  if (!tablePromise) {
    tablePromise = fetch("/data/ascii-table.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<AsciiTable>;
      })
      .catch((err: unknown) => {
        tablePromise = null; // 失败后允许下次查询重试
        throw err;
      });
  }
  return tablePromise;
}

/** 控制字符/空格在表格中不可见，用可读标签代替（需对照数据已加载） */
function charCell(info: CharCodeInfo): string {
  const cp = info.codePoint;
  if (cp === 32) return "(空格)";
  if (cp < 32 || cp === 127) {
    const entry = (tableCache?.control ?? []).find((c) => c.code === cp);
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

async function query(): Promise<void> {
  clearFieldError(input, errorText);
  const mode = modeSelect.value;

  // 输入校验不依赖对照数据，先做；数据就绪后再渲染
  let items: CharCodeInfo[];
  if (mode === "code-to-char") {
    const r = codeToChar(input.value);
    if (!r.ok) {
      setFieldError(input, errorText, r.error.message);
      input.focus();
      goStaleIfComputed();
      return;
    }
    items = [r.value];
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
  }

  try {
    tableCache = await loadTable();
  } catch {
    setFieldError(input, errorText, LOAD_FAIL_MSG);
    input.focus();
    goStaleIfComputed();
    return;
  }

  const captionText =
    mode === "code-to-char"
      ? `码点 ${items[0].hex}（${items[0].unicode}）对应字符：${charCell(items[0])}`
      : `共 ${items.length} 个字符（代理对按 1 个码点计）`;

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

queryBtn.addEventListener("click", () => {
  void query();
});
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
