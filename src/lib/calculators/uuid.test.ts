import { describe, expect, it } from "vitest";
import {
  formatUuid,
  generateUuids,
  MAX_COUNT,
  MIN_COUNT,
  type UuidFormat,
} from "./uuid";

/** 确定性随机源：全部填充同一字节值 */
const fill =
  (v: number) =>
  (buf: Uint8Array): void => {
    buf.fill(v);
  };

/** 确定性随机源：按 0,1,2,... 递增填充 */
const seq = (buf: Uint8Array): void => {
  for (let i = 0; i < buf.length; i++) buf[i] = i;
};

/** 非密码学随机源：仅用于批量唯一性统计 */
const pseudoRandom = (buf: Uint8Array): void => {
  for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 256);
};

const gen = (
  count: number,
  format: UuidFormat,
  random: (buf: Uint8Array) => void,
) => generateUuids({ count, format, random });

const STD_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("uuid 引擎 — v4 位与标准格式", () => {
  it("全 0 随机源：version/variant 位仍正确置位", () => {
    const r = gen(1, "dash", fill(0x00));
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.value.uuids[0]).toBe("00000000-0000-4000-8000-000000000000");
  });

  it("全 FF 随机源：byte6→4f、byte8→bf", () => {
    const r = gen(1, "dash", fill(0xff));
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.value.uuids[0]).toBe("ffffffff-ffff-4fff-bfff-ffffffffffff");
  });

  it("混合输入：byte6=0xf5 仅保留低 4 位，byte8=0x00 强制 10 前缀", () => {
    const random = (buf: Uint8Array): void => {
      buf.fill(0x00);
      buf[6] = 0xf5;
      buf[8] = 0x00;
    };
    const r = gen(1, "dash", random);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const hex = r.value.uuids[0].replace(/-/g, "");
      expect(hex.slice(12, 14)).toBe("45"); // (0xf5 & 0x0f) | 0x40
      expect(hex.slice(16, 18)).toBe("80"); // (0x00 & 0x3f) | 0x80
    }
  });

  it("递增随机源：标准 8-4-4-4-12 十六进制精确匹配", () => {
    const r = gen(1, "dash", seq);
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.value.uuids[0]).toBe("00010203-0405-4607-8809-0a0b0c0d0e0f");
  });

  it("50 个真随机样本全部匹配标准 v4 正则", () => {
    const r = gen(50, "dash", pseudoRandom);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.uuids).toHaveLength(50);
      for (const u of r.value.uuids) expect(u).toMatch(STD_RE);
    }
  });
});

describe("uuid 引擎 — 四种 format 输出", () => {
  it("dash：36 字符小写带连字符", () => {
    const r = gen(1, "dash", fill(0xab));
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.value.uuids[0]).toBe("abababab-abab-4bab-abab-abababababab");
  });

  it("no-dash：32 位小写十六进制无连字符", () => {
    const r = gen(1, "no-dash", fill(0xab));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.uuids[0]).toBe("abababababab4bababababababababab");
  });

  it("upper：保留连字符并转大写", () => {
    const r = gen(1, "upper", fill(0xab));
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.value.uuids[0]).toBe("ABABABAB-ABAB-4BAB-ABAB-ABABABABABAB");
  });

  it("no-dash-upper：32 位大写十六进制无连字符", () => {
    const r = gen(1, "no-dash-upper", fill(0xab));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.uuids[0]).toBe("ABABABABABAB4BABABABABABABABABAB");
  });

  it("formatUuid 单独导出且对标准输入变换正确", () => {
    const std = "00000000-0000-4000-8000-000000000000";
    expect(formatUuid(std, "dash")).toBe(std);
    expect(formatUuid(std, "no-dash")).toBe("00000000000040008000000000000000");
    expect(formatUuid(std, "upper")).toBe(std.toUpperCase());
    expect(formatUuid(std, "no-dash-upper")).toBe(
      "00000000000040008000000000000000",
    );
  });
});

describe("uuid 引擎 — count 校验", () => {
  it("count=1（下边界）通过", () => {
    const r = gen(1, "dash", fill(0x00));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.count).toBe(1);
  });

  it(`count=${MAX_COUNT}（上边界）通过且输出等量`, () => {
    const r = gen(MAX_COUNT, "dash", pseudoRandom);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.uuids).toHaveLength(MAX_COUNT);
  });

  it("count=0 拒绝 INVALID_COUNT", () => {
    const r = gen(0, "dash", fill(0x00));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_COUNT");
  });

  it(`count=${MAX_COUNT + 1} 拒绝 INVALID_COUNT`, () => {
    const r = gen(MAX_COUNT + 1, "dash", fill(0x00));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_COUNT");
  });

  it("count 非整数（1.5）拒绝", () => {
    const r = gen(1.5, "dash", fill(0x00));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_COUNT");
  });

  it("count 为 NaN / 负数 / Infinity 均拒绝", () => {
    for (const bad of [Number.NaN, -1, Number.POSITIVE_INFINITY]) {
      const r = gen(bad, "dash", fill(0x00));
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_COUNT");
    }
  });

  it("count 边界常量导出正确", () => {
    expect(MIN_COUNT).toBe(1);
    expect(MAX_COUNT).toBe(1000);
  });
});

describe("uuid 引擎 — 随机源与异常处理", () => {
  it("批量唯一性：1000 个样本无重复", () => {
    const r = gen(1000, "dash", pseudoRandom);
    expect(r.ok).toBe(true);
    if (r.ok) expect(new Set(r.value.uuids).size).toBe(1000);
  });

  it("随机源抛异常：返回 RANDOM_FAILED 且不向外 throw（若引擎抛出则本用例失败）", () => {
    const boom = (): void => {
      throw new Error("crypto unavailable");
    };
    const r = gen(5, "dash", boom);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("RANDOM_FAILED");
  });

  it("random 非函数：返回 INVALID_RANDOM", () => {
    const r = generateUuids({
      count: 1,
      format: "dash",
      random: undefined as unknown as (buf: Uint8Array) => void,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_RANDOM");
  });

  it("非法 format：返回 INVALID_FORMAT", () => {
    const r = generateUuids({
      count: 1,
      format: "weird" as unknown as UuidFormat,
      random: fill(0x00),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_FORMAT");
  });
});
