import { describe, expect, it } from "vitest";
import { calculateBonusTaxCompare } from "./bonus-tax-compare";

const cmp = (bonus: string, taxableIncome: string) =>
  calculateBonusTaxCompare({ bonus, taxableIncome });

describe("bonusTaxCompare / 经典临界点 36000 与 36001", () => {
  it("年终奖 36000、综合所得 50000：单独计税 1080 元，省 2520 元", () => {
    const r = cmp("36000", "50000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.taxSeparate).toBe(1080); // 36000 × 3%
      expect(r.separateRate).toBe(0.03);
      expect(r.separateQuick).toBe(0);
      expect(r.taxWithoutBonus).toBe(2480); // 50000 × 10% − 2520
      expect(r.taxWithBonus).toBe(6080); // 86000 × 10% − 2520
      expect(r.incrementalMerge).toBe(3600);
      expect(r.recommended).toBe("separate");
      expect(r.saving).toBe(2520);
      expect(r.recommendedText).toBe("建议选择单独计税，可省 ¥2520.00");
    }
  });

  it("年终奖 36001、综合所得 50000：跳档到 10%，税 3390.10 元仍省 210 元", () => {
    const r = cmp("36001", "50000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.separateRate).toBe(0.1); // 36001 ÷ 12 = 3000.08 > 3000
      expect(r.taxSeparate).toBeCloseTo(3390.1, 2); // 36001 × 10% − 210
      expect(r.taxWithBonus).toBeCloseTo(6080.1, 2); // 86001 × 10% − 2520
      expect(r.incrementalMerge).toBeCloseTo(3600.1, 2);
      expect(r.recommended).toBe("separate");
      expect(r.saving).toBe(210);
    }
  });

  it("综合所得为 0 时的临界对比：36000 两者相同；36001 并入更划算", () => {
    const r36k = cmp("36000", "0");
    expect(r36k.ok).toBe(true);
    if (r36k.ok) {
      expect(r36k.taxSeparate).toBe(1080);
      expect(r36k.incrementalMerge).toBe(1080); // 36000 × 3%
      expect(r36k.recommended).toBe("separate"); // 持平默认单独计税
      expect(r36k.saving).toBe(0);
      expect(r36k.recommendedText).toContain("税额相同");
    }
    const r36001 = cmp("36001", "0");
    expect(r36001.ok).toBe(true);
    if (r36001.ok) {
      expect(r36001.taxSeparate).toBeCloseTo(3390.1, 2);
      expect(r36001.taxWithBonus).toBeCloseTo(1080.1, 2); // 36001 越过 36000 → 10%：3600.1 − 2520
      expect(r36001.recommended).toBe("merge");
      expect(r36001.saving).toBeCloseTo(2310, 2);
      expect(r36001.recommendedText).toBe(
        "建议选择并入综合所得，可省 ¥2310.00",
      );
    }
  });
});

describe("bonusTaxCompare / 不同收入结构的推荐方向", () => {
  it("低收入并入更划算：奖金 40000、综合所得 0 → 并入省 2310 元", () => {
    const r = cmp("40000", "0");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.taxSeparate).toBe(3790); // 40000 ÷ 12 > 3000 → 10%：4000 − 210
      expect(r.taxWithBonus).toBe(1480); // 40000 越过 36000 → 10%：4000 − 2520
      expect(r.recommended).toBe("merge");
      expect(r.saving).toBe(2310);
    }
  });

  it("高收入单独更划算：奖金 100000、综合所得 200000 → 省 10210 元", () => {
    const r = cmp("100000", "200000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.taxSeparate).toBe(9790); // 100000 ÷ 12 ≈ 8333 → 10%：10000 − 210
      expect(r.taxWithoutBonus).toBe(23080); // 200000 × 20% − 16920
      expect(r.taxWithBonus).toBe(43080); // 300000 × 20% − 16920
      expect(r.incrementalMerge).toBe(20000);
      expect(r.recommended).toBe("separate");
      expect(r.saving).toBe(10210);
    }
  });

  it("45% 档：奖金 1000000、综合所得 0 → 并入省 166760 元", () => {
    const r = cmp("1000000", "0");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.separateRate).toBe(0.45); // ÷12 ≈ 83333 > 80000
      expect(r.taxSeparate).toBe(434840); // 1000000 × 45% − 15160
      expect(r.taxWithBonus).toBe(268080); // 1000000 × 45% − 181920
      expect(r.recommended).toBe("merge");
      expect(r.saving).toBe(166760);
    }
  });

  it("月度表上边界：奖金 144000（÷12 = 12000 仍在 10% 档），并入省 2310 元", () => {
    const r = cmp("144000", "0");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.taxSeparate).toBe(14190); // 14400 − 210
      expect(r.taxWithBonus).toBe(11880); // 144000 × 10% − 2520
      expect(r.recommended).toBe("merge");
      expect(r.saving).toBe(2310);
    }
  });

  it("中收入组合：奖金 120000、综合所得 36000 → 单独省 1410 元", () => {
    const r = cmp("120000", "36000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.taxSeparate).toBe(11790); // 12000 − 210
      expect(r.taxWithoutBonus).toBe(1080); // 36000 × 3%
      expect(r.taxWithBonus).toBe(14280); // 156000 × 20% − 16920
      expect(r.incrementalMerge).toBe(13200);
      expect(r.recommended).toBe("separate");
      expect(r.saving).toBe(1410);
    }
  });
});

