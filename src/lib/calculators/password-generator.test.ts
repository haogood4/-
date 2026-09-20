import { describe, expect, it } from "vitest";
import { generatePassword, PASSWORD_RULES } from "./password-generator";

// 构造测试用「可控」随机数组（避免依赖 crypto；测试只需保证确定性）
const makeRandoms = (seed: number, len: number) => {
  const arr = new Uint32Array(len);
  for (let i = 0; i < len; i++) arr[i] = (seed + i * 7) >>> 0;
  return arr;
};

describe("password-generator", () => {
  it("正常：4 类全选 + 长度 16 → 长度正确、仅含 4 池字符", () => {
    const r = generatePassword(
      {
        length: 16,
        includeUpper: true,
        includeLower: true,
        includeDigit: true,
        includeSymbol: true,
      },
      makeRandoms(1, 16),
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.password.length).toBe(16);
      const allowed =
        PASSWORD_RULES.UPPER +
        PASSWORD_RULES.LOWER +
        PASSWORD_RULES.DIGIT +
        PASSWORD_RULES.SYMBOL;
      for (const ch of r.value.password) expect(allowed).toContain(ch);
    }
  });

  it("正常：仅小写 → 全部小写字母（不含 0/O 等易混字符）", () => {
    const r = generatePassword(
      {
        length: 8,
        includeUpper: false,
        includeLower: true,
        includeDigit: false,
        includeSymbol: false,
      },
      makeRandoms(2, 8),
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      for (const ch of r.value.password)
        expect(PASSWORD_RULES.LOWER).toContain(ch);
    }
  });

  it("边界：最小长度 6 → 接受", () => {
    const r = generatePassword(
      {
        length: 6,
        includeUpper: true,
        includeLower: false,
        includeDigit: true,
        includeSymbol: false,
      },
      makeRandoms(3, 6),
    );
    expect(r.ok).toBe(true);
  });

  it("边界：最大长度 64 → 接受", () => {
    const r = generatePassword(
      {
        length: 64,
        includeUpper: true,
        includeLower: true,
        includeDigit: true,
        includeSymbol: false,
      },
      makeRandoms(4, 64),
    );
    expect(r.ok).toBe(true);
  });

  it("非法：长度 < 6 → 拒绝", () => {
    const r = generatePassword(
      {
        length: 5,
        includeUpper: true,
        includeLower: true,
        includeDigit: true,
        includeSymbol: false,
      },
      makeRandoms(5, 5),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_LENGTH");
  });

  it("非法：长度 > 64 → 拒绝", () => {
    const r = generatePassword(
      {
        length: 65,
        includeUpper: true,
        includeLower: false,
        includeDigit: true,
        includeSymbol: false,
      },
      makeRandoms(6, 65),
    );
    expect(r.ok).toBe(false);
  });

  it("非法：4 类全不选 → 拒绝（NO_CHARSET）", () => {
    const r = generatePassword(
      {
        length: 16,
        includeUpper: false,
        includeLower: false,
        includeDigit: false,
        includeSymbol: false,
      },
      makeRandoms(7, 16),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NO_CHARSET");
  });

  it("非法：长度非整数 → 拒绝", () => {
    const r = generatePassword(
      {
        length: 16.5,
        includeUpper: true,
        includeLower: false,
        includeDigit: true,
        includeSymbol: false,
      },
      makeRandoms(8, 16),
    );
    expect(r.ok).toBe(false);
  });

  it("非法：随机源长度不足 → 拒绝", () => {
    const r = generatePassword(
      {
        length: 16,
        includeUpper: true,
        includeLower: false,
        includeDigit: true,
        includeSymbol: false,
      },
      makeRandoms(9, 4),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INSUFFICIENT_RANDOM");
  });

  it("正常：排除易混字符（I/O/0/1/l）→ 永远不出现", () => {
    const r = generatePassword(
      {
        length: 64,
        includeUpper: true,
        includeLower: true,
        includeDigit: true,
        includeSymbol: false,
      },
      makeRandoms(10, 64),
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.password).not.toMatch(/[IO01l]/);
    }
  });

  it("正常：固定种子 → 确定性输出（验证抽样逻辑）", () => {
    const r1 = generatePassword(
      {
        length: 8,
        includeUpper: true,
        includeLower: false,
        includeDigit: true,
        includeSymbol: false,
      },
      makeRandoms(42, 8),
    );
    const r2 = generatePassword(
      {
        length: 8,
        includeUpper: true,
        includeLower: false,
        includeDigit: true,
        includeSymbol: false,
      },
      makeRandoms(42, 8),
    );
    expect(r1.ok && r2.ok).toBe(true);
    if (r1.ok && r2.ok) expect(r1.value.password).toBe(r2.value.password);
  });
});
