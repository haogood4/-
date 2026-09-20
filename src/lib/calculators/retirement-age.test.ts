import { describe, expect, it } from "vitest";
import { calculateRetirementAge } from "./retirement-age";

const cv = (
  y: string,
  m: string,
  d: string,
  cat: "male" | "female55" | "female50",
) =>
  calculateRetirementAge({
    birthYear: y,
    birthMonth: m,
    birthDay: d,
    category: cat,
  });

describe("retirementAge / 男职工（原 60 周岁）对照表首段", () => {
  it("1965-01 → 60岁1月 / 2025-02", () => {
    const r = cv("1965", "1", "15", "male");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("60 岁 1 个月");
      expect(r.newRetireDateText).toBe("2025-02");
      expect(r.delayMonths).toBe(1);
    }
  });

  it("1965-05 → 60岁2月 / 2025-07（4 个月一档）", () => {
    const r = cv("1965", "5", "10", "male");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("60 岁 2 个月");
      expect(r.newRetireDateText).toBe("2025-07");
      expect(r.delayMonths).toBe(2);
    }
  });

  it("1966-05 → 60岁5月 / 2026-10", () => {
    const r = cv("1966", "5", "1", "male");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("60 岁 5 个月");
      expect(r.newRetireDateText).toBe("2026-10");
      expect(r.delayMonths).toBe(5);
    }
  });

  it("1968-09 → 61岁 / 2029-09（恰好 12 个月延迟）", () => {
    const r = cv("1968", "9", "20", "male");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("61 周岁");
      expect(r.newRetireDateText).toBe("2029-09");
      expect(r.delayMonths).toBe(12);
    }
  });

  it("1972-09 → 62岁 / 2034-09（恰好 24 个月延迟）", () => {
    const r = cv("1972", "9", "8", "male");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("62 周岁");
      expect(r.newRetireDateText).toBe("2034-09");
      expect(r.delayMonths).toBe(24);
    }
  });

  it("1976-12 → 63岁 / 2039-12（封顶 36 个月延迟）", () => {
    const r = cv("1976", "12", "1", "male");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("63 周岁");
      expect(r.newRetireDateText).toBe("2039-12");
      expect(r.delayMonths).toBe(36);
    }
  });

  it("1980-06 → 63岁（封顶延迟，超出 1976-09 后维持 63 岁）", () => {
    const r = cv("1980", "6", "1", "male");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("63 周岁");
      expect(r.delayMonths).toBe(36);
    }
  });
});

describe("retirementAge / 原 55 周岁女职工（每 4 个月 1 月延迟）", () => {
  it("1970-01 → 55岁1月 / 2025-02", () => {
    const r = cv("1970", "1", "10", "female55");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("55 岁 1 个月");
      expect(r.newRetireDateText).toBe("2025-02");
    }
  });

  it("1970-05 → 55岁2月 / 2025-07", () => {
    const r = cv("1970", "5", "1", "female55");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("55 岁 2 个月");
      expect(r.newRetireDateText).toBe("2025-07");
    }
  });

  it("1981-12 → 58岁 / 2039-12（封顶 36 个月延迟）", () => {
    const r = cv("1981", "12", "1", "female55");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("58 周岁");
      expect(r.delayMonths).toBe(36);
    }
  });
});

describe("retirementAge / 原 50 周岁女职工（每 2 个月 1 月延迟）", () => {
  it("1975-01 → 50岁1月 / 2025-02", () => {
    const r = cv("1975", "1", "15", "female50");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("50 岁 1 个月");
      expect(r.newRetireDateText).toBe("2025-02");
      expect(r.delayMonths).toBe(1);
    }
  });

  it("1975-02 → 50岁1月（基线） / 2025-02", () => {
    const r = cv("1975", "2", "15", "female50");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("50 岁 1 个月");
      expect(r.delayMonths).toBe(1);
    }
  });

  it("1975-03 → 50岁2月 / 2025-05（每 2 个月 1 月延迟）", () => {
    const r = cv("1975", "3", "15", "female50");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("50 岁 2 个月");
      expect(r.newRetireDateText).toBe("2025-05");
      expect(r.delayMonths).toBe(2);
    }
  });

  it("1980-01 → 52岁7月 / 2032-08（天津人社局公开答复口径）", () => {
    const r = cv("1980", "1", "10", "female50");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("52 岁 7 个月");
      expect(r.newRetireDateText).toBe("2032-08");
      expect(r.delayMonths).toBe(31);
    }
  });

  it("1985-12 → 55岁 / 2040-12（封顶 60 个月延迟）", () => {
    const r = cv("1985", "12", "1", "female50");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireAgeText).toBe("55 周岁");
      expect(r.delayMonths).toBe(60);
    }
  });
});

describe("retirementAge / 最低缴费年限", () => {
  it("2025 年退休：15 年", () => {
    const r = cv("1965", "1", "1", "male");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.minContributionYears).toBe(15);
  });

  it("2031 退休：15 年（2030-01 起按月调整，2031 仍在第一年内）", () => {
    // 1965-01 男职工 → 2025-02 退休（2030 前）
    const r = cv("1965", "1", "1", "male");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.minContributionYears).toBe(15);
  });

  it("2030-01 起每年 +6 月：1970-01 男职工 → 2031-05 → 16 年", () => {
    const r = cv("1970", "1", "1", "male");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireYear).toBe(2031);
      expect(r.minContributionYears).toBe(16);
    }
  });

  it("2038 退休：20 年（已到上限）", () => {
    // 1976-01 男职工 → 2038-11 退休（仍在 2030 后，已达 20 年上限）
    const r = cv("1976", "1", "1", "male");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.newRetireYear).toBe(2038);
      expect(r.minContributionYears).toBe(20);
    }
  });

  it("2050 退休：20 年（上限）", () => {
    // 2076-12 男职工 → 2139-12 退休，2038 起即达 20 年上限
    const r = cv("2076", "12", "1", "male");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.minContributionYears).toBe(20);
  });
});

describe("retirementAge / 错误处理", () => {
  it("空字段拒绝", () => {
    expect(cv("", "1", "1", "male").ok).toBe(false);
    expect(cv("1965", "", "1", "male").ok).toBe(false);
    // 日期可空：空日期不视为错误
    expect(cv("1965", "1", "", "male").ok).toBe(true);
  });

  it("非数字 / 非法日期拒绝", () => {
    expect(cv("abcd", "1", "1", "male").ok).toBe(false);
    expect(cv("1965", "13", "1", "male").ok).toBe(false);
    expect(cv("1965", "2", "30", "male").ok).toBe(false);
    expect(cv("1965", "2", "29", "male").ok).toBe(false);
    expect(cv("2000", "2", "29", "male").ok).toBe(true); // 2000 闰年
  });

  it("早于方案起始月份拒绝（以男职工为例）", () => {
    expect(cv("1964", "12", "1", "male").ok).toBe(false);
  });

  it("不支持的类别拒绝", () => {
    const raw = calculateRetirementAge({
      birthYear: "1965",
      birthMonth: "1",
      birthDay: "1",
      category: "student" as unknown as "male",
    });
    expect(raw.ok).toBe(false);
  });

  it("年份超界拒绝", () => {
    expect(cv("1850", "1", "1", "male").ok).toBe(false);
    expect(cv("2200", "1", "1", "male").ok).toBe(false);
  });
});
