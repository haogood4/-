import { describe, expect, it } from "vitest";
import { daysBetween } from "./date-diff";

describe("daysBetween / end − start 天数差（不含首尾双计）", () => {
  it("同月相邻日：2025-01-01 → 2025-01-02 = 1 天", () => {
    expect(daysBetween("2025-01-01", "2025-01-02")).toEqual({
      ok: true,
      days: 1,
    });
  });

  it("跨闰年 2 月：2024-02-28 → 2024-03-01 = 2 天", () => {
    expect(daysBetween("2024-02-28", "2024-03-01")).toEqual({
      ok: true,
      days: 2,
    });
  });

  it("月底：2025-01-31 → 2025-02-01 = 1 天", () => {
    expect(daysBetween("2025-01-31", "2025-02-01")).toEqual({
      ok: true,
      days: 1,
    });
  });

  it("跨年：2024-12-31 → 2025-01-01 = 1 天", () => {
    expect(daysBetween("2024-12-31", "2025-01-01")).toEqual({
      ok: true,
      days: 1,
    });
  });

  it("同年同日 = 0 天", () => {
    expect(daysBetween("2025-01-01", "2025-01-01")).toEqual({
      ok: true,
      days: 0,
    });
  });

  it("整年：2024-01-01 → 2025-01-01 = 366 天（2024 为闰年）", () => {
    expect(daysBetween("2024-01-01", "2025-01-01")).toEqual({
      ok: true,
      days: 366,
    });
  });
});

describe("daysBetween / 错误处理", () => {
  it("end 早于 start 报错：结束日期早于开始日期", () => {
    expect(daysBetween("2025-02-01", "2025-01-01")).toEqual({
      ok: false,
      error: { code: "END_BEFORE_START", message: "结束日期早于开始日期" },
    });
  });

  it("拒绝不存在的日期 2025-02-30", () => {
    expect(daysBetween("2025-02-30", "2025-03-01")).toEqual({
      ok: false,
      error: {
        code: "INVALID_DATE",
        message: "请输入有效日期（YYYY-MM-DD）",
      },
    });
  });

  it("拒绝非 YYYY-MM-DD 格式", () => {
    expect(daysBetween("2025/01/01", "2025-01-02").ok).toBe(false);
    expect(daysBetween("2025-1-1", "2025-01-02").ok).toBe(false);
  });
});