describe("bonusTaxCompare / 边界与小数", () => {
  it("综合所得为 0 时 taxWithoutBonus 为 0", () => {
    const r = cmp("36000", "0");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.taxWithoutBonus).toBe(0);
  });

  it("小数金额：奖金 12345.67、综合所得 1000 → 持平，默认单独计税", () => {
    const r = cmp("12345.67", "1000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.separateRate).toBe(0.03);
      expect(r.taxSeparate).toBeCloseTo(370.37, 2); // 12345.67 × 3%
      expect(r.taxWithoutBonus).toBe(30); // 1000 × 3%
      expect(r.taxWithBonus).toBeCloseTo(400.37, 2); // 13345.67 × 3%
      expect(r.incrementalMerge).toBeCloseTo(370.37, 2);
      expect(r.recommended).toBe("separate");
      expect(r.saving).toBe(0);
    }
  });

  it("上界合法：奖金与综合所得均为 10000000 → 单独省 15160 元", () => {
    const r = cmp("10000000", "10000000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.taxSeparate).toBe(4484840); // 10000000 × 45% − 15160
      expect(r.taxWithoutBonus).toBe(4318080); // 10000000 × 45% − 181920
      expect(r.taxWithBonus).toBe(8818080); // 20000000 × 45% − 181920
      expect(r.incrementalMerge).toBe(4500000);
      expect(r.recommended).toBe("separate");
      expect(r.saving).toBe(15160);
    }
  });

  it("breakdownText 含口径说明与代入过程", () => {
    const r = cmp("36000", "50000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.breakdownText).toContain("÷ 12");
      expect(r.breakdownText).toContain("速算扣除数");
      expect(r.breakdownText).toContain("实际多缴");
      expect(r.breakdownText).toContain("1080.00");
    }
  });
});

describe("bonusTaxCompare / 错误处理", () => {
  it("空值拒绝并定位字段", () => {
    const noBonus = cmp("", "50000");
    expect(noBonus.ok).toBe(false);
    if (!noBonus.ok) {
      expect(noBonus.error.code).toBe("EMPTY");
      expect(noBonus.error.field).toBe("bonus");
    }
    const noTaxable = cmp("36000", "");
    expect(noTaxable.ok).toBe(false);
    if (!noTaxable.ok) {
      expect(noTaxable.error.code).toBe("EMPTY");
      expect(noTaxable.error.field).toBe("taxable");
    }
  });

  it("非法字符拒绝", () => {
    const r = cmp("abc", "50000");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_NUMBER");
    const t = cmp("36000", "1.2.3");
    expect(t.ok).toBe(false);
    if (!t.ok) expect(t.error.code).toBe("INVALID_NUMBER");
  });

  it("奖金 ≤ 0 或超出上界拒绝", () => {
    for (const b of ["0", "-100", "10000001"]) {
      const r = cmp(b, "50000");
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error.code).toBe("OUT_OF_RANGE");
        expect(r.error.field).toBe("bonus");
      }
    }
  });

  it("综合所得为负或超上界拒绝", () => {
    for (const t of ["-1", "10000001"]) {
      const r = cmp("36000", t);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error.code).toBe("OUT_OF_RANGE");
        expect(r.error.field).toBe("taxable");
      }
    }
  });

  it("超过 2 位小数拒绝", () => {
    const b = cmp("1.234", "0");
    expect(b.ok).toBe(false);
    if (!b.ok) expect(b.error.code).toBe("TOO_MANY_DECIMALS");
    const t = cmp("36000", "0.005");
    expect(t.ok).toBe(false);
    if (!t.ok) {
      expect(t.error.code).toBe("TOO_MANY_DECIMALS");
      expect(t.error.field).toBe("taxable");
    }
  });
});
