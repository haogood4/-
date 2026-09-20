import { describe, expect, it } from "vitest";
import { calculateAverage } from "./average";

describe("calculateAverage / 基础", () => {
  it("10 20 30 → sum=60 mean=20 count=3", () => {
    expect(calculateAverage("10 20 30")).toEqual({
      ok: true,
      sum: 60,
      mean: 20,
      count: 3,
      sumText: "60",
      meanText: "20",
    });
  });

  it("1.5, 2.5, 3 → mean ≈ 2.333333", () => {
    const r = calculateAverage("1.5, 2.5, 3");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.count).toBe(3);
      expect(r.sum).toBe(7);
      expect(r.meanText).toBe("约 2.333333");
    }
  });
});

describe("calculateAverage / 多分隔符", () => {
  it("分号 + 空格 + 换行混合均可解析", () => {
    expect(calculateAverage("1;2\n3,4 5")).toEqual({
      ok: true,
      sum: 15,
      mean: 3,
      count: 5,
      sumText: "15",
      meanText: "3",
    });
  });
});

describe("calculateAverage / 错误处理", () => {
  it("空字符串拒绝", () => {
    expect(calculateAverage("")).toEqual({
      ok: false,
      error: { code: "EMPTY", message: "请输入至少一个数字" },
    });
    expect(calculateAverage("   ")).toEqual({
      ok: false,
      error: { code: "EMPTY", message: "请输入至少一个数字" },
    });
  });

  it("含字母拒绝", () => {
    expect(calculateAverage("10 a 20").ok).toBe(false);
  });

  it("超过 100 项拒绝", () => {
    const many = Array.from({ length: 101 }, (_, i) => String(i)).join(",");
    expect(calculateAverage(many).ok).toBe(false);
  });

  it("支持负数", () => {
    const r = calculateAverage("-5, 5, 10");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.sum).toBe(10);
      expect(r.count).toBe(3);
    }
  });
});
