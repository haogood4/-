import { describe, expect, it } from "vitest";
import { calculateInjury } from "./injury-cn";

const cv = (salary: string, level: string, resign: string) =>
  calculateInjury({ salary, level, resign });

describe("injury / 1-10 级一次性伤残补助金月数", () => {
  it("月薪 8000 / 10 级：8000 × 7 = 56000", () => {
    const r = cv("8000", "10", "false");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.disabilityMonths).toBe(7);
      expect(r.disabilityAmount).toBe(56000);
      expect(r.total).toBe(56000);
    }
  });

  it("月薪 8000 / 6 级：8000 × 16 = 128000", () => {
    const r = cv("8000", "6", "false");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.disabilityMonths).toBe(16);
      expect(r.disabilityAmount).toBe(128000);
    }
  });

  it("月薪 8000 / 1 级：8000 × 27 = 216000", () => {
    const r = cv("8000", "1", "false");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.disabilityMonths).toBe(27);
      expect(r.disabilityAmount).toBe(216000);
    }
  });

  it("月薪 8000 / 4 级：8000 × 21 = 168000，且按月发放 75% 津贴", () => {
    const r = cv("8000", "4", "false");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.disabilityAmount).toBe(168000);
      expect(r.monthlyPension).toBe(6000);
    }
  });

  it("月薪 8000 / 1 级：伤残津贴 90% → 7200/月", () => {
    const r = cv("8000", "1", "false");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.monthlyPension).toBe(7200);
  });
});

describe("injury / 解除劳动合同时一次性医疗/就业补助金", () => {
  it("月薪 8000 / 10 级 解除：补助金合计 6 月 → 24000（对半 12000+12000）", () => {
    const r = cv("8000", "10", "true");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.medicalAmount).toBe(12000);
      expect(r.employmentAmount).toBe(12000);
      expect(r.total).toBe(8000 * 7 + 24000);
    }
  });

  it("月薪 8000 / 5 级 解除：补助金合计 18 月 → 72000", () => {
    const r = cv("8000", "5", "true");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.medicalAmount).toBe(36000);
      expect(r.employmentAmount).toBe(36000);
    }
  });

  it("月薪 8000 / 4 级 解除：保留劳动关系，不计一次性医疗/就业补助金", () => {
    const r = cv("8000", "4", "true");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.medicalAmount).toBeUndefined();
      expect(r.employmentAmount).toBeUndefined();
      expect(r.total).toBe(r.disabilityAmount);
    }
  });
});

describe("injury / 错误处理", () => {
  it("空月薪 / 空等级 拒绝（EMPTY）", () => {
    expect(cv("", "5", "false").ok).toBe(false);
    expect(cv("8000", "", "false").ok).toBe(false);
  });

  it("非法字符与科学计数法拒绝（INVALID_NUMBER）", () => {
    expect(cv("abc", "5", "false").ok).toBe(false);
    const sci = cv("1e4", "5", "false");
    expect(sci.ok).toBe(false);
    if (!sci.ok) expect(sci.error.code).toBe("INVALID_NUMBER");
  });

  it("等级非整数（5.5 / 11 / 0 / 字符串）拒绝", () => {
    expect(cv("8000", "5.5", "false").ok).toBe(false);
    expect(cv("8000", "0", "false").ok).toBe(false);
    expect(cv("8000", "11", "false").ok).toBe(false);
    const r = cv("8000", "x", "false");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_NUMBER");
  });

  it("月薪 0 / 1000000.01 / 3 位小数 拒绝", () => {
    expect(cv("0", "5", "false").ok).toBe(false);
    expect(cv("1000000.01", "5", "false").ok).toBe(false);
    const r = cv("8000.123", "5", "false");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOO_MANY_DECIMALS");
  });
});
