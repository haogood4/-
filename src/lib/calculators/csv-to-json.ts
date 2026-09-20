// CSV 转 JSON —— 纯函数引擎，RFC 4180 状态机解析，无 DOM 依赖，绝不 throw
// 解析：单字符状态机逐字符扫描，支持引号包裹（内含分隔符/换行）、"" 转义引号、
// CRLF/LF 行尾；分隔符可显式指定或按首行（引号外）出现频次自动检测；
// 校验：各行字段数须与首行一致，不一致时报错并给出行号；字段值一律保留为字符串。

/** 分隔符选项：auto = 取首行引号外出现最多的候选，无候选时为逗号 */
export type CsvDelimiterChoice = "auto" | "," | ";" | "\t";
/** 表头模式为对象数组，无表头模式为二维数组 */
export type CsvRow = Record<string, string> | string[];

export interface CsvToJsonValue {
  rows: CsvRow[];
  /** 数据行数（开启表头时不含表头行） */
  count: number;
  /** 列数（字段数） */
  fields: number;
}

export type CsvToJsonErrorCode = "EMPTY" | "FIELD_COUNT_MISMATCH";

export type CsvToJsonResult =
  | { ok: true; value: CsvToJsonValue }
  | { ok: false; error: { code: CsvToJsonErrorCode; message: string } };

interface ParsedRecord {
  fields: string[];
  /** 记录起始物理行号（1 起，引号内换行也计入） */
  line: number;
}

const CANDIDATE_DELIMITERS = [",", ";", "\t"] as const;

/** 自动检测分隔符：统计首条物理行（引号外）各候选出现次数，取最多者；并列或全 0 用逗号 */
function detectDelimiter(text: string): string {
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0 };
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"')
        i++; // 跳过 "" 转义
      else inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && (ch === "\n" || ch === "\r")) break; // 首行结束
    if (!inQuotes && ch in counts) counts[ch]++;
  }
  let best = ",";
  let bestCount = 0;
  for (const d of CANDIDATE_DELIMITERS) {
    if (counts[d] > bestCount) {
      best = d;
      bestCount = counts[d];
    }
  }
  return best;
}

/** RFC 4180 状态机逐字符解析；纯空白行忽略；未闭合引号宽容处理为普通内容 */
function parseRecords(text: string, delimiter: string): ParsedRecord[] {
  const records: ParsedRecord[] = [];
  let fields: string[] = [];
  let field = "";
  let inQuotes = false;
  let skipNextLF = false; // CRLF 的 LF 不重复计行
  let line = 1;
  let recordLine = 1;

  const endRecord = (): void => {
    fields.push(field);
    if (!(fields.length === 1 && fields[0] === "")) {
      records.push({ fields, line: recordLine });
    }
    fields = [];
    field = "";
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (skipNextLF) {
      skipNextLF = false;
      if (ch === "\n") continue;
    }
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        if (ch === "\n") line++;
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      if (field === "") inQuotes = true;
      else field += '"'; // 字段中部的裸引号：按字面保留
      continue;
    }
    if (ch === delimiter) {
      fields.push(field);
      field = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r") skipNextLF = true;
      endRecord();
      line++;
      recordLine = line;
      continue;
    }
    field += ch;
  }
  if (inQuotes || field !== "" || fields.length > 0) endRecord();
  return records;
}

/**
 * CSV → 行数据。hasHeader=true（默认）首行作表头转对象数组；
 * false 输出二维数组。字段数与首行不一致时报错并含行号。绝不 throw。
 */
export function csvToJson(input: {
  csv: string;
  delimiter?: CsvDelimiterChoice;
  hasHeader?: boolean;
}): CsvToJsonResult {
  const text = input.csv;
  if (text.trim() === "") {
    return { ok: false, error: { code: "EMPTY", message: "请输入 CSV 文本" } };
  }
  const choice = input.delimiter ?? "auto";
  const delimiter = choice === "auto" ? detectDelimiter(text) : choice;
  const records = parseRecords(text, delimiter);
  if (records.length === 0) {
    return { ok: false, error: { code: "EMPTY", message: "请输入 CSV 文本" } };
  }

  const expected = records[0].fields.length;
  for (let i = 1; i < records.length; i++) {
    const rec = records[i];
    if (rec.fields.length !== expected) {
      return {
        ok: false,
        error: {
          code: "FIELD_COUNT_MISMATCH",
          message: `第 ${rec.line} 行有 ${rec.fields.length} 个字段，与第 1 行的 ${expected} 个不一致`,
        },
      };
    }
  }

  const hasHeader = input.hasHeader ?? true;
  let rows: CsvRow[];
  if (hasHeader) {
    const header = records[0].fields;
    rows = records.slice(1).map((rec) => {
      const obj: Record<string, string> = {};
      header.forEach((key, idx) => {
        obj[key] = rec.fields[idx] ?? "";
      });
      return obj;
    });
  } else {
    rows = records.map((rec) => rec.fields);
  }
  return { ok: true, value: { rows, count: rows.length, fields: expected } };
}

/** 序列化为 JSON 文本；indent 为缩进空格数，0 表示压缩（无多余空白） */
export function toPrettyJson(rows: CsvRow[], indent: number): string {
  const safe = Number.isFinite(indent) ? Math.max(0, Math.floor(indent)) : 2;
  return JSON.stringify(rows, null, safe);
}
