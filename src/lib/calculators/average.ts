// 平均数计算器 —— 纯函数，无 DOM 依赖
// 多行/逗号/空格/分号分隔的数字列表；输出 sum / mean / count

import { NUMBER_RE } from "./_shared";

export type AverageErrorCode = "EMPTY" | "INVALID_NUMBER" | "TOO_MANY_ITEMS";

export type AverageResult =
  | {
      ok: true;
      sum: number;
      mean: number;
      count: number;
      sumText: string;
      meanText: string;
    }
  | { ok: false; error: { code: AverageErrorCode; message: string } };

const MAX_ITEMS = 100;
const SEPARATOR_RE = /[\s,;]+/;

function formatAverage(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  let text = value.toFixed(6);
  if (text.includes(".")) {
    text = text.replace(/0+$/, "").replace(/\.$/, "");
  }
  if (text === "-0") text = "0";
  const rounded = Number(text) !== value;
  return (rounded ? "约 " : "") + text;
}

export function calculateAverage(raw: string): AverageResult {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return {
      ok: false,
      error: { code: "EMPTY", message: "请输入至少一个数字" },
    };
  }

  const parts = trimmed.split(SEPARATOR_RE).filter((p) => p !== "");
  if (parts.length === 0) {
    return {
      ok: false,
      error: { code: "EMPTY", message: "请输入至少一个数字" },
    };
  }
  if (parts.length > MAX_ITEMS) {
    return {
      ok: false,
      error: {
        code: "TOO_MANY_ITEMS",
        message: `最多支持 ${MAX_ITEMS} 个数字`,
      },
    };
  }

  for (const p of parts) {
    if (!NUMBER_RE.test(p)) {
      return {
        ok: false,
        error: { code: "INVALID_NUMBER", message: "请输入有效的数字" },
      };
    }
  }

  const values = parts.map((p) => Number(p));
  const sum = values.reduce((acc, n) => acc + n, 0);
  const mean = sum / values.length;

  return {
    ok: true,
    sum,
    mean,
    count: values.length,
    sumText: formatAverage(sum),
    meanText: formatAverage(mean),
  };
}
