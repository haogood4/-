import { describe, expect, it } from "vitest";
import { convertPressure } from "./pressure";

const cv = (value: string, from: string, to: string) =>
  convertPressure({ value, from, to });

describe("convertPressure / 典型换算", () => {
  it("1 兆帕 → 巴 = 10（默认场景）", () => {
    const r = cv("1", "mpa", "bar");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("10");
  });

  it("2.5 兆帕 → 巴 = 25（胎压/液压场景）", () => {
    const r = cv("2.5", "mpa", "bar");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("25");
  });

  it("1 巴 → 千帕 = 100", () => {
    const r = cv("1", "bar", "kpa");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("100");
  });

  it("1 标准大气压 → 千帕 = 101.325（国际协议精确值 101325 Pa）", () => {
    const r = cv("1", "atm", "kpa");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("101.325");
  });

  it("1 标准大气压 → 巴 = 1.01325", () => {
    const r = cv("1", "atm", "bar");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1.01325");
  });

  it("1 千克力/平方厘米 → 千帕 = 98.0665（工程大气压）", () => {
    const r = cv("1", "kgf_cm2", "kpa");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("98.0665");
  });

  it("1 psi → 千帕 ≈ 6.894757", () => {
    const r = cv("1", "psi", "kpa");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 6.894757");
  });

  it("1 巴 → psi ≈ 14.503774（双向对照）", () => {
    const r = cv("1", "bar", "psi");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 14.503774");
  });

  it("1 毫米汞柱 → 千帕 ≈ 0.133322", () => {
    const r = cv("1", "mmhg", "kpa");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.133322");
  });

  it("小数输入：2.4 兆帕 → psi ≈ 348.090571", () => {
    const r = cv("2.4", "mpa", "psi");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 348.090571");
  });

  it("科学计数写法 1e3 不被接受（需写成 1000）", () => {
    const r = cv("1e3", "mpa", "bar");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("同单位恒等：1.2 bar → bar = 1.2", () => {
    const r = cv("1.2", "bar", "bar");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(1.2);
  });
});

describe("convertPressure / 错误处理", () => {
  it("空值返回 EMPTY 并定位提示文案", () => {
    const r = cv("", "mpa", "bar");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("EMPTY");
      expect(r.error.message).toBe("请输入数值");
    }
  });

  it("非法字符 abc 返回 INVALID_NUMBER", () => {
    const r = cv("abc", "mpa", "bar");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("未知单位返回 UNSUPPORTED_UNIT", () => {
    const r = cv("1", "mpa", "torr");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("UNSUPPORTED_UNIT");
      expect(r.error.message).toBe("不支持的单位");
    }
  });

  it("超 1e15 返回 OUT_OF_RANGE", () => {
    const r = cv("10000000000000000", "kpa", "mpa");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("OUT_OF_RANGE");
      expect(r.error.message).toBe("数值超出范围（不能超过 1e15）");
    }
  });

  it("0 与负数返回 NON_POSITIVE_VALUE", () => {
    const r0 = cv("0", "mpa", "bar");
    expect(r0.ok).toBe(false);
    if (!r0.ok) {
      expect(r0.error.code).toBe("NON_POSITIVE_VALUE");
      expect(r0.error.message).toBe("数值必须大于 0");
    }
    expect(cv("-1", "mpa", "bar").ok).toBe(false);
  });

  it("超 6 位小数返回 TOO_MANY_DECIMALS", () => {
    const r = cv("0.1234567", "mpa", "bar");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("TOO_MANY_DECIMALS");
      expect(r.error.message).toBe("小数位数不能超过 6 位");
    }
  });
});
