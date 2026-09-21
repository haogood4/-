import { describe, expect, it } from "vitest";
import { convertPower } from "./power";

const cv = (value: string, from: string, to: string) =>
  convertPower({ value, from, to });

describe("convertPower / 典型换算", () => {
  it("1 千瓦 → 瓦特 = 1000", () => {
    const r = cv("1", "kw", "w");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000");
  });

  it("1 公制马力 → 瓦特 = 735.49875（精确定义值）", () => {
    const r = cv("1", "ps", "w");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("735.49875");
  });

  it("1 英制马力 → 瓦特 = 745.699872", () => {
    const r = cv("1", "hp", "w");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("745.699872");
  });

  it("1 千瓦 → 公制马力 ≈ 1.359622（汽车参数场景）", () => {
    const r = cv("1", "kw", "ps");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 1.359622");
  });

  it("100 英制马力 → 千瓦 ≈ 74.569987", () => {
    const r = cv("100", "hp", "kw");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 74.569987");
  });

  it("1 BTU/小时 → 瓦特 ≈ 0.293071", () => {
    const r = cv("1", "btu_per_h", "w");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.293071");
  });

  it("小数输入：0.001 W → 毫瓦 = 1", () => {
    const r = cv("0.001", "w", "mw");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1");
  });

  it("极小值：0.000001 兆瓦 → 瓦特 = 1", () => {
    const r = cv("0.000001", "megawatt", "w");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1");
  });

  it("科学计数写法 1e3 不被接受（需写成 1000）", () => {
    const r = cv("1e3", "kw", "w");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("同单位恒等：2.5 kW → kW = 2.5", () => {
    const r = cv("2.5", "kw", "kw");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(2.5);
  });
});

describe("convertPower / 错误处理", () => {
  it("空值返回 EMPTY 并定位提示文案", () => {
    const r = cv("", "kw", "ps");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("EMPTY");
      expect(r.error.message).toBe("请输入数值");
    }
  });

  it("非法字符 abc 返回 INVALID_NUMBER", () => {
    const r = cv("abc", "kw", "ps");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("未知单位返回 UNSUPPORTED_UNIT", () => {
    const r = cv("1", "ka", "ps");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("UNSUPPORTED_UNIT");
      expect(r.error.message).toBe("不支持的单位");
    }
  });

  it("超 1e15 返回 OUT_OF_RANGE", () => {
    const r = cv("10000000000000000", "w", "kw");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("OUT_OF_RANGE");
      expect(r.error.message).toBe("数值超出范围（不能超过 1e15）");
    }
  });

  it("0 与负数返回 NON_POSITIVE_VALUE", () => {
    const r0 = cv("0", "w", "kw");
    expect(r0.ok).toBe(false);
    if (!r0.ok) {
      expect(r0.error.code).toBe("NON_POSITIVE_VALUE");
      expect(r0.error.message).toBe("数值必须大于 0");
    }
    expect(cv("-1", "w", "kw").ok).toBe(false);
  });

  it("超 6 位小数返回 TOO_MANY_DECIMALS", () => {
    const r = cv("0.1234567", "kw", "w");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("TOO_MANY_DECIMALS");
      expect(r.error.message).toBe("小数位数不能超过 6 位");
    }
  });
});
