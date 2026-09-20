import { describe, expect, it } from "vitest";
import { convertStorage } from "./data-storage";

const cv = (value: string, from: string, to: string) =>
  convertStorage({ value, from, to });

describe("convertStorage / 典型换算", () => {
  it("1 Byte → bit = 8", () => {
    const r = cv("1", "b", "bit");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("8");
  });

  it("1 KB → Byte = 1000（十进制定义）", () => {
    const r = cv("1", "kb", "b");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000");
  });

  it("1 KiB → Byte = 1024（二进制定义）", () => {
    const r = cv("1", "kib", "b");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1024");
  });

  it("1 GB → GiB ≈ 0.931323（硬盘容量差异）", () => {
    const r = cv("1", "gb", "gib");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.931323");
  });

  it("1 TiB → TB ≈ 1.099512", () => {
    const r = cv("1", "tib", "tb");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 1.099512");
  });

  it("500 GB → MB = 500000", () => {
    const r = cv("500", "gb", "mb");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("500000");
  });

  it("同单位 256 MiB → MiB = 256", () => {
    const r = cv("256", "mib", "mib");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(256);
  });
});

describe("convertStorage / 错误处理", () => {
  it("空值 / 非法 / 负数 / 未知单位均拒绝", () => {
    expect(cv("", "gb", "mb").ok).toBe(false);
    expect(cv("12MB", "gb", "mb").ok).toBe(false);
    expect(cv("-1", "gb", "mb").ok).toBe(false);
    expect(cv("1", "kib", "kilobyte").ok).toBe(false);
  });

  it("超 1e15 拒绝（TiB 大数值场景）", () => {
    const r = cv("10000000000000000", "tb", "bit");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });
});
