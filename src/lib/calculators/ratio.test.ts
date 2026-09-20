import { describe, expect, it } from "vitest";
import { solveRatio } from "./ratio";

describe("solveRatio / find-d (a:b=c:x)", () => {
  it("2:4=3:x → x = 6", () => {
    expect(solveRatio("find-d", "2", "4", "3")).toEqual({
      ok: true,
      value: 6,
      valueText: "6",
      processText: "4 × 3 ÷ 2 = 6",
    });
  });

  it("支持小数：1.5 : 3 = 4 : x → x = 8", () => {
    const r = solveRatio("find-d", "1.5", "3", "4");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(8);
  });
});

describe("solveRatio / find-c (a:b=x:c)", () => {
  it("2:4=x:6 → x = 3", () => {
    expect(solveRatio("find-c", "2", "4", "6")).toEqual({
      ok: true,
      value: 3,
      valueText: "3",
      processText: "2 × 6 ÷ 4 = 3",
    });
  });

  it("支持负数 c", () => {
    const r = solveRatio("find-c", "2", "4", "-10");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(-5);
  });
});

describe("solveRatio / 错误处理", () => {
  it("a = 0 拒绝", () => {
    expect(solveRatio("find-d", "0", "4", "3")).toEqual({
      ok: false,
      error: {
        code: "ZERO_RATIO_TERM",
        message: "比例项 a、b 不能为 0",
      },
    });
  });

  it("b = 0 拒绝", () => {
    expect(solveRatio("find-c", "2", "0", "6")).toEqual({
      ok: false,
      error: {
        code: "ZERO_RATIO_TERM",
        message: "比例项 a、b 不能为 0",
      },
    });
  });

  it("非数字拒绝", () => {
    expect(solveRatio("find-d", "x", "4", "3").ok).toBe(false);
  });

  it("空字符串拒绝", () => {
    expect(solveRatio("find-d", "", "4", "3").ok).toBe(false);
  });
});
