import { describe, expect, it } from "vitest";
import { calculateTransferFee } from "./interbank-transfer-fee";

const cv = (
  amount: string,
  channel: "counter" | "netbank" | "mobile" | "atm",
) => calculateTransferFee({ amount, channel });

describe("transferFee / 柜台政府指导价分档（发改价格〔2014〕268 号）", () => {
  it("1000 元 → 2 元/笔（≤2000 档）", () => {
    const r = cv("1000", "counter");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.fee).toBe(2);
      expect(r.counterFee).toBe(2);
    }
  });

  it("边界 2000 元 → 2 元（含）；2000.01 元 → 5 元", () => {
    const r1 = cv("2000", "counter");
    expect(r1.ok).toBe(true);
    if (r1.ok) expect(r1.fee).toBe(2);
    const r2 = cv("2000.01", "counter");
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.fee).toBe(5);
  });

  it("边界 5000 元 → 5 元（含）；5000.01 元 → 10 元", () => {
    const r1 = cv("5000", "counter");
    expect(r1.ok).toBe(true);
    if (r1.ok) expect(r1.fee).toBe(5);
    const r2 = cv("5000.01", "counter");
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.fee).toBe(10);
  });

  it("边界 10000 元 → 10 元（含）；10000.01 元 → 15 元", () => {
    const r1 = cv("10000", "counter");
    expect(r1.ok).toBe(true);
    if (r1.ok) expect(r1.fee).toBe(10);
    const r2 = cv("10000.01", "counter");
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.fee).toBe(15);
  });

  it("边界 50000 元 → 15 元（含）；50000.01 元按 0.03% = 15.00 元", () => {
    const r1 = cv("50000", "counter");
    expect(r1.ok).toBe(true);
    if (r1.ok) expect(r1.fee).toBe(15);
    const r2 = cv("50000.01", "counter");
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.fee).toBeCloseTo(15.000003, 6);
  });

  it("100000 元按 0.03% → 30 元（未超上限）", () => {
    const r = cv("100000", "counter");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.fee).toBeCloseTo(30, 10); // 100000×0.0003 浮点误差
      expect(r.formulaText).toContain("0.03%");
    }
  });

  it("200000 元按 0.03% = 60 元，封顶 50 元/笔", () => {
    const r = cv("200000", "counter");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.fee).toBe(50);
      expect(r.formulaText).toContain("封顶");
    }
  });
});

describe("transferFee / 渠道折算", () => {
  it("网银 3000 元：柜台 5 元 × 40% = 2 元，fee 与对照价分开", () => {
    const r = cv("3000", "netbank");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.counterFee).toBe(5);
      expect(r.fee).toBeCloseTo(2, 10);
    }
  });

  it("网银 100000 元：柜台 30 元 × 40% = 12 元", () => {
    const r = cv("100000", "netbank");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBeCloseTo(12, 10);
  });

  it("手机银行 0 元；ATM 0 元（柜台对照价照常给出）", () => {
    const rm = cv("3000", "mobile");
    expect(rm.ok).toBe(true);
    if (rm.ok) {
      expect(rm.fee).toBe(0);
      expect(rm.counterFee).toBe(5);
      expect(rm.noteText).toContain("手机银行");
    }
    const ra = cv("3000", "atm");
    expect(ra.ok).toBe(true);
    if (ra.ok) {
      expect(ra.fee).toBe(0);
      expect(ra.noteText).toContain("ATM");
      expect(ra.noteText).toContain("5 万");
    }
  });

  it("柜台渠道 fee 与 counterFee 相同", () => {
    const r = cv("8000", "counter");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.fee).toBe(10);
      expect(r.counterFee).toBe(10);
      expect(r.noteText).toContain("268 号");
    }
  });
});

describe("transferFee / 金额校验", () => {
  it("下边界 0.01 元可算（≤2000 档 2 元）", () => {
    const r = cv("0.01", "counter");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(2);
  });

  it("上边界 10,000,000 元可算（封顶 50）；10,000,000.01 拒绝", () => {
    expect(cv("10000000", "counter").ok).toBe(true);
    expect(cv("10000000.01", "counter").ok).toBe(false);
  });

  it("0 元超出范围拒绝；负数拒绝", () => {
    const r0 = cv("0", "counter");
    expect(r0.ok).toBe(false);
    if (!r0.ok) expect(r0.error.code).toBe("OUT_OF_RANGE");
    const rn = cv("-100", "counter");
    expect(rn.ok).toBe(false);
    if (!rn.ok) expect(rn.error.code).toBe("NEGATIVE");
  });

  it("空值与非法字符拒绝", () => {
    const re = cv("", "counter");
    expect(re.ok).toBe(false);
    if (!re.ok) expect(re.error.code).toBe("EMPTY");
    const ri = cv("1,000", "counter");
    expect(ri.ok).toBe(false);
    if (!ri.ok) expect(ri.error.code).toBe("INVALID_NUMBER");
    expect(cv("abc", "counter").ok).toBe(false);
  });

  it("3 位小数拒绝（最多 2 位）", () => {
    const r = cv("1000.001", "counter");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_NUMBER");
  });

  it("渠道非法拒绝", () => {
    const r = calculateTransferFee({ amount: "1000", channel: "weixin" });
    expect(r.ok).toBe(false);
  });
});
