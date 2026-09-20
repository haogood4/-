import { describe, expect, it } from "vitest";
import { compareUnitPrice } from "./unit-price";

describe("compareUnitPrice / 典型场景", () => {
  it("25/500 vs 45/1000 → unitA=0.05, unitB=0.045, b 更划算", () => {
    expect(compareUnitPrice("25", "500", "45", "1000")).toEqual({
      ok: true,
      unitA: 0.05,
      unitB: 0.045,
      better: "b",
      unitAText: "0.05",
      unitBText: "0.045",
      processText: "25 ÷ 500 = 0.05；45 ÷ 1000 = 0.045",
    });
  });
});

describe("compareUnitPrice / 相等情形", () => {
  it("10/2 vs 20/4 → unitA=5, unitB=5, equal", () => {
    const r = compareUnitPrice("10", "2", "20", "4");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.unitA).toBe(5);
      expect(r.unitB).toBe(5);
      expect(r.better).toBe("equal");
    }
  });
});

describe("compareUnitPrice / b 更划算", () => {
  it("20/100 vs 50/1000 → b 更划算", () => {
    const r = compareUnitPrice("20", "100", "50", "1000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.better).toBe("b");
      expect(r.unitA).toBe(0.2);
      expect(r.unitB).toBe(0.05);
    }
  });
});

describe("compareUnitPrice / 错误处理", () => {
  it("数量为 0 拒绝", () => {
    expect(compareUnitPrice("10", "0", "20", "5").ok).toBe(false);
    expect(compareUnitPrice("10", "5", "20", "0").ok).toBe(false);
  });

  it("价格为 0 拒绝", () => {
    expect(compareUnitPrice("0", "5", "20", "5").ok).toBe(false);
    expect(compareUnitPrice("10", "5", "0", "5").ok).toBe(false);
  });

  it("非数字拒绝", () => {
    expect(compareUnitPrice("abc", "5", "20", "5").ok).toBe(false);
    expect(compareUnitPrice("10", "5", "20", "xyz").ok).toBe(false);
  });

  it("空字符串拒绝", () => {
    expect(compareUnitPrice("", "5", "20", "5").ok).toBe(false);
  });
});
