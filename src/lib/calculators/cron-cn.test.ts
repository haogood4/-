import { describe, expect, it } from "vitest";
import { parseCron } from "./cron-cn";

describe("parseCron / 合法表达式", () => {
  it("通配符：每分钟执行一次", () => {
    const r = parseCron("* * * * *");
    expect(r.valid).toBe(true);
    if (r.valid) expect(r.desc).toBe("每分钟执行一次");
  });

  it("固定值：每天 03:30", () => {
    const r = parseCron("30 3 * * *");
    expect(r.valid).toBe(true);
    if (r.valid) {
      expect(r.desc).toContain("3 时30 分执行");
      expect(r.fields[0].values).toEqual([30]);
      expect(r.fields[1].values).toEqual([3]);
    }
  });

  it("步进 */15 → 分钟 0,15,30,45", () => {
    const r = parseCron("*/15 * * * *");
    expect(r.valid).toBe(true);
    if (r.valid) expect(r.fields[0].values).toEqual([0, 15, 30, 45]);
  });

  it("范围与星期：工作日 9-18 点整点", () => {
    const r = parseCron("0 9-18 * * 1-5");
    expect(r.valid).toBe(true);
    if (r.valid) {
      expect(r.fields[1].values).toEqual([
        9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
      ]);
      expect(r.fields[4].values).toEqual([1, 2, 3, 4, 5]);
      expect(r.desc).toContain("每周一、二、三、四、五");
    }
  });

  it("列表：每月 1、15 日 12 点", () => {
    const r = parseCron("0 12 1,15 * *");
    expect(r.valid).toBe(true);
    if (r.valid) {
      expect(r.fields[2].values).toEqual([1, 15]);
      expect(r.desc).toContain("1、15 日");
    }
  });

  it("范围步进 5-40/10 且周字段 7 归一化为周日 0", () => {
    const r = parseCron("5-40/10 * * * 0,7");
    expect(r.valid).toBe(true);
    if (r.valid) {
      expect(r.fields[0].values).toEqual([5, 15, 25, 35]);
      expect(r.fields[4].values).toEqual([0]);
    }
  });
});

describe("parseCron / 非法表达式", () => {
  it("字段数不足", () => {
    const r = parseCron("* * *");
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error).toContain("5 个字段");
  });

  it("分钟越界 61", () => {
    const r = parseCron("61 * * * *");
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error).toContain("0-59");
  });

  it("非法字符", () => {
    const r = parseCron("a * * * *");
    expect(r.valid).toBe(false);
  });

  it("步进为 0", () => {
    const r = parseCron("*/0 * * * *");
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error).toContain("步进非法");
  });

  it("范围倒置 10-5", () => {
    const r = parseCron("10-5 * * * *");
    expect(r.valid).toBe(false);
  });

  it("空表达式", () => {
    const r = parseCron("   ");
    expect(r.valid).toBe(false);
  });
});
