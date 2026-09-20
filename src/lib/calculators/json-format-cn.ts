// JSON 格式化/校验 —— 纯函数，无 DOM 依赖
// pretty：JSON.stringify(obj, null, 2)；minify：JSON.stringify(obj)
// 解析失败时尽量从 SyntaxError.message 提取 "position N" 并换算为行列位置

export type JsonMode = "pretty" | "minify";
export type JsonFormatErrorCode = "EMPTY" | "INVALID";
export type JsonFormatResult =
  | { ok: true; value: { output: string } }
  | {
      ok: false;
      error: { code: JsonFormatErrorCode; message: string };
    };

/**
 * 从 V8 SyntaxError.message 提取位置，换算为「第 X 行第 Y 列附近」后缀。
 * 新版 V8 直接给出 "line X column Y"；旧版/浏览器仅给 "position N"，
 * 此时数 input 前 N 字符的 \n 计算行列。均取不到则原样返回。
 */
function locate(input: string, message: string): string {
  const direct = /line (\d+) column (\d+)/.exec(message);
  if (direct) {
    return `${message}（第 ${Number(direct[1])} 行第 ${Number(direct[2])} 列附近）`;
  }
  const m = /position (\d+)/.exec(message);
  if (!m) return message;
  const pos = Number(m[1]);
  if (!Number.isFinite(pos) || pos < 0 || pos > input.length) return message;
  const before = input.slice(0, pos);
  const line = (before.match(/\n/g) ?? []).length + 1;
  const column = pos - before.lastIndexOf("\n");
  return `${message}（第 ${line} 行第 ${column} 列附近）`;
}

export function formatJson(input: {
  input: string;
  mode: JsonMode;
}): JsonFormatResult {
  const text = input.input;
  if (text.trim() === "") {
    return {
      ok: false,
      error: { code: "EMPTY", message: "请输入 JSON 文本" },
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: { code: "INVALID", message: `JSON 错误：${locate(text, raw)}` },
    };
  }
  const output =
    input.mode === "minify"
      ? JSON.stringify(parsed)
      : JSON.stringify(parsed, null, 2);
  return { ok: true, value: { output } };
}
