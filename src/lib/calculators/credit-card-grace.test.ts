import { describe, expect, it } from "vitest";
import { calculateCreditGrace } from "./credit-card-grace";

const calc = (
  year: string,
  month: string,
  day: string,
  statementDay = "10",
  graceN = "20",
) =>
  calculateCreditGrace({
    consumeYear: year,
    consumeMonth: month,
    consumeDay: day,
    statementDay,
    graceN,
  });

describe("creditCardGrace / 账单周期判定与典型场景", () => {
  it("账单日当天消费计入本期账单：2026-09-10、账单日 10、N=20", () => {
    const r = calc("2026", "9", "10", "10", "20");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cycleLabel).toBe("本期账单");
      expect(r.billDateText).toBe("2026-09-10");
      expect(r.dueDateText).toBe("2026-09-30");
      expect(r.dueYear).toBe(2026);
      expect(r.dueMonth).toBe(9);
      expect(r.dueDay).toBe(30);
      expect(r.graceDays).toBe(20); // 9/10~9/30 自然日差 = N
    }
  });

  it("账单日次日消费计入下期账单（最长免息期）：2026-09-11、账单日 10、N=20", () => {
    const r = calc("2026", "9", "11", "10", "20");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cycleLabel).toBe("下期账单");
      expect(r.billDateText).toBe("2026-10-10");
      expect(r.dueDateText).toBe("2026-10-30");
      expect(r.graceDays).toBe(49); // 9/11~10/30 自然日差 = N+29
    }
  });

  it("tipText 含「免息期最长约 N+29 天」提示", () => {
    const r = calc("2026", "9", "11", "10", "20");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.tipText).toContain("免息期最长约 49 天");
      expect(r.tipText).toContain("最短约 20 天");
    }
  });
});

describe("creditCardGrace / 闰年与跨年", () => {
  it("闰年 2 月消费、账单日后跨闰月末：2024-02-20、账单日 15、N=20", () => {
    const r = calc("2024", "2", "20", "15", "20");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cycleLabel).toBe("下期账单");
      expect(r.billDateText).toBe("2024-03-15");
      expect(r.dueDateText).toBe("2024-04-04"); // 3/15 + 20 天
      expect(r.graceDays).toBe(44); // 2/20~4/4 自然日差（闰年 2 月 29 天）
    }
  });

  it("闰年 2 月账单日加 N 天跨过 2/29：2024-02-10、账单日 15、N=20", () => {
    const r = calc("2024", "2", "10", "15", "20");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cycleLabel).toBe("本期账单");
      expect(r.dueDateText).toBe("2024-03-06"); // 2/15 + 20 天（闰月 29 天进位）
      expect(r.graceDays).toBe(25);
    }
  });

  it("平年 2 月（28 天）：2025-02-20、账单日 15、N=20", () => {
    const r = calc("2025", "2", "20", "15", "20");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.billDateText).toBe("2025-03-15");
      expect(r.dueDateText).toBe("2025-04-04");
      expect(r.graceDays).toBe(43);
    }
  });

  it("12 月本期账单跨年还款：2026-12-10、账单日 15、N=20", () => {
    const r = calc("2026", "12", "10", "15", "20");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cycleLabel).toBe("本期账单");
      expect(r.dueDateText).toBe("2027-01-04"); // 12/15 + 20 天进到次年
      expect(r.graceDays).toBe(25);
    }
  });

  it("12 月下期账单跨年再跨 2 月：2026-12-28、账单日 10、N=30", () => {
    const r = calc("2026", "12", "28", "10", "30");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cycleLabel).toBe("下期账单");
      expect(r.billDateText).toBe("2027-01-10");
      expect(r.dueDateText).toBe("2027-02-09"); // 1/10 + 30 天
      expect(r.graceDays).toBe(43);
    }
  });

  it("闰日当天合法：2024-02-29、账单日 1、N=10（次日消费计入下期）", () => {
    const r = calc("2024", "2", "29", "1", "10");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cycleLabel).toBe("下期账单");
      expect(r.billDateText).toBe("2024-03-01");
      expect(r.dueDateText).toBe("2024-03-11"); // 3/1 + 10 天
      expect(r.graceDays).toBe(11); // 2/29~3/11 自然日差
    }
  });
});

describe("creditCardGrace / N 与账单日边界", () => {
  it("N=10 下限、账单日 1：2026-05-01 → 还款日 2026-05-11", () => {
    const r = calc("2026", "5", "1", "1", "10");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.dueDateText).toBe("2026-05-11");
      expect(r.graceDays).toBe(10);
    }
  });

  it("账单日 28 + N=30 上限：2026-04-28 → 还款日 2026-05-28", () => {
    const r = calc("2026", "4", "28", "28", "30");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cycleLabel).toBe("本期账单");
      expect(r.dueDateText).toBe("2026-05-28");
      expect(r.graceDays).toBe(30);
    }
  });
});

describe("creditCardGrace / 错误处理", () => {
  it("空值拒绝并定位字段", () => {
    const empty = calculateCreditGrace({
      consumeYear: "",
      consumeMonth: "",
      consumeDay: "",
      statementDay: "",
      graceN: "",
    });
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.error.code).toBe("EMPTY");
      expect(empty.error.field).toBe("year");
    }
    const noGrace = calc("2026", "9", "10", "10", "");
    expect(noGrace.ok).toBe(false);
    if (!noGrace.ok) {
      expect(noGrace.error.code).toBe("EMPTY");
      expect(noGrace.error.field).toBe("grace");
    }
  });

  it("非法字符拒绝", () => {
    const r = calc("abc", "9", "10");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_NUMBER");
    const g = calc("2026", "9", "10", "10", "20.5"); // 非整数
    expect(g.ok).toBe(false);
    if (!g.ok) {
      expect(g.error.code).toBe("INVALID_NUMBER");
      expect(g.error.field).toBe("grace");
    }
  });

  it("年份 1900~2100 之外拒绝", () => {
    for (const y of ["1899", "2101"]) {
      const r = calc(y, "9", "10");
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error.code).toBe("OUT_OF_RANGE");
        expect(r.error.field).toBe("year");
      }
    }
  });

  it("月份/日期非法拒绝（含非闰年 2/29 与 4/31）", () => {
    const m = calc("2026", "13", "10");
    expect(m.ok).toBe(false);
    if (!m.ok) {
      expect(m.error.code).toBe("INVALID_DATE");
      expect(m.error.field).toBe("month");
    }
    const apr31 = calc("2026", "4", "31");
    expect(apr31.ok).toBe(false);
    if (!apr31.ok) {
      expect(apr31.error.code).toBe("INVALID_DATE");
      expect(apr31.error.field).toBe("day");
    }
    const feb29 = calc("2023", "2", "29"); // 2023 非闰年
    expect(feb29.ok).toBe(false);
    if (!feb29.ok) {
      expect(feb29.error.code).toBe("INVALID_DATE");
      expect(feb29.error.field).toBe("day");
    }
  });

  it("账单日 1~28 之外拒绝", () => {
    for (const s of ["0", "29"]) {
      const r = calc("2026", "9", "10", s, "20");
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error.code).toBe("OUT_OF_RANGE");
        expect(r.error.field).toBe("statement");
      }
    }
  });

  it("还款宽限天数 N 10~30 之外拒绝", () => {
    for (const n of ["9", "31"]) {
      const r = calc("2026", "9", "10", "10", n);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error.code).toBe("OUT_OF_RANGE");
        expect(r.error.field).toBe("grace");
      }
    }
  });
});
