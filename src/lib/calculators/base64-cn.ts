// Base64 编码/解码 —— 纯函数，无 DOM 依赖（btoa/atob 在浏览器与 Node 均可用）
// UTF-8 安全：编码走 TextEncoder → 逐字节字符串 → btoa；
// 解码走 atob → Uint8Array → TextDecoder(fatal)，拦截非法 Base64 与非法 UTF-8

export type Base64Mode = "encode" | "decode";
export type Base64ErrorCode = "EMPTY" | "INVALID";
export type Base64Result =
  | { ok: true; value: { output: string } }
  | {
      ok: false;
      error: { code: Base64ErrorCode; message: string };
    };

function fail(message: string): Base64Result {
  return { ok: false, error: { code: "INVALID", message } };
}

export function convertBase64(input: {
  input: string;
  mode: Base64Mode;
}): Base64Result {
  const text = input.input;
  if (text.trim() === "") {
    return {
      ok: false,
      error: { code: "EMPTY", message: "请输入内容" },
    };
  }

  if (input.mode === "encode") {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    try {
      return { ok: true, value: { output: btoa(binary) } };
    } catch {
      return fail("编码失败：内容超出支持范围");
    }
  }

  let binary: string;
  try {
    binary = atob(text);
  } catch {
    return fail("不是合法的 Base64 字符串");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  try {
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { ok: true, value: { output: decoded } };
  } catch {
    return fail("Base64 解码失败：内容不是合法的 UTF-8 文本");
  }
}
