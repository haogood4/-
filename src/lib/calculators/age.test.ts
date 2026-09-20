import { describe, expect, it } from "vitest";
import { calculateAge } from "./age";

describe("calculateAge / 闰年 2 月 29 日出生", () => {
  it("平年 2025-02-28：生日未到（按 3 月 1 日判定），24 岁", () => {
    expect(calculateAge("2000-02-29", "2025-02-28")).toEqual({
      ok: true,
      years: 24,
    });
  });

  it("平年 2025-03-01：生日已到，25 岁", () => {
    expect(calculateAge("2000-02-29", "2025-03-01")).toEqual({
      ok: true,
      years: 25,
    });
  });

  it("闰年 2024-02-29 生日当天：岁数 +1，24 岁", () => {
    expect(calculateAge("2000-02-29", "2024-02-28")).toEqual({
      ok: true,
      years: 23,
    });
    expect(calculateAge("2000-02-29", "2024-02-29")).toEqual({
      ok: true,
      years: 24,
    });
  });
});

describe("calculateAge / 生日当天算满周岁", () => {
  it("2000-01-01 在 2025-01-01：25 岁", () => {
    expect(calculateAge("2000-01-01", "2025-01-01")).toEqual({
      ok: true,
      years: 25,
    });
  });
});

describe("calculateAge / 生日未到减一岁", () => {
  it("2000-02-28 出生在 2001-02-27：0 岁", () => {
    expect(calculateAge("2000-02-28", "2001-02-27")).toEqual({
      ok: true,
      years: 0,
    });
  });
});

describe("calculateAge / 错误处理", () => {
  it("target 早于 birth 报错：目标日期早于出生日期", () => {
    expect(calculateAge("2025-06-01", "2025-01-01")).toEqual({
      ok: false,
      error: { code: "TARGET_BEFORE_BIRTH", message: "目标日期早于出生日期" },
    });
  });

  it("拒绝不存在的日期 2025-02-30", () => {
    expect(calculateAge("2025-02-30", "2025-03-01")).toEqual({
      ok: false,
      error: {
        code: "INVALID_DATE",
        message: "请输入有效日期（YYYY-MM-DD）",
      },
    });
  });

  it("拒绝非 YYYY-MM-DD 格式", () => {
    expect(calculateAge("2000/02/28", "2025-01-01").ok).toBe(false);
    expect(calculateAge("2000-2-28", "2025-01-01").ok).toBe(false);
    expect(calculateAge("abc", "2025-01-01").ok).toBe(false);
  });
});
