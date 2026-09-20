import { describe, expect, it } from "vitest";
import { calculateExchange } from "./currency-exchange-cn";

describe("currency-exchange-cn", () => {
  it("100 USD 汇率 7.25 → CNY", () => {
    const r = calculateExchange({
      amount: "100",
      rate: "7.25",
      from: "USD",
      to: "CNY",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.converted).toBeCloseTo(725, 6);
  });
  it("10000 JPY 汇率 0.05 → CNY", () => {
    const r = calculateExchange({
      amount: "10000",
      rate: "0.05",
      from: "JPY",
      to: "CNY",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.converted).toBeCloseTo(500, 6);
  });
  it("汇率为 0 拒绝", () => {
    const r = calculateExchange({
      amount: "100",
      rate: "0",
      from: "USD",
      to: "CNY",
    });
    expect(r.ok).toBe(false);
  });
});
