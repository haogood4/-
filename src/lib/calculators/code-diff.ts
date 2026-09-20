// 在线代码/文本对比（diff）—— 纯函数，无 DOM 依赖
// 算法：按行拆分（\r?\n）后做 LCS 动态规划，正向回溯生成逐行差异；
// 替换块中 del 行先于 add 行出现（阅读顺序）。绝不 throw，统一返回判别联合。

export type DiffRowType = "eq" | "add" | "del";

export interface DiffRow {
  type: DiffRowType;
  /** 原文行号（1 起）；add 行为 null */
  oldLine: number | null;
  /** 新文本行号（1 起）；del 行为 null */
  newLine: number | null;
  text: string;
}

export interface DiffValue {
  rows: DiffRow[];
  added: number;
  deleted: number;
  unchanged: number;
}

export type DiffErrorCode = "INVALID_INPUT" | "TOO_LARGE";

export type DiffLinesResult =
  | { ok: true; value: DiffValue }
  | { ok: false; error: { code: DiffErrorCode; message: string } };

/** 单侧行数上限 */
const MAX_LINES = 5000;
/** LCS DP 表单元格数上限（leftLines * rightLines） */
const MAX_CELLS = 1_000_000;

/** 空字符串视为空文件（0 行）；其余按 \r?\n 拆分 */
function splitLines(text: string): string[] {
  return text === "" ? [] : text.split(/\r?\n/);
}

export function diffLines(left: string, right: string): DiffLinesResult {
  if (typeof left !== "string" || typeof right !== "string") {
    return {
      ok: false,
      error: { code: "INVALID_INPUT", message: "对比内容必须为文本字符串" },
    };
  }

  const a = splitLines(left);
  const b = splitLines(right);
  if (
    a.length > MAX_LINES ||
    b.length > MAX_LINES ||
    a.length * b.length > MAX_CELLS
  ) {
    return {
      ok: false,
      error: {
        code: "TOO_LARGE",
        message: "文本过长，请缩减后对比（单侧上限 5000 行）",
      },
    };
  }

  const n = a.length;
  const m = b.length;
  const cols = m + 1;
  // dp[i][j] = a 从 i 起与 b 从 j 起的 LCS 长度（扁平 Int32Array 省内存）
  const dp = new Int32Array((n + 1) * cols);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * cols + j] =
        a[i] === b[j]
          ? dp[(i + 1) * cols + (j + 1)] + 1
          : Math.max(dp[(i + 1) * cols + j], dp[i * cols + (j + 1)]);
    }
  }

  const rows: DiffRow[] = [];
  let added = 0;
  let deleted = 0;
  let unchanged = 0;
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      rows.push({ type: "eq", oldLine: i + 1, newLine: j + 1, text: a[i] });
      unchanged++;
      i++;
      j++;
    } else if (dp[(i + 1) * cols + j] >= dp[i * cols + (j + 1)]) {
      rows.push({ type: "del", oldLine: i + 1, newLine: null, text: a[i] });
      deleted++;
      i++;
    } else {
      rows.push({ type: "add", oldLine: null, newLine: j + 1, text: b[j] });
      added++;
      j++;
    }
  }
  while (i < n) {
    rows.push({ type: "del", oldLine: i + 1, newLine: null, text: a[i] });
    deleted++;
    i++;
  }
  while (j < m) {
    rows.push({ type: "add", oldLine: null, newLine: j + 1, text: b[j] });
    added++;
    j++;
  }

  return { ok: true, value: { rows, added, deleted, unchanged } };
}
