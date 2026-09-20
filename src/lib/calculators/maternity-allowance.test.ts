import { describe, expect, it } from "vitest";
import { calculateMaternityAllowance } from "./maternity-allowance";

const cv = (
  avgWage: string,
  birthType: "normal" | "difficult",
  babies: string,
  daysOverride = "",
) => calculateMaternityAllowance({ avgWage, birthType, babies, daysOverride });

describe("maternityAllowance / 典型场景（÷30 × 计发天数）", () => {
  it("月薪 8000，自定义 158 天（江苏顺产口径）", () => {
    const r = cv("8000", "normal", "1", "158");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.days).toBe(158);
      expect(r.dailyBase).toBe(266.67); // 8000 ÷ 30 ≈ 266.667
      expect(r.allowance).toBeCloseTo(42133.33, 2);
      expect(r.formulaText).toContain("自定义 158 天");
    }
  });

  it("默认天数（留空）：顺产单胎 98 天", () => {
    const r = cv("8000", "normal", "1", "");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.days).toBe(98);
      expect(r.allowance).toBeCloseTo(26133.33, 2); // 266.667 × 98
    }
  });

  it("整除场景：月薪 6000 顺产 158 天 = 31600", () => {
    const r = cv("6000", "normal", "1", "158");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.dailyBase).toBe(200);
      expect(r.allowance).toBe(31600);
    }
  });

  it("难产 +15 天；多胞胎每多 1 婴 +15 天（叠加）", () => {
    const d1 = cv("8000", "difficult", "1", "");
    expect(d1.ok).toBe(true);
    if (d1.ok) expect(d1.days).toBe(113);
    const t2 = cv("8000", "normal", "2", "");
    expect(t2.ok).toBe(true);
    if (t2.ok) expect(t2.days).toBe(113);
    const dt = cv("8000", "difficult", "2", "");
    expect(dt.ok).toBe(true);
    if (dt.ok) expect(dt.days).toBe(128);
    const t3 = cv("8000", "normal", "3", "");
    expect(t3.ok).toBe(true);
    if (t3.ok) expect(t3.days).toBe(128);
    const dt3 = cv("8000", "difficult", "3", "");
    expect(dt3.ok).toBe(true);
    if (dt3.ok) expect(dt3.days).toBe(143);
  });

  it("六胞胎：98 + 15 × 5 = 173 天", () => {
    const r = cv("3000", "normal", "6", "");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.days).toBe(173);
      expect(r.dailyBase).toBe(100);
      expect(r.allowance).toBe(17300); // 3000 ÷ 30 × 173
    }
  });
});

describe("maternityAllowance / 边界与极值", () => {
  it("自定义天数 60 / 400 边界合法", () => {
    expect(cv("8000", "normal", "1", "60").ok).toBe(true);
    const hi = cv("8000", "normal", "1", "400");
    expect(hi.ok).toBe(true);
    if (hi.ok) expect(hi.days).toBe(400);
  });

  it("自定义天数 59 / 401 越界拒绝（OUT_OF_RANGE）", () => {
    const lo = cv("8000", "normal", "1", "59");
    expect(lo.ok).toBe(false);
    if (!lo.ok) {
      expect(lo.error.code).toBe("OUT_OF_RANGE");
      expect(lo.error.field).toBe("daysOverride");
    }
    expect(cv("8000", "normal", "1", "401").ok).toBe(false);
  });

  it("月薪上边界 1000000 合法；极大值拒绝", () => {
    expect(cv("1000000", "normal", "1", "").ok).toBe(true);
    expect(cv("1000001", "normal", "1", "").ok).toBe(false);
  });

  it("月薪极小值：0 与负数拒绝（OUT_OF_RANGE）", () => {
    const zero = cv("0", "normal", "1", "");
    expect(zero.ok).toBe(false);
    if (!zero.ok) expect(zero.error.code).toBe("OUT_OF_RANGE");
    const neg = cv("-8000", "normal", "1", "");
    expect(neg.ok).toBe(false);
    if (!neg.ok) expect(neg.error.code).toBe("OUT_OF_RANGE");
  });

  it("极大月薪计算不溢出：999999.99 × 98 天", () => {
    const r = cv("999999.99", "normal", "1", "");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.allowance).toBeCloseTo(3266666.63, 2);
  });
});

describe("maternityAllowance / 错误处理", () => {
  it("月薪空值 / 非法字符 / 科学计数法拒绝", () => {
    const empty = cv("", "normal", "1", "");
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error.code).toBe("EMPTY");
    const abc = cv("abc", "normal", "1", "");
    expect(abc.ok).toBe(false);
    if (!abc.ok) expect(abc.error.code).toBe("INVALID_NUMBER");
    const sci = cv("1e5", "normal", "1", "");
    expect(sci.ok).toBe(false);
    if (!sci.ok) expect(sci.error.code).toBe("INVALID_NUMBER");
  });

  it("月薪 3 位小数拒绝（TOO_MANY_DECIMALS），2 位合法", () => {
    const many = cv("8000.123", "normal", "1", "");
    expect(many.ok).toBe(false);
    if (!many.ok) expect(many.error.code).toBe("TOO_MANY_DECIMALS");
    expect(cv("8000.55", "normal", "1", "").ok).toBe(true);
  });

  it("婴儿数 0 / 7 越界、2.5 非整数、空值拒绝", () => {
    const zero = cv("8000", "normal", "0", "");
    expect(zero.ok).toBe(false);
    if (!zero.ok) {
      expect(zero.error.code).toBe("OUT_OF_RANGE");
      expect(zero.error.field).toBe("babies");
    }
    expect(cv("8000", "normal", "7", "").ok).toBe(false);
    const frac = cv("8000", "normal", "2.5", "");
    expect(frac.ok).toBe(false);
    if (!frac.ok) expect(frac.error.code).toBe("NOT_INTEGER");
    const empty = cv("8000", "normal", "", "");
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error.code).toBe("EMPTY");
  });

  it("未知生育类型拒绝（INVALID_BIRTH_TYPE）", () => {
    const r = calculateMaternityAllowance({
      avgWage: "8000",
      birthType: "c",
      babies: "1",
      daysOverride: "",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_BIRTH_TYPE");
      expect(r.error.field).toBe("birth");
    }
  });

  it("自定义天数非整数拒绝（NOT_INTEGER）", () => {
    const r = cv("8000", "normal", "1", "158.5");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NOT_INTEGER");
  });
});
