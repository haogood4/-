import { describe, expect, it } from "vitest";
import { calculateLawsuitFee } from "./lawsuit-fee-cn";

const cv = (caseType: string, amount: string) =>
  calculateLawsuitFee({ caseType, amount });

describe("lawsuitFee / 财产案件速算法（附表逐档，分段累计核验）", () => {
  it("≤1 万元：定额 50 元", () => {
    const r = cv("property", "5000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(50);
  });

  it("1 万元（档分界）仍按 50 元", () => {
    const r = cv("property", "10000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(50);
  });

  it("5 万元（1~10 万档）：50000 × 2.5% − 200 = 1050", () => {
    const r = cv("property", "50000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(1050);
  });

  it("10 万元（1~10 万档上界）：100000 × 2.5% − 200 = 2300", () => {
    const r = cv("property", "100000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(2300);
  });

  it("15 万（10~20 万档）：150000 × 2% + 300 = 3300", () => {
    const r = cv("property", "150000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(3300);
  });

  it("20 万元（10~20 万档上界）：200000 × 2% + 300 = 4300（分段累计 2300+2000）", () => {
    const r = cv("property", "200000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(4300);
  });

  it("30 万（20~50 万档）：300000 × 1.5% + 1300 = 5800", () => {
    const r = cv("property", "300000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(5800);
  });

  it("50 万（20~50 万档上界）：500000 × 1.5% + 1300 = 8800（分段累计 4300+4500）", () => {
    const r = cv("property", "500000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(8800);
  });

  it("80 万（50~100 万档）：800000 × 1% + 3800 = 11800", () => {
    const r = cv("property", "800000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(11800);
  });

  it("100 万元（50~100 万档上界）：1000000 × 1% + 3800 = 13800（分段累计 8800+5000）", () => {
    const r = cv("property", "1000000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(13800);
  });

  it("5000 万（最高档）：50000000 × 0.5% + 41800 = 291800", () => {
    const r = cv("property", "50000000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(291800);
  });
});

describe("lawsuitFee / 非财产案件 + 离婚", () => {
  it("劳动争议：固定 10 元", () => {
    const r = cv("labor", "0");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(10);
  });

  it("其他非财产：上限 100 元", () => {
    const r = cv("other", "0");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(100);
  });

  it("离婚无财产：上限 300 元", () => {
    const r = cv("divorce", "0");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(300);
  });

  it("离婚财产 20 万：仍按 300 元", () => {
    const r = cv("divorce", "200000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(300);
  });

  it("离婚财产 50 万：300 + 30 万 × 0.5% = 1800", () => {
    const r = cv("divorce", "500000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.fee).toBe(1800);
  });
});

describe("lawsuitFee / 错误处理", () => {
  it("空金额拒绝（EMPTY）", () => {
    const r = cv("property", "");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("非法字符与科学计数法拒绝（INVALID_NUMBER）", () => {
    expect(cv("property", "abc").ok).toBe(false);
    const sci = cv("property", "1e5");
    expect(sci.ok).toBe(false);
    if (!sci.ok) expect(sci.error.code).toBe("INVALID_NUMBER");
  });

  it("3 位小数拒绝，2 位合法", () => {
    const many = cv("property", "8000.123");
    expect(many.ok).toBe(false);
    if (!many.ok) expect(many.error.code).toBe("TOO_MANY_DECIMALS");
    expect(cv("property", "8000.55").ok).toBe(true);
  });

  it("0 / 负数 / 10 亿以上 拒绝（OUT_OF_RANGE）", () => {
    const zero = cv("property", "0");
    expect(zero.ok).toBe(false);
    if (!zero.ok) expect(zero.error.code).toBe("OUT_OF_RANGE");
    const neg = cv("property", "-100");
    expect(neg.ok).toBe(false);
    if (!neg.ok) expect(neg.error.code).toBe("OUT_OF_RANGE");
    const over = cv("property", "1000000001");
    expect(over.ok).toBe(false);
    if (!over.ok) expect(over.error.code).toBe("OUT_OF_RANGE");
  });
});
