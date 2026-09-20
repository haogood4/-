import { describe, expect, it } from "vitest";
import { calculateStockCommission } from "./stock-commission";

const cv = (
  price: string,
  shares: string,
  direction: "buy" | "sell",
  rate = "2.5",
  minFee = "5",
  stampTaxRate = "5",
  transferFeeRate = "0.1",
) =>
  calculateStockCommission({
    price,
    shares,
    rate,
    minFee,
    stampTaxRate,
    transferFeeRate,
    direction,
  });

describe("stockCommission / 典型场景（费率口径：‱ 万分之一；0.1‱ = 0.01‰ 公示值）", () => {
  it("买入 ¥10 × 1000 股，2.5‱ 佣金", () => {
    const r = cv("10", "1000", "buy");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.grossAmount).toBe(10000);
      expect(r.brokerFee).toBe(5); // 10000 * 2.5/10000 = 2.5；不足 5 按 5
      expect(r.transferFee).toBe(0.1); // 10000 * 0.1/10000 = 0.1（官方 0.01‰）
      expect(r.stampTax).toBe(0);
      expect(r.totalCost).toBe(5.1);
      expect(r.netCashFlow).toBe(-10005.1);
    }
  });

  it("卖出 ¥10 × 1000 股，2.5‱ 佣金 + 5‱ 印花税（0.5‰ = 5‱）", () => {
    const r = cv("10", "1000", "sell");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.stampTax).toBe(5); // 10000 * 5/10000 = 5
      expect(r.totalCost).toBe(5 + 0.1 + 5);
      expect(r.netCashFlow).toBeCloseTo(10000 - 5 - 0.1 - 5, 5);
    }
  });

  it("大额成交：¥100 × 10000 股，2.5‱ 佣金（超过最低起收）", () => {
    const r = cv("100", "10000", "buy");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.brokerFee).toBe(250); // 1000000 * 2.5 / 10000
      expect(r.transferFee).toBe(10); // 1000000 * 0.1 / 10000
    }
  });
});

describe("stockCommission / 费率与最低起收变更", () => {
  it("0.641‱（2026-05 媒体调查新客最低费率）：¥10 × 1000 → 0.641 元，按 5 元起收", () => {
    const r = cv("10", "1000", "buy", "0.641");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.brokerFee).toBe(5);
  });

  it("自定义最低起收 1 元：0.641‱ × 10000 = 0.641 < 1，按 1 元", () => {
    const r = cv("10", "1000", "buy", "0.641", "1");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.brokerFee).toBe(1);
  });

  it("自定义过户费 0.5‱：¥100 × 10000 股 → ¥50", () => {
    const r = cv("100", "10000", "buy", "2.5", "5", "5", "0.5");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.transferFee).toBe(50); // 1000000 * 0.5 / 10000 = 50
  });
});

describe("stockCommission / 错误处理", () => {
  it("空值拒绝", () => {
    expect(cv("", "1000", "buy").ok).toBe(false);
    expect(cv("10", "", "buy").ok).toBe(false);
    expect(cv("10", "1000", "buy", "").ok).toBe(false);
  });

  it("非法字符 / 0 / 负数拒绝", () => {
    expect(cv("abc", "1000", "buy").ok).toBe(false);
    expect(cv("0", "1000", "buy").ok).toBe(false);
    expect(cv("10", "0", "buy").ok).toBe(false);
    expect(cv("-1", "1000", "buy").ok).toBe(false);
  });

  it("费率超 100‱ 拒绝", () => {
    expect(cv("10", "1000", "buy", "200").ok).toBe(false);
  });

  it("小数 > 6 位拒绝", () => {
    expect(cv("10.1234567", "1000", "buy").ok).toBe(false);
  });

  it("未知方向拒绝", () => {
    const r = calculateStockCommission({
      price: "10",
      shares: "1000",
      rate: "2.5",
      minFee: "5",
      stampTaxRate: "5",
      transferFeeRate: "0.1",
      direction: "hold",
    });
    expect(r.ok).toBe(false);
  });
});
