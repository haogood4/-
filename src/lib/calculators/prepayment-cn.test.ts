import { describe, expect, it } from "vitest";
import { calculatePrepayment } from "./prepayment-cn";

const base = {
  principal: "1000000",
  years: "30",
  rate: "4.2",
  paidMonths: "12",
  prepay: "100000",
};

describe("prepayment-cn / 正常计算", () => {
  it("100万 30年 4.2% 已还12期 提前还10万：原月供与剩余本金", () => {
    const r = calculatePrepayment(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.originalMonthly).toBeCloseTo(4890.17, 1);
      expect(r.value.balance).toBeCloseTo(982993.03, 1);
      expect(r.value.newPrincipal).toBeCloseTo(882993.03, 1);
    }
  });
  it("方案 A：月供不变、缩短期数、节省利息", () => {
    const r = calculatePrepayment(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.planA.monthly).toBeCloseTo(4890.17, 1);
      expect(r.value.planA.months).toBe(287);
      expect(r.value.planA.totalInterest).toBeCloseTo(516096.91, 1);
      expect(r.value.planA.savedInterest).toBeCloseTo(202689.82, 1);
    }
  });
  it("方案 B：期数不变、重算月供、节省利息", () => {
    const r = calculatePrepayment(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.planB.months).toBe(348);
      expect(r.value.planB.monthly).toBeCloseTo(4392.69, 1);
      expect(r.value.planB.totalInterest).toBeCloseTo(645664.47, 1);
      expect(r.value.planB.savedInterest).toBeCloseTo(73122.26, 1);
    }
  });
  it("方案 A 节省利息多于方案 B", () => {
    const r = calculatePrepayment(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.planA.savedInterest).toBeGreaterThan(
        r.value.planB.savedInterest,
      );
      expect(r.value.planA.months).toBeLessThan(r.value.planB.months);
    }
  });
  it("已还 60 期提前还 20 万", () => {
    const r = calculatePrepayment({
      ...base,
      paidMonths: "60",
      prepay: "200000",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.planA.months).toBe(203);
      expect(r.value.planA.savedInterest).toBeCloseTo(279218.92, 1);
      expect(r.value.planB.monthly).toBeCloseTo(3812.29, 1);
      expect(r.value.planB.savedInterest).toBeCloseTo(123365.39, 1);
    }
  });
  it("已还 0 期（放款即提前还款）", () => {
    const r = calculatePrepayment({ ...base, paidMonths: "0" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.balance).toBeCloseTo(1000000, 6);
      expect(r.value.planA.months).toBe(296);
      expect(r.value.planB.months).toBe(360);
      expect(r.value.planB.monthly).toBeCloseTo(4401.15, 1);
    }
  });
  it("50万 20年 3.5% 已还24期 提前还5万", () => {
    const r = calculatePrepayment({
      principal: "500000",
      years: "20",
      rate: "3.5",
      paidMonths: "24",
      prepay: "50000",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.originalMonthly).toBeCloseTo(2899.8, 1);
      expect(r.value.planA.months).toBe(186);
      expect(r.value.planA.savedInterest).toBeCloseTo(39760.6, 1);
      expect(r.value.planB.monthly).toBeCloseTo(2587.47, 1);
      expect(r.value.planB.savedInterest).toBeCloseTo(17463.43, 1);
    }
  });
});

describe("prepayment-cn / 边界与退化", () => {
  it("提前还款 0 元：两方案节省利息均为 0，方案 A 期数等于剩余期数", () => {
    const r = calculatePrepayment({ ...base, prepay: "0" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.planA.months).toBe(348);
      expect(r.value.planA.savedInterest).toBeCloseTo(0, 4);
      expect(r.value.planB.savedInterest).toBeCloseTo(0, 4);
      expect(r.value.planB.monthly).toBeCloseTo(r.value.originalMonthly, 6);
    }
  });
  it("利率 0：退化为本金均摊，无利息可省", () => {
    const r = calculatePrepayment({
      principal: "120000",
      years: "1",
      rate: "0",
      paidMonths: "3",
      prepay: "10000",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.balance).toBeCloseTo(90000, 6);
      expect(r.value.planA.months).toBe(8);
      expect(r.value.planA.totalInterest).toBeCloseTo(0, 6);
      expect(r.value.planB.monthly).toBeCloseTo(8888.89, 1);
    }
  });
  it("节省利息 = 基准剩余利息 − 方案总利息（一致性）", () => {
    const r = calculatePrepayment(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.planA.savedInterest).toBeCloseTo(
        r.value.baselineInterest - r.value.planA.totalInterest,
        6,
      );
      expect(r.value.planB.savedInterest).toBeCloseTo(
        r.value.baselineInterest - r.value.planB.totalInterest,
        6,
      );
    }
  });
});

describe("prepayment-cn / 非法输入", () => {
  it("提前还款金额 ≥ 剩余本金拒绝", () => {
    const r = calculatePrepayment({ ...base, prepay: "1000000" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toContain("剩余本金");
  });
  it("提前还款金额为负拒绝", () => {
    const r = calculatePrepayment({ ...base, prepay: "-100" });
    expect(r.ok).toBe(false);
  });
  it("已还期数不小于总期数拒绝", () => {
    const r = calculatePrepayment({
      ...base,
      years: "1",
      paidMonths: "12",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toContain("已还期数");
  });
  it("本金为 0 拒绝", () => {
    const r = calculatePrepayment({ ...base, principal: "0" });
    expect(r.ok).toBe(false);
  });
  it("年限超过 30 拒绝", () => {
    const r = calculatePrepayment({ ...base, years: "31" });
    expect(r.ok).toBe(false);
  });
  it("利率超过 20% 拒绝", () => {
    const r = calculatePrepayment({ ...base, rate: "21" });
    expect(r.ok).toBe(false);
  });
  it("字段为空拒绝", () => {
    const r = calculatePrepayment({ ...base, prepay: "" });
    expect(r.ok).toBe(false);
  });
  it("非数字拒绝", () => {
    const r = calculatePrepayment({ ...base, paidMonths: "abc" });
    expect(r.ok).toBe(false);
  });
});
