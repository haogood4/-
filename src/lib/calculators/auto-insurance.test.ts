import { describe, expect, it } from "vitest";
import { calculateAutoInsurance } from "./auto-insurance";

const cv = (
  seatType: "under6" | "over6",
  noClaimYears: "0" | "1" | "2" | "3",
  regionClass: "A" | "B" | "C" | "D" | "E",
  commercialBase = "",
  claims: "0" | "1" | "2" | "3" | "5plus" = "0",
) =>
  calculateAutoInsurance({
    seatType,
    noClaimYears,
    claims,
    regionClass,
    commercialBase,
  });

describe("autoInsurance / 交强险无出险折扣（2026-06-01 新浮动机制）", () => {
  it("6 座以下、连续 2 年无出险、A 类地区：950×0.8=760", () => {
    const r = cv("under6", "2", "A");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.compulsoryBase).toBe(950);
      expect(r.compulsoryRate).toBe(0.8);
      expect(r.compulsoryPremium).toBe(760);
      expect(r.commercialPremium).toBe(0);
      expect(r.totalPremium).toBe(760);
    }
  });

  it("连续 3 年及以上无出险按地区浮动：A=0.5 → 475", () => {
    const r = cv("under6", "3", "A");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.compulsoryPremium).toBe(475);
  });

  it("B=0.55 → 522.5；C=0.6 → 570", () => {
    const rb = cv("under6", "3", "B");
    expect(rb.ok).toBe(true);
    if (rb.ok) expect(rb.compulsoryPremium).toBe(522.5);
    const rc = cv("under6", "3", "C");
    expect(rc.ok).toBe(true);
    if (rc.ok) expect(rc.compulsoryPremium).toBe(570);
  });

  it("D=0.65 → 617.5；E=0.7 → 665", () => {
    const rd = cv("under6", "3", "D");
    expect(rd.ok).toBe(true);
    if (rd.ok) expect(rd.compulsoryPremium).toBe(617.5);
    const re = cv("under6", "3", "E");
    expect(re.ok).toBe(true);
    if (re.ok) expect(re.compulsoryPremium).toBe(665);
  });

  it("6 座及以上基础保费 1100：无出险记录系数 1.0 → 1100", () => {
    const r = cv("over6", "0", "A");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.compulsoryBase).toBe(1100);
      expect(r.compulsoryRate).toBe(1.0);
      expect(r.compulsoryPremium).toBe(1100);
    }
  });

  it("1 年无出险 0.9、2 年 0.8 档位正确", () => {
    const r1 = cv("under6", "1", "E");
    expect(r1.ok).toBe(true);
    if (r1.ok) expect(r1.compulsoryRate).toBe(0.9);
    const r2 = cv("under6", "2", "E");
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.compulsoryRate).toBe(0.8);
  });
});

describe("autoInsurance / 有责出险上浮（覆盖无出险折扣）", () => {
  it("出险 1 次 → 1.0（即使连续 3 年无出险也被覆盖），NCD 回 1.0", () => {
    const r = cv("under6", "3", "A", "", "1");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.compulsoryRate).toBe(1.0);
      expect(r.compulsoryPremium).toBe(950);
      expect(r.ncdRate).toBe(1.0);
    }
  });

  it("出险 2 次 → 1.2 → 1140；3 次 → 1.5 → 1425；5 次及以上 → 2.0 → 1900", () => {
    const r2 = cv("under6", "0", "A", "", "2");
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.compulsoryPremium).toBe(1140);
    const r3 = cv("under6", "0", "A", "", "3");
    expect(r3.ok).toBe(true);
    if (r3.ok) expect(r3.compulsoryPremium).toBe(1425);
    const r5 = cv("under6", "0", "A", "", "5plus");
    expect(r5.ok).toBe(true);
    if (r5.ok) expect(r5.compulsoryPremium).toBe(1900);
  });

  it("6 座及以上出险 5 次及以上：1100×2.0=2200", () => {
    const r = cv("over6", "0", "E", "", "5plus");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.compulsoryPremium).toBe(2200);
  });
});

