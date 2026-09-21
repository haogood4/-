import { describe, expect, it } from "vitest";
import { convertDensity } from "./density";

const cv = (value: string, from: string, to: string) =>
  convertDensity({ value, from, to });

describe("convertDensity / 典型换算", () => {
  it("1 g/cm³ → kg/m³ = 1000（水密度基准关系）", () => {
    const r = cv("1", "gcm3", "kgm3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000");
  });

  it("1000 kg/m³ → g/cm³ = 1（双向）", () => {
    const r = cv("1000", "kgm3", "gcm3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1");
  });

  it("1 kg/L → kg/m³ = 1000", () => {
    const r = cv("1", "kgl", "kgm3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000");
  });

  it("1 g/mL → kg/L = 1（同值单位互转）", () => {
    const r = cv("1", "gml", "kgl");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1");
  });

  it("1 lb/ft³ → kg/m³ ≈ 16.018463（以「约」标注）", () => {
    const r = cv("1", "lbft3", "kgm3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 16.018463");
  });

  it("1 lb/in³ → kg/m³ ≈ 27679.90471（lb/ft³ × 1728）", () => {
    const r = cv("1", "lbin3", "kgm3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 27679.90471");
  });

  it("1 kg/m³ → lb/ft³ ≈ 0.062428（双向）", () => {
    const r = cv("1", "kgm3", "lbft3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.062428");
  });

  it("小数输入：2.5 g/cm³ → kg/m³ = 2500", () => {
    const r = cv("2.5", "gcm3", "kgm3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("2500");
  });

  it("13.6 g/cm³ → kg/m³ = 13600（水银密度）", () => {
    const r = cv("13.6", "gcm3", "kgm3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("13600");
  });

  it("同单位 1 g/mL → g/mL 恒等", () => {
    const r = cv("1", "gml", "gml");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.converted).toBe(1);
      expect(r.convertedText).toBe("1");
    }
  });
});

describe("convertDensity / 错误处理", () => {
  it("空值：EMPTY 且 message 定位为「请输入数值」", () => {
    const r = cv("", "gcm3", "kgm3");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("EMPTY");
      expect(r.error.message).toBe("请输入数值");
    }
  });

  it("非法字符：INVALID_NUMBER 且 message 定位为「请输入有效的数字」", () => {
    const r = cv("1kg", "gcm3", "kgm3");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("非正数：NON_POSITIVE_VALUE", () => {
    const r = cv("-1", "gcm3", "kgm3");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NON_POSITIVE_VALUE");
  });

  it("超 1e15：OUT_OF_RANGE", () => {
    const r = cv("10000000000000000", "kgm3", "gcm3");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });

  it("未知单位：UNSUPPORTED_UNIT", () => {
    const r = cv("1", "gcm2", "kgm3");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNSUPPORTED_UNIT");
  });
});
