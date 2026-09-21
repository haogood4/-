import { describe, expect, it } from "vitest";
import { convertEnergy } from "./energy";

const cv = (value: string, from: string, to: string) =>
  convertEnergy({ value, from, to });

describe("convertEnergy / 典型换算", () => {
  it("1 大卡 → 千焦 = 4.1868（食品热量场景，精确）", () => {
    const r = cv("1", "kcal", "kj");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("4.1868");
  });

  it("2000 大卡 → 千焦 = 8373.6（每日摄入场景）", () => {
    const r = cv("2000", "kcal", "kj");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("8373.6");
  });

  it("500 千焦 → 大卡 ≈ 119.422948（双向对照）", () => {
    const r = cv("500", "kj", "kcal");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 119.422948");
  });

  it("1 千瓦时 → 焦耳 = 3600000（1 度电）", () => {
    const r = cv("1", "kwh", "j");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("3600000");
  });

  it("1 千瓦时 → 瓦时 = 1000", () => {
    const r = cv("1", "kwh", "wh");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000");
  });

  it("100 卡 → 焦耳 = 418.68", () => {
    const r = cv("100", "cal", "j");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("418.68");
  });

  it("1 瓦时 → 卡 ≈ 859.845228", () => {
    const r = cv("1", "wh", "cal");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 859.845228");
  });

  it("1 英热单位 → 千焦 ≈ 1.055056", () => {
    const r = cv("1", "btu", "kj");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 1.055056");
  });

  it("1 英尺磅力 → 焦耳 ≈ 1.355818", () => {
    const r = cv("1", "ft_lbf", "j");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 1.355818");
  });

  it("小数输入：1.5 大卡 → 千焦 ≈ 6.2802", () => {
    const r = cv("1.5", "kcal", "kj");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 6.2802");
  });

  it("小数输入：0.75 千瓦时 → 瓦时 = 750", () => {
    const r = cv("0.75", "kwh", "wh");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("750");
  });

  it("科学计数写法 1e3 不被接受（需写成 1000）", () => {
    const r = cv("1e3", "kcal", "kj");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("同单位恒等：2.5 kWh → kWh = 2.5", () => {
    const r = cv("2.5", "kwh", "kwh");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(2.5);
  });
});

describe("convertEnergy / 错误处理", () => {
  it("空值返回 EMPTY 并定位提示文案", () => {
    const r = cv("", "kcal", "kj");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("EMPTY");
      expect(r.error.message).toBe("请输入数值");
    }
  });

  it("非法字符 abc 返回 INVALID_NUMBER", () => {
    const r = cv("abc", "kcal", "kj");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("未知单位返回 UNSUPPORTED_UNIT", () => {
    const r = cv("1", "kcal", "erg");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("UNSUPPORTED_UNIT");
      expect(r.error.message).toBe("不支持的单位");
    }
  });

  it("超 1e15 返回 OUT_OF_RANGE", () => {
    const r = cv("10000000000000000", "kj", "kcal");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("OUT_OF_RANGE");
      expect(r.error.message).toBe("数值超出范围（不能超过 1e15）");
    }
  });

  it("0 与负数返回 NON_POSITIVE_VALUE", () => {
    const r0 = cv("0", "kj", "kcal");
    expect(r0.ok).toBe(false);
    if (!r0.ok) {
      expect(r0.error.code).toBe("NON_POSITIVE_VALUE");
      expect(r0.error.message).toBe("数值必须大于 0");
    }
    expect(cv("-1", "kj", "kcal").ok).toBe(false);
  });

  it("超 6 位小数返回 TOO_MANY_DECIMALS", () => {
    const r = cv("0.1234567", "kj", "kcal");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("TOO_MANY_DECIMALS");
      expect(r.error.message).toBe("小数位数不能超过 6 位");
    }
  });
});
