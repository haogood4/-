import { describe, expect, it } from "vitest";
import { convertWeight } from "./weight";

const cv = (value: string, from: string, to: string) =>
  convertWeight({ value, from, to });

describe("convertWeight / 典型换算", () => {
  it("1 kg → g = 1000", () => {
    const r = cv("1", "kg", "g");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.converted).toBe(1000);
      expect(r.convertedText).toBe("1000");
    }
  });

  it("1 t → kg = 1000", () => {
    const r = cv("1", "t", "kg");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(1000);
  });

  it("1 斤 → kg = 0.5", () => {
    const r = cv("1", "jin", "kg");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(0.5);
  });

  it("1 斤 → 两 = 10", () => {
    const r = cv("1", "jin", "liang");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("10");
  });

  it("1 两 → g = 50", () => {
    const r = cv("1", "liang", "g");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("50");
  });

  it("500 g → 斤 = 1", () => {
    const r = cv("500", "g", "jin");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1");
  });

  it("16 oz → lb = 1（磅盎司整倍关系）", () => {
    const r = cv("16", "oz", "lb");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1");
  });

  it("1 kg → 斤 = 2", () => {
    const r = cv("1", "kg", "jin");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("2");
  });

  it("2.5 kg → g = 2500", () => {
    const r = cv("2.5", "kg", "g");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(2500);
  });

  it("1 mg → g = 0.001", () => {
    const r = cv("1", "mg", "g");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("0.001");
  });
});

describe("convertWeight / 小数精度", () => {
  it("1 lb → kg 保留 6 位小数：约 0.453592", () => {
    const r = cv("1", "lb", "kg");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.converted).toBeCloseTo(0.45359237, 10);
      expect(r.convertedText).toBe("约 0.453592");
    }
  });

  it("1 kg → lb = 约 2.204623", () => {
    const r = cv("1", "kg", "lb");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 2.204623");
  });

  it("1 oz → g = 约 28.349523", () => {
    const r = cv("1", "oz", "g");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 28.349523");
  });
});

describe("convertWeight / 同单位", () => {
  it("5 kg → kg = 5（直接返回，不乘除）", () => {
    const r = cv("5", "kg", "kg");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.converted).toBe(5);
      expect(r.processText).toBe("5 千克 = 5 千克");
    }
  });

  it("0.5 t → t = 0.5", () => {
    const r = cv("0.5", "t", "t");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(0.5);
  });
});

describe("convertWeight / 错误处理", () => {
  it("空值拒绝", () => {
    expect(cv("", "kg", "lb").ok).toBe(false);
  });

  it("非法字符拒绝", () => {
    expect(cv("abc", "kg", "lb").ok).toBe(false);
  });

  it("0 拒绝", () => {
    expect(cv("0", "kg", "g").ok).toBe(false);
  });

  it("负数拒绝", () => {
    expect(cv("-1", "kg", "g").ok).toBe(false);
  });

  it("超大值（>1e15）拒绝", () => {
    const r = cv("10000000000000000", "kg", "g");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });

  it("边界值 1e15 允许", () => {
    expect(cv("1000000000000000", "kg", "g").ok).toBe(true);
  });

  it("未知来源单位拒绝", () => {
    expect(cv("1", "xyz", "kg").ok).toBe(false);
  });

  it("未知目标单位拒绝", () => {
    expect(cv("1", "kg", "stone").ok).toBe(false);
  });
});
