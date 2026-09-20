// 文本处理引擎（大小写/去空行/去空）

export type TextInput = { text: string };
export type TextMode = "upper" | "lower" | "nospace" | "noline" | "trim";

export type TextResult = { ok: true; value: { output: string; chars: number } }
  | { ok: false; error: { code: string; message: string } };

export function transformText(input: TextInput, mode: TextMode): TextResult {
  const t = input.text;
  if (typeof t !== "string") {
    return { ok: false, error: { code: "INVALID_INPUT", message: "输入必须是字符串" } };
  }
  let out: string;
  switch (mode) {
    case "upper":
      out = t.toUpperCase();
      break;
    case "lower":
      out = t.toLowerCase();
      break;
    case "nospace":
      out = t.replace(/\s+/g, "");
      break;
    case "noline":
      out = t.replace(/\r?\n+/g, " ").replace(/\s{2,}/g, " ").trim();
      break;
    case "trim":
      out = t.replace(/^[\s\u3000]+|[\s\u3000]+$/g, "");
      break;
    default:
      return { ok: false, error: { code: "UNKNOWN_MODE", message: "未知转换模式" } };
  }
  return { ok: true, value: { output: out, chars: [...out].length } };
}