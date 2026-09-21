import { describe, expect, it } from "vitest";
import { convertFlow } from "./flow";

const cv = (value: string, from: string, to: string) =>
  convertFlow({ value, from, to });

describe("convertFlow / 典型换算", () => {
  it("1 m³/h → L/min ≈ 16.666667（水泵铭牌常用关系）", () => {
    const r = cv("1", "m3h", "lmin");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 16.666667");
  });

  it("1 L/min → L/s ≈ 0.016667（1/60，以「约」标注）", () => {
    const r = cv("1", "lmin", "ls");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.016667");
  });

  it("1 m³/h → L/s ≈ 0.277778", () => {
    const r = cv("1", "m3h", "ls");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.277778");
  });

  it("1 m³/s → L/s = 1000", () => {
    const r = cv("1", "m3s", "ls");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000");
  });

  it("1 gal/min → L/min ≈ 3.785412（1 gal(US) = 3.785411784 L）", () => {
    const r = cv("1", "gpm", "lmin");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 3.785412");
  });

  it("1 CFM → L/min ≈ 28.316847（1 ft³ = 28.316846592 L）", () => {
    const r = cv("1", "cfm", "lmin");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 28.316847");
  });

  it("10 m³/h → L/min ≈ 166.666667", () => {
    const r = cv("10", "m3h", "lmin");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 166.666667");
  });

  it("1 L/s → mL/s = 1000（双向小单位）", () => {
    const r = cv("1", "ls", "mls");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000");
  });

  it("小数输入：0.5 L/s → m³/h ≈ 1.8", () => {
    const r = cv("0.5", "ls", "m3h");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 1.8");
  });

  it("同单位 2.5 L/s → L/s 恒等", () => {
    const r = cv("2.5", "ls", "ls");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.converted).toBe(2.5);
      expect(r.convertedText).toBe("2.5");
    }
  });
});

describe("convertFlow / 错误处理", () => {
  it("空值：EMPTY 且 message 定位为「请输入数值」", () => {
    const r = cv("", "m3h", "lmin");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("EMPTY");
      expect(r.error.message).toBe("请输入数值");
    }
  });

  it("非法字符：INVALID_NUMBER 且 message 定位为「请输入有效的数字」", () => {
    const r = cv("3m3", "m3h", "lmin");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("非正数：NON_POSITIVE_VALUE", () => {
    const r = cv("-2", "m3h", "lmin");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NON_POSITIVE_VALUE");
  });

  it("超 1e15：OUT_OF_RANGE", () => {
    const r = cv("10000000000000000", "m3h", "lmin");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });

  it("未知单位：UNSUPPORTED_UNIT", () => {
    const r = cv("1", "m2h", "lmin");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNSUPPORTED_UNIT");
  });
});