describe("autoInsurance / 商业险 NCD 折扣", () => {
  it("基准保费 3000、连续 2 年无出险：NCD 0.7 → 2100，合计 2860", () => {
    const r = cv("under6", "2", "A", "3000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.ncdRate).toBe(0.7);
      expect(r.commercialPremium).toBe(2100);
      expect(r.totalPremium).toBe(2860);
      expect(r.formulaText).toContain("2860.00");
    }
  });

  it("基准保费 100、1 年无出险：NCD 0.85 → 85，合计 940", () => {
    const r = cv("under6", "1", "E", "100");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.commercialPremium).toBeCloseTo(85, 10);
      expect(r.totalPremium).toBeCloseTo(940, 10);
    }
  });

  it("6 座及以上、3 年无出险、E 类、基准 2000：NCD 0.6 → 合计 1970", () => {
    const r = cv("over6", "3", "E", "2000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.compulsoryPremium).toBe(770); // 1100×0.7
      expect(r.commercialPremium).toBe(1200); // 2000×0.6
      expect(r.totalPremium).toBe(1970);
    }
  });

  it("出险后商业险 NCD 回 1.0（上浮不纳入引擎）", () => {
    const r = cv("under6", "2", "A", "3000", "2");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.ncdRate).toBe(1.0);
      expect(r.commercialPremium).toBe(3000);
    }
  });
});

describe("autoInsurance / 商业险基准保费校验", () => {
  it("上边界 500,000 可算，超界 500,000.01 拒绝", () => {
    expect(cv("under6", "0", "A", "500000").ok).toBe(true);
    expect(cv("under6", "0", "A", "500000.01").ok).toBe(false);
  });

  it("低于下限 99.99 拒绝（须 100~500,000 或留空）", () => {
    const r = cv("under6", "0", "A", "99.99");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });

  it("负数、非法字符、3 位小数拒绝", () => {
    const rn = cv("under6", "0", "A", "-100");
    expect(rn.ok).toBe(false);
    if (!rn.ok) expect(rn.error.code).toBe("NEGATIVE");
    const re = cv("under6", "0", "A", "abc");
    expect(re.ok).toBe(false);
    if (!re.ok) expect(re.error.code).toBe("INVALID_NUMBER");
    const rd = cv("under6", "0", "A", "100.001");
    expect(rd.ok).toBe(false);
    if (!rd.ok) expect(rd.error.code).toBe("INVALID_NUMBER");
  });

  it("留空视为不计算商业险（commercialPremium=0）", () => {
    const r = cv("under6", "0", "A", "");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.commercialPremium).toBe(0);
  });
});

describe("autoInsurance / 枚举字段校验", () => {
  it("座位数类型非法拒绝", () => {
    const r = calculateAutoInsurance({
      seatType: "under7",
      noClaimYears: "0",
      claims: "0",
      regionClass: "A",
      commercialBase: "",
    });
    expect(r.ok).toBe(false);
  });

  it("地区类别 F 拒绝", () => {
    const r = calculateAutoInsurance({
      seatType: "under6",
      noClaimYears: "0",
      claims: "0",
      regionClass: "F",
      commercialBase: "",
    });
    expect(r.ok).toBe(false);
  });

  it("无出险年数与出险次数非法值拒绝", () => {
    const r1 = calculateAutoInsurance({
      seatType: "under6",
      noClaimYears: "4",
      claims: "0",
      regionClass: "A",
      commercialBase: "",
    });
    expect(r1.ok).toBe(false);
    const r2 = calculateAutoInsurance({
      seatType: "under6",
      noClaimYears: "0",
      claims: "4",
      regionClass: "A",
      commercialBase: "",
    });
    expect(r2.ok).toBe(false);
  });
});
