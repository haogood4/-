import { describe, expect, it } from "vitest";
import { decodeJwt } from "./jwt-cn";

function b64url(obj: unknown): string {
  // 真实 JWT payload 是 UTF-8 字节的 base64url：先转字节再 btoa（兼容中文）
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function makeJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
): string {
  return `${b64url(header)}.${b64url(payload)}.sig_nature-x`;
}

describe("decodeJwt / 正常解码", () => {
  it("三段结构解出 header/payload/signature", () => {
    const r = decodeJwt(
      makeJwt({ alg: "HS256", typ: "JWT" }, { sub: "u1", role: "admin" }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.header).toEqual({ alg: "HS256", typ: "JWT" });
      expect(r.payload).toEqual({ sub: "u1", role: "admin" });
      expect(r.signature).toBe("sig_nature-x");
      expect(r.expired).toBe(false);
    }
  });

  it("无 exp 字段视为未过期且 expiresIn 为 null", () => {
    const r = decodeJwt(makeJwt({ alg: "none" }, { sub: "u2" }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.expired).toBe(false);
      expect(r.expiresIn).toBeNull();
    }
  });

  it("exp 在未来 → 未过期且 expiresIn > 0", () => {
    const r = decodeJwt(
      makeJwt({ alg: "HS256" }, { exp: Math.floor(Date.now() / 1000) + 3600 }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.expired).toBe(false);
      expect(r.expiresIn).toBeGreaterThan(3500);
    }
  });

  it("exp 在过去 → 已过期且 expiresIn 为负", () => {
    const r = decodeJwt(
      makeJwt({ alg: "HS256" }, { exp: Math.floor(Date.now() / 1000) - 60 }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.expired).toBe(true);
      expect(r.expiresIn).toBeLessThan(0);
    }
  });

  it("payload 含中文（UTF-8 多字节）正确还原", () => {
    const r = decodeJwt(makeJwt({ alg: "HS256" }, { name: "张三" }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.payload.name).toBe("张三");
  });
});

describe("decodeJwt / 非法输入", () => {
  it("空令牌", () => {
    const r = decodeJwt("   ");
    expect(r.ok).toBe(false);
  });

  it("段数不为 3", () => {
    const r = decodeJwt("aaa.bbb");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("3 段");
  });

  it("payload 段非 base64", () => {
    const r = decodeJwt(`eyJhbGciOiJIUzI1NiJ9.@@invalid@@.sig`);
    expect(r.ok).toBe(false);
  });

  it("payload 段非 JSON", () => {
    const bad = btoa("not json").replaceAll("+", "-").replaceAll("/", "_");
    const r = decodeJwt(`eyJhbGciOiJIUzI1NiJ9.${bad}.sig`);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("payload");
  });

  it("payload 是 JSON 数组（非对象）被拒绝", () => {
    const bad = btoa("[1,2]").replaceAll("+", "-").replaceAll("/", "_");
    const r = decodeJwt(`eyJhbGciOiJIUzI1NiJ9.${bad}.sig`);
    expect(r.ok).toBe(false);
  });
});
