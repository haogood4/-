// Markdown 表格生成引擎 —— 纯函数，无 DOM 依赖，绝不 throw
// 规则：按 \r?\n 分行（纯空白行忽略）；delimiter=auto 时统计各行（引号外）
// tab/逗号/竖线 出现总次数取最多者，并列按 tab > 逗号 > 竖线 优先，全为 0 按竖线处理；
// 逗号切分兼容引号包裹字段（"a,b" 为一列，"" 还原为 "），但不支持引号内换行——
// 含引号内换行的 CSV 请改用 CSV 转 JSON 工具；竖线切分将 \| 视为转义竖线，
// 可幂等重建已有 Markdown 表格；所有单元格去除首尾空白，内容中的竖线输出时转义为 \|；
// hasHeader=false 时生成空表头行；列宽按字符数计（不做显示宽度对齐，中文不影响正确性）。
// 上限：200 行 / 50 列，超限返回错误。

export type MdDelimiter = "auto" | "tab" | "comma" | "pipe";
export type MdAlign = "left" | "center" | "right";

export interface MdTableInput {
  text: string;
  delimiter: MdDelimiter;
  hasHeader: boolean;
  align: MdAlign;
}

export interface MdTableValue {
  /** Markdown 表格文本（行间以 \n 连接，末尾无多余空行） */
  output: string;
  /** 数据行数（不含表头行与对齐行） */
  rows: number;
  /** 列数 */
  cols: number;
  /** auto 检测后实际使用的分隔符 */
  delimiter: Exclude<MdDelimiter, "auto">;
}

export type MdTableErrorCode =
  "INVALID_INPUT" | "EMPTY" | "TOO_LARGE" | "FIELD_COUNT_MISMATCH";

export type MdTableResult =
  | { ok: true; value: MdTableValue }
  | { ok: false; error: { code: MdTableErrorCode; message: string } };

/** 行数上限 */
export const MAX_TABLE_LINES = 200;
/** 列数上限 */
export const MAX_TABLE_COLS = 50;

/** 统计单行中某分隔符出现次数：逗号仅计引号外；竖线跳过 \| 转义 */
function countInLine(line: string, ch: string): number {
  let n = 0;
  if (ch === ",") {
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"')
          i++; // 跳过 "" 转义
        else inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) n++;
    }
    return n;
  }
  if (ch === "|") {
    for (let i = 0; i < line.length; i++) {
      if (line[i] === "|" && line[i - 1] !== "\\") n++;
    }
    return n;
  }
  for (let i = 0; i < line.length; i++) if (line[i] === "\t") n++;
  return n;
}

/** auto 检测：各行（引号外）计数求和取最多者；并列 tab > 逗号 > 竖线；全 0 按竖线 */
function detectDelimiter(lines: string[]): Exclude<MdDelimiter, "auto"> {
  const counts: Record<Exclude<MdDelimiter, "auto">, number> = {
    tab: 0,
    comma: 0,
    pipe: 0,
  };
  for (const line of lines) {
    counts.tab += countInLine(line, "\t");
    counts.comma += countInLine(line, ",");
    counts.pipe += countInLine(line, "|");
  }
  let best: Exclude<MdDelimiter, "auto"> = "pipe";
  let bestCount = 0;
  for (const key of ["tab", "comma", "pipe"] as const) {
    if (counts[key] > bestCount) {
      best = key;
      bestCount = counts[key];
    }
  }
  return best;
}

/** 逗号切分：引号包裹字段内的逗号不分列，"" 还原为 "；字段中部裸引号按字面保留 */
function splitCommaLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += c;
      continue;
    }
    if (c === '"') {
      if (cur === "") inQuotes = true;
      else cur += '"';
      continue;
    }
    if (c === ",") {
      cells.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  cells.push(cur);
  return cells;
}

/** 竖线切分：\| 视为字面竖线；兼容 | a | b | 形式，去除两端空单元格 */
function splitPipeLine(line: string): string[] {
  const raw: string[] = [];
  let cur = "";
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "\\" && line[i + 1] === "|") {
      cur += "|";
      i++;
      continue;
    }
    if (c === "|") {
      raw.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  raw.push(cur);
  const cells = raw.map((c) => c.trim());
  if (cells.length > 1 && cells[0] === "") cells.shift();
  if (cells.length > 1 && cells[cells.length - 1] === "") cells.pop();
  return cells;
}

function splitLine(
  line: string,
  delim: Exclude<MdDelimiter, "auto">,
): string[] {
  if (delim === "tab") return line.split("\t");
  if (delim === "comma") return splitCommaLine(line);
  return splitPipeLine(line);
}

/** 单元格内容转义：竖线 → \| */
function escapeCell(cell: string): string {
  return cell.replace(/\|/g, "\\|");
}

function renderRow(cells: string[]): string {
  return `| ${cells.map(escapeCell).join(" | ")} |`;
}

function alignCell(align: MdAlign): string {
  if (align === "center") return ":---:";
  if (align === "right") return "---:";
  return ":---";
}

/**
 * 分隔文本 → Markdown 表格。各行切分后列数须一致，否则报 FIELD_COUNT_MISMATCH
 * 并含出错行号（1 起，按原始行计）。绝不 throw。
 */
export function toMarkdownTable(input: MdTableInput): MdTableResult {
  const { text, delimiter, hasHeader, align } = input;
  if (typeof text !== "string") {
    return {
      ok: false,
      error: { code: "INVALID_INPUT", message: "输入必须是文本字符串" },
    };
  }

  const rawLines = text === "" ? [] : text.split(/\r?\n/);
  const lines: { no: number; text: string }[] = [];
  rawLines.forEach((l, i) => {
    if (l.trim() !== "") lines.push({ no: i + 1, text: l });
  });
  if (lines.length === 0) {
    return {
      ok: false,
      error: { code: "EMPTY", message: "请先粘贴要转换的表格文本" },
    };
  }
  if (lines.length > MAX_TABLE_LINES) {
    return {
      ok: false,
      error: {
        code: "TOO_LARGE",
        message: `行数超过 ${MAX_TABLE_LINES} 上限，请缩减后再生成`,
      },
    };
  }

  const delim =
    delimiter === "auto"
      ? detectDelimiter(lines.map((l) => l.text))
      : delimiter;
  const grid = lines.map((l) => ({
    no: l.no,
    cells: splitLine(l.text, delim).map((c) => c.trim()),
  }));

  const cols = grid[0].cells.length;
  if (cols > MAX_TABLE_COLS) {
    return {
      ok: false,
      error: {
        code: "TOO_LARGE",
        message: `列数超过 ${MAX_TABLE_COLS} 上限，请删减列后再生成`,
      },
    };
  }
  for (let i = 1; i < grid.length; i++) {
    const n = grid[i].cells.length;
    if (n !== cols) {
      return {
        ok: false,
        error: {
          code: "FIELD_COUNT_MISMATCH",
          message: `第 ${grid[i].no} 行有 ${n} 列，与第 ${grid[0].no} 行的 ${cols} 列不一致`,
        },
      };
    }
  }

  const header = hasHeader ? grid[0].cells : Array<string>(cols).fill("");
  const body = hasHeader ? grid.slice(1) : grid;
  const outLines = [
    renderRow(header),
    renderRow(Array<string>(cols).fill(alignCell(align))),
    ...body.map((r) => renderRow(r.cells)),
  ];

  return {
    ok: true,
    value: {
      output: outLines.join("\n"),
      rows: body.length,
      cols,
      delimiter: delim,
    },
  };
}
