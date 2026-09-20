import { describe, expect, it } from "vitest";
import { calculateOvertimePay } from "./overtime-pay";

const cv = (salary: string, h1: string, h2: string, h3: string) =>
  calculateOvertimePay({
    monthlySalary: salary,
    hoursWorkday: h1,
    hoursWeekend: h2,
    hoursHoliday: h3,
  });

describe("overtimePay / 典型场景（月薪 ÷ 21.75 ÷ 8 折算小时工资）", () => {
  it("月薪 8000，延时 10h + 休息日 8h + 节假日 8h", () => {
    const r = cv("8000", "10", "8", "8");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.hourlyWage).toBe(45.98); // 8000/21.75/8 = 45.977...
      expect(r.workdayPay).toBe(689.66); // 45.977… × 1.5 × 10
      expect(r.weekendPay).toBe(735.63); // × 2 × 8
      expect(r.holidayPay).toBe(1103.45); // × 3 × 8
      expect(r.total).toBe(2528.74);
      expect(r.formulaText).toContain("21.75");
    }
  });

  it("只有工作日延时：8000 × 1.5 × 10h", () => {
    const r = cv("8000", "10", "0", "0");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.workdayPay).toBe(689.66);
      expect(r.weekendPay).toBe(0);
      expect(r.holidayPay).toBe(0);
      expect(r.total).toBe(689.66);
    }
  });

  it("只有法定节假日：8000 × 3 × 8h", () => {
    const r = cv("8000", "0", "0", "8");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.holidayPay).toBe(1103.45);
      expect(r.total).toBe(1103.45);
    }
  });

  it("留空小时按 0 处理：只填休息日 8h", () => {
    const r = cv("8000", "", "8", "");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.weekendPay).toBe(735.63);
      expect(r.total).toBe(735.63);
    }
  });

  it("小数小时合法（2 位以内）：2.25h", () => {
    const r = cv("2175", "2.25", "0", "0");
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 小时工资 = 2175/174 = 12.5；12.5 × 1.5 × 2.25 = 42.1875 → 42.19
      expect(r.hourlyWage).toBe(12.5);
      expect(r.workdayPay).toBe(42.19);
    }
  });
});

describe("overtimePay / 边界与极值", () => {
  it("极小月薪 1 元 + 最大 300h：total ≈ 2.59", () => {
    const r = cv("1", "300", "0", "0");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.workdayPay).toBe(2.59); // 1 × 1.5 × 300 ÷ 174
      expect(r.total).toBe(2.59);
    }
  });

  it("月薪 1000000（上边界）合法", () => {
    expect(cv("1000000", "1", "0", "0").ok).toBe(true);
  });

  it("月薪 0 / -8000 / 1000000.01 拒绝（OUT_OF_RANGE）", () => {
    expect(cv("0", "1", "0", "0").ok).toBe(false);
    const neg = cv("-8000", "1", "0", "0");
    expect(neg.ok).toBe(false);
    if (!neg.ok) expect(neg.error.code).toBe("OUT_OF_RANGE");
    expect(cv("1000000.01", "1", "0", "0").ok).toBe(false);
  });

  it("小时数 0/300 边界合法，301 拒绝", () => {
    expect(cv("8000", "0", "300", "0").ok).toBe(true);
    const over = cv("8000", "301", "0", "0");
    expect(over.ok).toBe(false);
    if (!over.ok) {
      expect(over.error.code).toBe("OUT_OF_RANGE");
      expect(over.error.field).toBe("h1");
    }
  });
});

describe("overtimePay / 错误处理", () => {
  it("月薪空值拒绝（EMPTY）", () => {
    const r = cv("", "1", "0", "0");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("月薪非法字符与科学计数法拒绝（INVALID_NUMBER）", () => {
    const abc = cv("abc", "1", "0", "0");
    expect(abc.ok).toBe(false);
    if (!abc.ok) expect(abc.error.code).toBe("INVALID_NUMBER");
    const sci = cv("1e5", "1", "0", "0");
    expect(sci.ok).toBe(false);
    if (!sci.ok) expect(sci.error.code).toBe("INVALID_NUMBER");
  });

  it("月薪 3 位小数拒绝，2 位合法", () => {
    const many = cv("8000.123", "1", "0", "0");
    expect(many.ok).toBe(false);
    if (!many.ok) expect(many.error.code).toBe("TOO_MANY_DECIMALS");
    expect(cv("8000.55", "1", "0", "0").ok).toBe(true);
  });

  it("负小时数拒绝（NEGATIVE_HOURS，定位到对应字段）", () => {
    const r = cv("8000", "1", "-5", "0");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("NEGATIVE_HOURS");
      expect(r.error.field).toBe("h2");
    }
  });

  it("小时数 3 位小数拒绝", () => {
    const r = cv("8000", "2.255", "0", "0");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOO_MANY_DECIMALS");
  });

  it("全 0 小时拒绝（NO_OVERTIME_HOURS）", () => {
    const r = cv("8000", "0", "0", "0");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("NO_OVERTIME_HOURS");
      expect(r.error.message).toContain("大于 0");
    }
  });
});
