import { describe, expect, it } from "vitest";
import { calculateDiscount } from "./discount";

describe("calculateDiscount / 基础折扣", () => {
  it("200 减 20% → 实付 160、省 40", () => {
    expect(calculateDiscount("200", "20")).toEqual({
      ok: true,
      paid: 160,
      saved: 40,
      paidText: "160",
      savedText: "40",
      processText: "200 × (1 − 20 ÷ 100) = 160",
    });
  });
});

describe("calculateDiscount / 边界百分比", () => {
  it("0% → 实付等于原价、省 0", () => {
    const r = calculateDiscount("200", "0");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.paid).toBe(200);
      expect(r.saved).toBe(0);
      expect(r.paidText).toBe("200");
      expect(r.processText).toBe("200 × (1 − 0 ÷ 100) = 200");
    }
  });

  it("100% → 实付 0、省等于原价", () => {
    const r = calculateDiscount("200", "100");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.paid).toBe(0);
      expect(r.saved).toBe(200);
      expect(r.paidText).toBe("0");
      expect(r.processText).toBe("200 × (1 − 100 ÷ 100) = 0");
    }
  });
});

describe("calculateDiscount / 错误处理", () => {
  it("负价格拒绝", () => {
    expect(calculateDiscount("-10", "20")).toEqual({
      ok: false,
      error: { code: "NON_POSITIVE_PRICE", message: "原价必须大于 0" },
    });
  });

  it("0 价格拒绝", () => {
    expect(calculateDiscount("0", "20")).toEqual({
      ok: false,
      error: { code: "NON_POSITIVE_PRICE", message: "原价必须大于 0" },
    });
  });

  it("折扣 > 100 拒绝", () => {
    expect(calculateDiscount("100", "120")).toEqual({
      ok: false,
      error: {
        code: "DISCOUNT_OUT_OF_RANGE",
        message: "折扣百分比需在 0 到 100 之间",
      },
    });
  });

  it("折扣 < 0 拒绝", () => {
    expect(calculateDiscount("100", "-1")).toEqual({
      ok: false,
      error: {
        code: "DISCOUNT_OUT_OF_RANGE",
        message: "折扣百分比需在 0 到 100 之间",
      },
    });
  });

  it("非数字拒绝", () => {
    expect(calculateDiscount("abc", "20").ok).toBe(false);
    expect(calculateDiscount("100", "xx").ok).toBe(false);
  });
});
