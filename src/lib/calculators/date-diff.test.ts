import { describe, expect, it } from "vitest";
import { daysBetween } from "./date-diff";

describe("daysBetween / end − start 天数差（不含首尾双计）", () => {
  it("同月相邻日：2025-01-01 → 2025-01-02 = 1 天", () => {
    const r = daysBetween("2025-01-01", "2025-01-02", "2025-01-01");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.days).toBe(1);
  });

  it("跨闰年 2 月：2024-02-28 → 2024-03-01 = 2 天", () => {
    const r = daysBetween("2024-02-28", "2024-03-01", "2024-02-28");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.days).toBe(2);
  });

  it("月底：2025-01-31 → 2025-02-01 = 1 天", () => {
    const r = daysBetween("2025-01-31", "2025-02-01", "2025-01-31");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.days).toBe(1);
  });

  it("跨年：2024-12-31 → 2025-01-01 = 1 天", () => {
    const r = daysBetween("2024-12-31", "2025-01-01", "2024-12-31");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.days).toBe(1);
  });

  it("同年同日 = 0 天", () => {
    const r = daysBetween("2025-01-01", "2025-01-01", "2025-01-01");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.days).toBe(0);
  });

  it("整年：2024-01-01 → 2025-01-01 = 366 天（2024 为闰年）", () => {
    const r = daysBetween("2024-01-01", "2025-01-01", "2024-01-01");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.days).toBe(366);
  });

  it("周/月/年聚合：100 天 ≈ 14 周 3 月 0 年", () => {
    const r = daysBetween("2025-01-01", "2025-04-11", "2025-01-01");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.days).toBe(100);
      expect(r.weeks).toBe(14);
      expect(r.months).toBe(3);
    }
  });

  it("倒计时：今天 = 结束日 = 0", () => {
    const r = daysBetween("2025-01-01", "2025-06-01", "2025-06-01");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.countDownToTarget).toBe(0);
  });

  it("倒计时：今天 < 结束日 → 正数", () => {
    const r = daysBetween("2025-01-01", "2025-06-01", "2025-05-30");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.countDownToTarget).toBe(2);
  });

  it("倒计时：今天 > 结束日 → 负数", () => {
    const r = daysBetween("2025-01-01", "2025-06-01", "2025-06-05");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.countDownToTarget).toBe(-4);
  });
});

describe("daysBetween / 错误处理", () => {
  it("end 早于 start 报错：结束日期早于开始日期", () => {
    expect(daysBetween("2025-02-01", "2025-01-01", "2025-01-01")).toEqual({
      ok: false,
      error: { code: "END_BEFORE_START", message: "结束日期早于开始日期" },
    });
  });

  it("拒绝不存在的日期 2025-02-30", () => {
    const r = daysBetween("2025-02-30", "2025-03-01", "2025-02-28");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_DATE");
  });

  it("拒绝非 YYYY-MM-DD 格式", () => {
    expect(daysBetween("2025/01/01", "2025-01-02", "2025-01-01").ok).toBe(false);
    expect(daysBetween("2025-1-1", "2025-01-02", "2025-01-01").ok).toBe(false);
  });
});