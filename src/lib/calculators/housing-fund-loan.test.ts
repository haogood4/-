import { describe, expect, it } from "vitest";
import { calculateHousingFundLoan } from "./housing-fund-loan";

const cv = (amount: string, years: string, houseType: "first" | "second") =>
  calculateHousingFundLoan({ amount, years, houseType });

describe("housingFundLoan / 利率档位与月供（央行 2025-05-08 起施行）", () => {
  it("首套 100 万 30 年（5 年以上档 2.6%）：月供 ≈ 4003.40", () => {
    const r = cv("1000000", "30", "first");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.annualRate).toBe(0.026);
      expect(r.monthPay).toBeCloseTo(4003.3971, 2); // 复算：1e6×i×(1+i)^360/((1+i)^360−1)
      expect(r.totalPay).toBeCloseTo(1441222.9615, 2);
      expect(r.totalInterest).toBeCloseTo(441222.9615, 2);
      expect(r.rateLabel).toContain("首套");
    }
  });

  it("首套 100 万 5 年（含，边界走 short 档 2.1%）", () => {
    const r = cv("1000000", "5", "first");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.annualRate).toBe(0.021);
      expect(r.monthPay).toBeCloseTo(17571.5421, 2);
      expect(r.totalInterest).toBeCloseTo(54292.5237, 2);
    }
  });

  it("首套 100 万 6 年（超过 5 年切回 long 档 2.6%）", () => {
    const r = cv("1000000", "6", "first");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.annualRate).toBe(0.026);
      expect(r.monthPay).toBeCloseTo(15015.3879, 2);
    }
  });

  it("二套 100 万 30 年（3.075%）：月供 ≈ 4256.60", () => {
    const r = cv("1000000", "30", "second");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.annualRate).toBe(0.03075);
      expect(r.monthPay).toBeCloseTo(4256.5973, 2);
      expect(r.totalInterest).toBeCloseTo(532375.0183, 2);
    }
  });

  it("二套 100 万 5 年（2.525%）", () => {
    const r = cv("1000000", "5", "second");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.annualRate).toBe(0.02525);
      expect(r.monthPay).toBeCloseTo(17758.387, 2);
    }
  });

  it("首套 50 万 20 年（2.6%）：月供 ≈ 2673.94", () => {
    const r = cv("500000", "20", "first");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.monthPay).toBeCloseTo(2673.9403, 2);
  });

  it("还款总额 = 月供 × 期数（内部一致性）", () => {
    const r = cv("123456.78", "17", "second");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.totalPay).toBeCloseTo(r.monthPay * 17 * 12, 6);
      expect(r.totalInterest).toBeCloseTo(r.totalPay - 123456.78, 6);
    }
  });

  it("formulaText 含利率与公式代入", () => {
    const r = cv("1000000", "30", "first");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.formulaText).toContain("2.6%");
      expect(r.formulaText).toContain("360");
      expect(r.formulaText).toContain("4003.40");
    }
  });
});

describe("housingFundLoan / 金额边界", () => {
  it("下边界 10,000 元与上边界 5,000,000 元可算", () => {
    expect(cv("10000", "30", "first").ok).toBe(true);
    expect(cv("5000000", "30", "first").ok).toBe(true);
  });

  it("低于下限 9,999.99 与超上限 5,000,000.01 拒绝", () => {
    expect(cv("9999.99", "30", "first").ok).toBe(false);
    expect(cv("5000000.01", "30", "first").ok).toBe(false);
  });

  it("金额 3 位小数拒绝（最多 2 位）", () => {
    const r = cv("100000.001", "30", "first");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_NUMBER");
  });

  it("金额负数拒绝", () => {
    const r = cv("-100000", "30", "first");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NEGATIVE");
  });
});

describe("housingFundLoan / 年限校验", () => {
  it("0 年、31 年、2.5 年（非整数）拒绝", () => {
    expect(cv("100000", "0", "first").ok).toBe(false);
    expect(cv("100000", "31", "first").ok).toBe(false);
    expect(cv("100000", "2.5", "first").ok).toBe(false);
  });

  it("负年限拒绝", () => {
    const r = cv("100000", "-1", "first");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NEGATIVE");
  });

  it("年限 1 与 30 边界可算", () => {
    expect(cv("100000", "1", "first").ok).toBe(true);
    expect(cv("100000", "30", "first").ok).toBe(true);
  });
});

describe("housingFundLoan / 空值与非法输入", () => {
  it("空值拒绝", () => {
    const r1 = cv("", "30", "first");
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.error.code).toBe("EMPTY");
    const r2 = cv("100000", "", "first");
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.error.code).toBe("EMPTY");
  });

  it("非法字符拒绝", () => {
    const r = cv("abc", "30", "first");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_NUMBER");
    expect(cv("100000", "3O", "first").ok).toBe(false);
  });

  it("房套类型非法拒绝", () => {
    const r = calculateHousingFundLoan({
      amount: "100000",
      years: "30",
      houseType: "third",
    });
    expect(r.ok).toBe(false);
  });
});
