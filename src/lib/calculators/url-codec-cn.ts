// URL 编码/解码 —— 纯函数，无 DOM 依赖
// encode：encodeURIComponent；decode：decodeURIComponent（非法序列报 INVALID）

export type UrlMode = "encode" | "decode";
export type UrlErrorCode = "EMPTY" | "INVALID";
export type UrlResult =
  | { ok: true; value: { output: string } }
  | {
      ok: false;
      error: { code: UrlErrorCode; message: string };
    };

export function convertUrl(input: { input: string; mode: UrlMode }): UrlResult {
  const text = input.input;
  if (text.trim() === "") {
    return {
      ok: false,
      error: { code: "EMPTY", message: "请输入内容" },
    };
  }

  if (input.mode === "encode") {
    return { ok: true, value: { output: encodeURIComponent(text) } };
  }

  try {
    return { ok: true, value: { output: decodeURIComponent(text) } };
  } catch {
    return {
      ok: false,
      error: {
        code: "INVALID",
        message: "不是合法的 URL 编码序列（如 %E4%AD 截断）",
      },
    };
  }
}
