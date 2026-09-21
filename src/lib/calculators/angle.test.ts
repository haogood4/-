import { describe, expect, it } from "vitest";
import { convertAngle } from "./angle";

const cv = (value: string, from: string, to: string) =>
  convertAngle({ value, from, to });

describe("convertAngle / 典型换算", () => {
  it("180 度 → 弧度 ≈ 3.141593（默认场景，即 π）", () => {
    const r = cv("180", "deg", "rad");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 3.141593");
  });

  it("90 度 → 弧度 ≈ 1.570796（直角，即 π/2）", () => {
    const r = cv("90", "deg", "rad");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 1.570796");
  });

  it("1 弧度 → 度 ≈ 57.29578（双向对照）", () => {
    const r = cv("1", "rad", "deg");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 57.29578");
  });

  it("1 圈 → 度 = 360", () => {
    const r = cv("1", "turn", "deg");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("360");
  });

  it("360 度 → 圈 = 1", () => {
    const r = cv("360", "deg", "turn");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1");
  });

  it("1 梯度 → 度 = 0.9（直角 = 100 gon）", () => {
    const r = cv("1", "gon", "deg");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("0.9");
  });

  it("1 度 → 角分 = 60", () => {
    const r = cv("1", "deg", "arcmin");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("60");
  });

  it("60 角分 → 度 = 1（双向对照）", () => {
    const r = cv("60", "arcmin", "deg");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1");
  });

  it("1 度 → 角秒 = 3600", () => {
    const r = cv("1", "deg", "arcsec");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("3600");
  });

  it("1 角分 → 角秒 = 60", () => {
    const r = cv("1", "arcmin", "arcsec");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("60");
  });

  it("小数输入：45 度 → 弧度 ≈ 0.785398（π/4）", () => {
    const r = cv("45", "deg", "rad");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.785398");
  });

  it("小数输入：0.25 圈 → 度 = 90", () => {
    const r = cv("0.25", "turn", "deg");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("90");
  });

  it("科学计数写法 1e3 不被接受（需写成 1000）", () => {
    const r = cv("1e3", "deg", "rad");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("同单位恒等：2.5 rad → rad = 2.5", () => {
    const r = cv("2.5", "rad", "rad");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(2.5);
  });
});

describe("convertAngle / 错误处理", () => {
  it("空值返回 EMPTY 并定位提示文案", () => {
    const r = cv("", "deg", "rad");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("EMPTY");
      expect(r.error.message).toBe("请输入数值");
    }
  });

  it("非法字符 abc 返回 INVALID_NUMBER", () => {
    const r = cv("abc", "deg", "rad");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("未知单位返回 UNSUPPORTED_UNIT", () => {
    const r = cv("1", "deg", "grad");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("UNSUPPORTED_UNIT");
      expect(r.error.message).toBe("不支持的单位");
    }
  });

  it("超 1e15 返回 OUT_OF_RANGE", () => {
    const r = cv("10000000000000000", "deg", "rad");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("OUT_OF_RANGE");
      expect(r.error.message).toBe("数值超出范围（不能超过 1e15）");
    }
  });

  it("0 与负数返回 NON_POSITIVE_VALUE", () => {
    const r0 = cv("0", "deg", "rad");
    expect(r0.ok).toBe(false);
    if (!r0.ok) {
      expect(r0.error.code).toBe("NON_POSITIVE_VALUE");
      expect(r0.error.message).toBe("数值必须大于 0");
    }
    expect(cv("-90", "deg", "rad").ok).toBe(false);
  });

  it("超 6 位小数返回 TOO_MANY_DECIMALS", () => {
    const r = cv("0.1234567", "deg", "rad");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("TOO_MANY_DECIMALS");
      expect(r.error.message).toBe("小数位数不能超过 6 位");
    }
  });
});
