import { describe, expect, it } from "vitest";
import { convertFrequency } from "./frequency";

const cv = (value: string, from: string, to: string) =>
  convertFrequency({ value, from, to });

describe("convertFrequency / 典型换算", () => {
  it("1 GHz → Hz = 1000000000（千进位）", () => {
    const r = cv("1", "ghz", "hz");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000000000");
  });

  it("1 MHz → Hz = 1000000", () => {
    const r = cv("1", "mhz", "hz");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000000");
  });

  it("1 rpm → Hz ≈ 0.016667（1/60 循环小数，以「约」标注）", () => {
    const r = cv("1", "rpm", "hz");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.016667");
  });

  it("3000 rpm → Hz = 50（电机额定 3000 转/分即 50 Hz）", () => {
    const r = cv("3000", "rpm", "hz");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("50");
  });

  it("1 Hz → rpm = 60（双向）", () => {
    const r = cv("1", "hz", "rpm");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("60");
  });

  it("60 Hz → rpm = 3600", () => {
    const r = cv("60", "hz", "rpm");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("3600");
  });

  it("2.5 GHz → MHz = 2500", () => {
    const r = cv("2.5", "ghz", "mhz");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("2500");
  });

  it("小数输入：0.5 MHz → kHz = 500", () => {
    const r = cv("0.5", "mhz", "khz");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("500");
  });

  it("同单位 2.5 MHz → MHz 恒等", () => {
    const r = cv("2.5", "mhz", "mhz");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.converted).toBe(2.5);
      expect(r.convertedText).toBe("2.5");
    }
  });
});

describe("convertFrequency / 错误处理", () => {
  it("空值：EMPTY 且 message 定位为「请输入数值」", () => {
    const r = cv("", "mhz", "hz");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("EMPTY");
      expect(r.error.message).toBe("请输入数值");
    }
  });

  it("非法字符：INVALID_NUMBER 且 message 定位为「请输入有效的数字」", () => {
    const r = cv("abc", "mhz", "hz");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("非正数：NON_POSITIVE_VALUE", () => {
    const r = cv("-1", "mhz", "hz");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NON_POSITIVE_VALUE");
  });

  it("超 1e15：OUT_OF_RANGE", () => {
    const r = cv("10000000000000000", "ghz", "hz");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });

  it("未知单位：UNSUPPORTED_UNIT", () => {
    const r = cv("1", "ghz2", "hz");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNSUPPORTED_UNIT");
  });
});
