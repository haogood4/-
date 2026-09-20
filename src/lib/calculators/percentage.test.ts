import { describe, expect, it } from "vitest";
import { calculatePercentage, formatResult, validateInput } from "./percentage";

describe("calculatePercentage / percent-of", () => {
  it("200 的 15% = 30", () => {
    expect(calculatePercentage("percent-of", "200", "15")).toEqual({
      ok: true,
      value: 30,
    });
    expect(formatResult(30)).toBe("30");
  });

  it("支持小数与负数输入", () => {
    expect(calculatePercentage("percent-of", "-3.5", "10")).toEqual({
      ok: true,
      value: -0.35,
    });
  });
});

describe("calculatePercentage / what-percent", () => {
  it("30 占 200 = 15%", () => {
    expect(calculatePercentage("what-percent", "30", "200")).toEqual({
      ok: true,
      value: 15,
    });
  });

  it("b 为 0 时报错：总数不能为 0", () => {
    expect(calculatePercentage("what-percent", "30", "0")).toEqual({
      ok: false,
      error: { code: "DIVIDE_BY_ZERO", message: "总数不能为 0" },
    });
  });
});

describe("calculatePercentage / change", () => {
  it("100 → 150 = +50%", () => {
    expect(calculatePercentage("change", "100", "150")).toEqual({
      ok: true,
      value: 50,
    });
  });

  it("150 → 100 ≈ -33.333333%，formatResult 输出「约 -33.333333」", () => {
    const result = calculatePercentage("change", "150", "100");
    expect(result).toEqual({ ok: true, value: -33.33333333333333 });
    if (result.ok) {
      expect(formatResult(result.value)).toBe("约 -33.333333");
    }
  });

  it("0 → 100 时报错：此模式要求原值大于 0，不输出 Infinity", () => {
    const result = calculatePercentage("change", "0", "100");
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_BASE", message: "此模式要求原值大于 0" },
    });
    expect(result.ok).toBe(false);
  });

  it("负数原值同样报错", () => {
    expect(calculatePercentage("change", "-5", "100")).toEqual({
      ok: false,
      error: { code: "INVALID_BASE", message: "此模式要求原值大于 0" },
    });
  });
});

describe("validateInput", () => {
  it("空字符串报错：请输入数值", () => {
    expect(validateInput("")).toEqual({
      ok: false,
      error: { code: "EMPTY", message: "请输入数值" },
    });
    expect(validateInput("   ")).toEqual({
      ok: false,
      error: { code: "EMPTY", message: "请输入数值" },
    });
  });

  it("含字母报错", () => {
    expect(validateInput("12ab")).toEqual({
      ok: false,
      error: { code: "INVALID_NUMBER", message: "请输入有效的数字" },
    });
  });

  it("拒绝 NaN / Infinity / 科学计数法字符串", () => {
    expect(validateInput("NaN").ok).toBe(false);
    expect(validateInput("Infinity").ok).toBe(false);
    expect(validateInput("1e5").ok).toBe(false);
  });

  it("绝对值超过 1e12 报错", () => {
    expect(validateInput("1000000000001").ok).toBe(false);
    expect(validateInput("-2000000000000").ok).toBe(false);
    expect(validateInput("1000000000000").ok).toBe(true);
  });

  it("小数位数超过 6 位报错", () => {
    expect(validateInput("0.1234567").ok).toBe(false);
    expect(validateInput("0.123456").ok).toBe(true);
  });

  it("允许前导正负号与小数点", () => {
    expect(validateInput("+7.5")).toEqual({ ok: true, value: 7.5 });
    expect(validateInput(".5")).toEqual({ ok: true, value: 0.5 });
  });
});
