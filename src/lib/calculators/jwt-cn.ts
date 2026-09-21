// JWT 解码引擎 —— 仅解码（不验签）：base64url 手工转 base64 + atob +
// TextDecoder 还原 UTF-8，JSON.parse 解析 header/payload，exp 与当前时间比对。
// 纯函数、无依赖；验签必须服务端完成，页面 FAQ 已注明。
export interface JwtDecodeOk {
  ok: true;
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  /** 原样保留的第三段签名（base64url） */
  signature: string;
  /** payload.exp 是否已过期（无 exp 字段视为未过期） */
  expired: boolean;
  /** 距过期秒数（负数=已过期；无 exp 为 null） */
  expiresIn: number | null;
}

export interface JwtDecodeErr {
  ok: false;
  error: string;
}

export type JwtDecodeResult = JwtDecodeOk | JwtDecodeErr;

function base64UrlToBase64(part: string): string {
  let b64 = part.replaceAll("-", "+").replaceAll("_", "/");
  const pad = b64.length % 4;
  if (pad === 2) b64 += "==";
  else if (pad === 3) b64 += "=";
  else if (pad === 1) return ""; // 非法长度
  return b64;
}

function decodeSegment(part: string): string | null {
  const b64 = base64UrlToBase64(part);
  if (b64 === "") return null;
  try {
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function parseJsonPart(text: string): Record<string, unknown> | null {
  try {
    const obj: unknown = JSON.parse(text);
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      return null;
    }
    return obj as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function decodeJwt(token: string): JwtDecodeResult {
  const trimmed = token.trim();
  if (trimmed === "") {
    return { ok: false, error: "请输入 JWT 令牌" };
  }
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      ok: false,
      error: `JWT 应为 3 段 base64url（header.payload.signature），当前 ${parts.length} 段`,
    };
  }
  const headerText = decodeSegment(parts[0]);
  if (headerText === null) {
    return { ok: false, error: "header 段不是合法的 base64url JSON" };
  }
  const header = parseJsonPart(headerText);
  if (header === null) {
    return { ok: false, error: "header 段解析失败：不是 JSON 对象" };
  }
  const payloadText = decodeSegment(parts[1]);
  if (payloadText === null) {
    return { ok: false, error: "payload 段不是合法的 base64url JSON" };
  }
  const payload = parseJsonPart(payloadText);
  if (payload === null) {
    return { ok: false, error: "payload 段解析失败：不是 JSON 对象" };
  }
  const expRaw = payload.exp;
  let expired = false;
  let expiresIn: number | null = null;
  if (typeof expRaw === "number" && Number.isFinite(expRaw)) {
    const nowSec = Date.now() / 1000;
    expiresIn = Math.floor(expRaw - nowSec);
    expired = nowSec >= expRaw;
  }
  return {
    ok: true,
    header,
    payload,
    signature: parts[2],
    expired,
    expiresIn,
  };
}
