import { describe, expect, it } from "vitest";
import { convertTimestamp } from "./timestamp";

describe("convertTimestamp / to-date 秒", () => {
  it("unit=s value=0 → 1970-01-01 08:00:00（UTC+8）", () => {
    const r = convertTimestamp("0", "s", "to-date");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.formatted).toBe("1970-01-01 08:00:00");
  });

  it("unit=s value=1 → 1970-01-01 08:00:01", () => {
    const r = convertTimestamp("1", "s", "to-date");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.formatted).toBe("1970-01-01 08:00:01");
  });

  it("unit=s value=1700000000 → 2023-11-15 06:13:20（UTC+8）", () => {
    const r = convertTimestamp("1700000000", "s", "to-date");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.formatted).toBe("2023-11-15 06:13:20");
  });
});

describe("convertTimestamp / to-date 毫秒", () => {
  it("unit=ms value=0 → 1970-01-01 08:00:00", () => {
    const r = convertTimestamp("0", "ms", "to-date");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.formatted).toBe("1970-01-01 08:00:00");
  });

  it("unit=ms value=1 → 1970-01-01 08:00:00.001", () => {
    const r = convertTimestamp("1", "ms", "to-date");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.formatted).toBe("1970-01-01 08:00:00.001");
  });
});

describe("convertTimestamp / to-timestamp", () => {
  it("'2025-01-01 00:00'（UTC+8）→ 1735660800 秒", () => {
    const r = convertTimestamp("2025-01-01 00:00", "s", "to-timestamp");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.formatted).toBe("1735660800");
  });

  it("'2025-01-01 00:00'（UTC+8）→ 1735660800000 毫秒", () => {
    const r = convertTimestamp("2025-01-01 00:00", "ms", "to-timestamp");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.formatted).toBe("1735660800000");
  });

  it("接受空格或 T 分隔", () => {
    const r = convertTimestamp("2025-01-01T08:00", "s", "to-timestamp");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.formatted).toBe("1735689600");
  });
});

describe("convertTimestamp / 错误处理", () => {
  it("超界拒绝（to-date）", () => {
    expect(convertTimestamp("999999999999999", "ms", "to-date").ok).toBe(false);
    expect(convertTimestamp("-1", "s", "to-date").ok).toBe(false);
  });

  it("非法日期拒绝", () => {
    expect(convertTimestamp("2025-13-01 00:00", "s", "to-timestamp").ok).toBe(
      false,
    );
    expect(convertTimestamp("2025-02-30 00:00", "s", "to-timestamp").ok).toBe(
      false,
    );
    expect(convertTimestamp("abc", "s", "to-timestamp").ok).toBe(false);
  });

  it("非法数字拒绝（to-date）", () => {
    expect(convertTimestamp("abc", "s", "to-date").ok).toBe(false);
  });

  it("空字符串拒绝", () => {
    expect(convertTimestamp("", "s", "to-date").ok).toBe(false);
  });
});
