import { describe, expect, it } from "vitest";
import { calculateCompensation } from "./compensation-cn";

const cv = (salary: string, years: string, type: string, regionAvg = "") =>
  calculateCompensation({ salary, years, type, regionAvgSalary: regionAvg });

describe("compensation / N（合法解除经济补偿）", () => {
  it("月薪 8000 / 工龄 3 年 / N：8000 × 3 = 24000", () => {
    const r = cv("8000", "3", "N");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.result).toBe(24000);
      expect(r.months).toBe(3);
      expect(r.capped).toBe(false);
      expect(r.type).toBe("N");
    }
  });

  it("工龄 1 年（6 个月以上）：按 1 年 → 8000", () => {
    const r = cv("8000", "1", "N");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.result).toBe(8000);
  });

  it("工龄 0.5 年（不满 6 个月）：按半月 → 4000", () => {
    const r = cv("8000", "0.5", "N");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.months).toBe(0.5);
      expect(r.result).toBe(4000);
    }
  });

  it("工龄 5.5 年：按 5 + 1 = 6 年 → 6 个月", () => {
    const r = cv("8000", "5.5", "N");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.result).toBe(48000);
  });

  it("工龄 2.3 年：按 2 年（余 0.3 不满 0.5）→ 2 个月", () => {
    const r = cv("8000", "2.3", "N");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.result).toBe(16000);
  });
});

describe("compensation / N+1 与 2N", () => {
  it("N+1：8000 × (3 + 1) = 32000", () => {
    const r = cv("8000", "3", "N+1");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.months).toBe(4);
      expect(r.result).toBe(32000);
    }
  });

  it("2N：8000 × 3 × 2 = 48000", () => {
    const r = cv("8000", "3", "2N");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.months).toBe(6);
      expect(r.result).toBe(48000);
    }
  });
});

describe("compensation / 高薪封顶（3 倍社平 + 12 年）", () => {
  it("月薪 30000、社平 8000、工龄 15 年 → 社平 ×3 = 24000、年限按 12 → 288000", () => {
    const r = cv("30000", "15", "N", "8000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.capped).toBe(true);
      expect(r.cappedSalary).toBe(24000);
      expect(r.cappedYears).toBe(12);
      expect(r.result).toBe(288000);
    }
  });

  it("月薪 30000、社平 8000、工龄 5 年 → 仍按 3 倍社平计入，年限不变 → 120000", () => {
    const r = cv("30000", "5", "N", "8000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.capped).toBe(true);
      expect(r.cappedSalary).toBe(24000);
      expect(r.cappedYears).toBe(5);
      expect(r.result).toBe(120000);
    }
  });

  it("月薪 24000 正好等于 3 倍社平：按月薪本身计入，未封顶", () => {
    const r = cv("24000", "10", "N", "8000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.capped).toBe(false);
      expect(r.cappedSalary).toBe(24000);
      expect(r.result).toBe(240000);
    }
  });

  it("留空社平：永不触发封顶，按月薪计入", () => {
    const r = cv("30000", "15", "N", "");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.capped).toBe(false);
      expect(r.result).toBe(450000);
    }
  });

  it("2N 触发封顶：baseMonths × CappedYear，按 3 倍社平 ×2 倍", () => {
    const r = cv("30000", "15", "2N", "8000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.capped).toBe(true);
      // baseMonths(12) × 2 = 24
      expect(r.months).toBe(24);
      expect(r.result).toBe(576000); // 24000 × 24
    }
  });
});

describe("compensation / 错误处理", () => {
  it("空月薪 / 空年限 拒绝（EMPTY）", () => {
    expect(cv("", "3", "N").ok).toBe(false);
    expect(cv("8000", "", "N").ok).toBe(false);
  });

  it("非法字符与科学计数法拒绝（INVALID_NUMBER）", () => {
    const abc = cv("abc", "3", "N");
    expect(abc.ok).toBe(false);
    if (!abc.ok) expect(abc.error.code).toBe("INVALID_NUMBER");
    const sci = cv("1e4", "3", "N");
    expect(sci.ok).toBe(false);
    if (!sci.ok) expect(sci.error.code).toBe("INVALID_NUMBER");
  });

  it("月薪超出 [1, 1000000] 拒绝；年限 < 0.5 或 > 50 拒绝", () => {
    expect(cv("0", "3", "N").ok).toBe(false);
    expect(cv("1000001", "3", "N").ok).toBe(false);
    expect(cv("8000", "0.4", "N").ok).toBe(false);
    expect(cv("8000", "51", "N").ok).toBe(false);
  });

  it("3 位小数月薪拒绝；年限 2 位小数拒绝", () => {
    const many = cv("8000.123", "3", "N");
    expect(many.ok).toBe(false);
    if (!many.ok) expect(many.error.code).toBe("TOO_MANY_DECIMALS");
    const year = cv("8000", "3.25", "N");
    expect(year.ok).toBe(false);
    if (!year.ok) expect(year.error.code).toBe("TOO_MANY_DECIMALS");
  });

  it("未知 type 拒绝（INVALID_TYPE）", () => {
    const r = cv("8000", "3", "X");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_TYPE");
  });
});
