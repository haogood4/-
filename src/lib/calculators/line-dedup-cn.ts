// 文本行去重引擎 —— 纯函数，无 DOM 依赖
// 规则：按 \r?\n 分行、保留首次出现顺序；trim 先去空白再比较与输出；
// ignoreCase 用小写归一比较但输出保留原文；removeEmpty 去除空/纯空白行。
// 上限：输入 UTF-8 字节 ≤ 2MB、行数 ≤ 50000，超限返回错误。绝不 throw。

export interface DedupInput {
  text: string;
  /** 比较与输出前去除每行首尾空白 */
  trim: boolean;
  /** 忽略大小写（仅影响比较，输出保留原文大小写） */
  ignoreCase: boolean;
  /** 删除空行与纯空白行 */
  removeEmpty: boolean;
}

export interface DedupValue {
  /** 去重后文本（行间以 \n 连接） */
  output: string;
  /** 输入总行数 */
  total: number;
  /** 保留行数 */
  kept: number;
  /** 去除行数（重复行 + 被删除的空行），恒等于 total - kept */
  removed: number;
  /** 被去除行的原文列表（按输入顺序） */
  removedLines: string[];
}

export type DedupErrorCode = "INVALID_INPUT" | "TOO_LARGE";

export type DedupResult =
  | { ok: true; value: DedupValue }
  | { ok: false; error: { code: DedupErrorCode; message: string } };

/** 输入大小上限：2 MB（按 UTF-8 字节计） */
export const MAX_INPUT_BYTES = 2 * 1024 * 1024;
/** 行数上限 */
export const MAX_LINES = 50000;

/** 空字符串视为空文本（0 行）；其余按 \r?\n 拆分 */
function splitLines(text: string): string[] {
  return text === "" ? [] : text.split(/\r?\n/);
}

export function dedupLines(input: DedupInput): DedupResult {
  const { text, trim, ignoreCase, removeEmpty } = input;
  if (typeof text !== "string") {
    return {
      ok: false,
      error: { code: "INVALID_INPUT", message: "输入必须是文本字符串" },
    };
  }
  if (new TextEncoder().encode(text).length > MAX_INPUT_BYTES) {
    return {
      ok: false,
      error: {
        code: "TOO_LARGE",
        message: "文本超过 2MB 上限，请缩减后再去重",
      },
    };
  }

  const lines = splitLines(text);
  if (lines.length > MAX_LINES) {
    return {
      ok: false,
      error: {
        code: "TOO_LARGE",
        message: `行数超过 ${MAX_LINES} 上限，请缩减后再去重`,
      },
    };
  }

  const seen = new Set<string>();
  const keptLines: string[] = [];
  const removedLines: string[] = [];

  for (const line of lines) {
    const base = trim ? line.trim() : line;
    if (removeEmpty && base.trim() === "") {
      removedLines.push(line);
      continue;
    }
    const key = ignoreCase ? base.toLowerCase() : base;
    if (seen.has(key)) {
      removedLines.push(line);
      continue;
    }
    seen.add(key);
    keptLines.push(base);
  }

  return {
    ok: true,
    value: {
      output: keptLines.join("\n"),
      total: lines.length,
      kept: keptLines.length,
      removed: removedLines.length,
      removedLines,
    },
  };
}
