import { describe, expect, it } from "vitest";
import { formatDate } from "./date-format";

const run = (raw: string, pattern = "YYYY-MM-DD HH:mm:ss", utcOffset = 0) =>
  formatDate({ raw, pattern, utcOffset });

const ok = (raw: string, pattern = "YYYY-MM-DD HH:mm:ss", utcOffset = 0) => {
  const r = run(raw, pattern, utcOffset);
  if (!r.ok)
    throw new Error(`期望成功，实际 ${r.error.code}: ${r.error.message}`);
  return r;
};

describe("date-format / 分隔符日期", () => {
  it("2026-09-20（年-月-日）", () => {
    expect(ok("2026-09-20", "YYYY-MM-DD").formatted).toBe("2026-09-20");
  });

  it("2026/9/20（斜杠 + 单位数月日）", () => {
    expect(ok("2026/9/20", "YYYY-MM-DD").formatted).toBe("2026-09-20");
  });

  it("2026.09.20（点分隔）", () => {
    expect(ok("2026.09.20", "YYYY-MM-DD").formatted).toBe("2026-09-20");
  });

  it("2026-09-20 14:30:00（带时间）", () => {
    const r = ok("2026-09-20 14:30:00");
    expect(r.formatted).toBe("2026-09-20 14:30:00");
  });

  it("2026年9月20日（中文年月日）", () => {
    expect(ok("2026年9月20日", "YYYY-MM-DD").formatted).toBe("2026-09-20");
  });

  it("20/09/2026（日月年在后，首段 >12 判为日）", () => {
    expect(ok("20/09/2026", "YYYY-MM-DD").formatted).toBe("2026-09-20");
  });

  it("09/20/2026（月日年在后，第二段 >12 判为日）", () => {
    expect(ok("09/20/2026", "YYYY-MM-DD").formatted).toBe("2026-09-20");
  });

  it("01/02/2026（两段均 ≤12 时默认美式 MM/DD/YYYY）", () => {
    expect(ok("01/02/2026", "YYYY-MM-DD").formatted).toBe("2026-01-02");
  });
});

describe("date-format / 紧凑与时间戳", () => {
  it("紧凑 20260920", () => {
    expect(ok("20260920", "YYYY-MM-DD").formatted).toBe("2026-09-20");
  });

  it("10 位 Unix 秒按 utcOffset=480 换算", () => {
    const r = ok("1700000000", "YYYY-MM-DD HH:mm:ss", 480);
    expect(r.formatted).toBe("2023-11-15 06:13:20");
    expect(r.timestampSec).toBe(1700000000);
  });

  it("13 位 Unix 毫秒（utcOffset=0）", () => {
    const r = ok("1700000000123");
    expect(r.formatted).toBe("2023-11-14 22:13:20");
    expect(r.timestampMs).toBe(1700000000123);
    expect(r.iso).toBe("2023-11-14T22:13:20.123Z");
  });

  it("非 8/10/13 位纯数字报 UNPARSEABLE", () => {
    const r = run("1234567");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNPARSEABLE");
  });
});

describe("date-format / ISO 8601 带时区", () => {
  it("Z 时刻按 utcOffset=480 换算为北京时间", () => {
    const r = ok("2026-09-20T16:00:00Z", "YYYY-MM-DD HH:mm:ss", 480);
    expect(r.formatted).toBe("2026-09-21 00:00:00");
    expect(r.iso).toBe("2026-09-21T00:00:00+08:00");
  });

  it("+08:00 偏移换算到 UTC", () => {
    const r = ok("2026-09-20T14:30:00+08:00");
    expect(r.formatted).toBe("2026-09-20 06:30:00");
  });

  it("-05:00 偏移（无冒号 ±HHMM 也支持）换算到 +480", () => {
    const r = ok("2026-09-20T14:30:00-0500", "YYYY-MM-DD HH:mm:ss", 480);
    expect(r.formatted).toBe("2026-09-21 03:30:00");
  });
});

describe("date-format / 星期、年内天数与闰年", () => {
  it("2026-09-20 是周日、年内第 263 天、非闰年", () => {
    const r = ok("2026-09-20", "YYYY-MM-DD");
    expect(r.weekday).toBe("周日");
    expect(r.dayOfYear).toBe(263);
    expect(r.isLeapYear).toBe(false);
    expect(r.daysInYear).toBe(365);
  });

  it("闰年 2024-03-01 是年内第 61 天", () => {
    const r = ok("2024-03-01", "YYYY-MM-DD");
    expect(r.dayOfYear).toBe(61);
    expect(r.isLeapYear).toBe(true);
    expect(r.daysInYear).toBe(366);
  });

  it("2024-02-29 闰年合法", () => {
    expect(ok("2024-02-29", "YYYY-MM-DD").formatted).toBe("2024-02-29");
  });

  it("2023-02-29 平年非法 → INVALID_DATE", () => {
    const r = run("2023-02-29");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_DATE");
  });

  it("2026-02-30 非法 → INVALID_DATE", () => {
    const r = run("2026-02-30");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_DATE");
  });

  it("13 月非法 → INVALID_DATE", () => {
    const r = run("2026-13-01");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_DATE");
  });
});

describe("date-format / pattern 模板", () => {
  it("YYYY/MM/DD HH:mm:ss 全 token", () => {
    expect(ok("2026-09-20 07:05:09", "YYYY/MM/DD HH:mm:ss").formatted).toBe(
      "2026/09/20 07:05:09",
    );
  });

  it("YY-M-D 短 token 不补零", () => {
    expect(ok("2026-09-20", "YY-M-D").formatted).toBe("26-9-20");
  });

  it("YYYY年MM月DD日 中文字面量透传", () => {
    expect(ok("2026-09-20", "YYYY年MM月DD日").formatted).toBe("2026年09月20日");
  });

  it("字面量透传（含 T 与冒号）", () => {
    expect(ok("2026-09-20 14:30:00", "日期: YYYY-MM-DDTHH:mm").formatted).toBe(
      "日期: 2026-09-20T14:30",
    );
  });

  it("空 pattern 回退 YYYY-MM-DD", () => {
    expect(ok("2026-09-20 14:30:00", "").formatted).toBe("2026-09-20");
  });
});

describe("date-format / 时间戳输出与错误处理", () => {
  it("naive 日期按 utcOffset 挂钟计算时间戳", () => {
    const r = ok("2026-09-20", "YYYY-MM-DD", 480);
    expect(r.timestampMs).toBe(Date.UTC(2026, 8, 20) - 480 * 60_000);
    expect(r.timestampSec).toBe(
      Math.floor(Date.UTC(2026, 8, 20) / 1000) - 480 * 60,
    );
  });

  it("空输入 → UNPARSEABLE", () => {
    const r = run("   ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNPARSEABLE");
  });

  it("乱码输入 → UNPARSEABLE", () => {
    const r = run("hello world 你好");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNPARSEABLE");
  });

  it("残缺输入 2026-09 → UNPARSEABLE", () => {
    const r = run("2026-09");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNPARSEABLE");
  });

  it("非法输入绝不 throw", () => {
    expect(() => run("%%%")).not.toThrow();
    expect(() => run("9999-99-99")).not.toThrow();
  });
});
