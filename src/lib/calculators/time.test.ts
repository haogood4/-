import { describe, expect, it } from "vitest";
import { convertTime } from "./time";

const cv = (value: string, from: string, to: string) =>
  convertTime({ value, from, to });

describe("convertTime / 典型换算", () => {
  it("1 小时 → 分钟 = 60", () => {
    const r = cv("1", "h", "min");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("60");
  });

  it("1 天 → 秒 = 86400", () => {
    const r = cv("1", "d", "s");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("86400");
  });

  it("1 周 → 天 = 7", () => {
    const r = cv("1", "wk", "d");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("7");
  });

  it("1 年（平均）→ 天 ≈ 365.2425", () => {
    const r = cv("1", "yr", "d");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("365.2425");
  });

  it("1 月（平均）→ 小时 ≈ 730.485", () => {
    const r = cv("1", "month", "h");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("730.485");
  });

  it("1 秒 → 毫秒 = 1000", () => {
    const r = cv("1", "s", "ms");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000");
  });

  it("同单位 90 min → min = 90", () => {
    const r = cv("90", "min", "min");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(90);
  });
});

describe("convertTime / 错误处理", () => {
  it("空值 / 非法 / 0 / 未知单位均拒绝", () => {
    expect(cv("", "h", "min").ok).toBe(false);
    expect(cv("1h", "h", "min").ok).toBe(false);
    expect(cv("0", "h", "min").ok).toBe(false);
    expect(cv("1", "decade", "yr").ok).toBe(false);
  });

  it("边界值 1e15 毫秒允许", () => {
    expect(cv("1000000000000000", "ms", "s").ok).toBe(true);
  });
});
