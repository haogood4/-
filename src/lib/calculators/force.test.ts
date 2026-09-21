import { describe, expect, it } from "vitest";
import { convertForce } from "./force";

const cv = (value: string, from: string, to: string) =>
  convertForce({ value, from, to });

describe("convertForce / 典型换算", () => {
  it("1 kgf → N = 9.80665（g0 精确定义）", () => {
    const r = cv("1", "kgf", "n");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("9.80665");
  });

  it("9.80665 N → kgf = 1（双向）", () => {
    const r = cv("9.80665", "n", "kgf");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1");
  });

  it("1 lbf → N ≈ 4.448222（6 位小数舍入，以「约」标注）", () => {
    const r = cv("1", "lbf", "n");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 4.448222");
  });

  it("1 dyn → N = 0.00001（CGS 精确定义）", () => {
    const r = cv("1", "dyn", "n");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("0.00001");
  });

  it("1 N → dyn ≈ 100000（浮点除法带「约」标注）", () => {
    const r = cv("1", "n", "dyn");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 100000");
  });

  it("1 N → kgf ≈ 0.101972", () => {
    const r = cv("1", "n", "kgf");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.101972");
  });

  it("1 tf → kN = 9.80665、1 gf → mN = 9.80665（千克力系同源）", () => {
    const r1 = cv("1", "tf", "kn");
    expect(r1.ok).toBe(true);
    if (r1.ok) expect(r1.convertedText).toBe("9.80665");
    const r2 = cv("1", "gf", "mn");
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.convertedText).toBe("9.80665");
  });

  it("1 tf → kgf = 1000", () => {
    const r = cv("1", "tf", "kgf");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000");
  });

  it("小数输入：2 kgf → N = 19.6133", () => {
    const r = cv("2", "kgf", "n");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("19.6133");
  });

  it("同单位 0.5 kN → kN 恒等", () => {
    const r = cv("0.5", "kn", "kn");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.converted).toBe(0.5);
      expect(r.convertedText).toBe("0.5");
    }
  });
});

describe("convertForce / 错误处理", () => {
  it("空值：EMPTY 且 message 定位为「请输入数值」", () => {
    const r = cv("", "n", "kgf");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("EMPTY");
      expect(r.error.message).toBe("请输入数值");
    }
  });

  it("非法字符：INVALID_NUMBER 且 message 定位为「请输入有效的数字」", () => {
    const r = cv("1n", "n", "kgf");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_NUMBER");
      expect(r.error.message).toBe("请输入有效的数字");
    }
  });

  it("非正数：NON_POSITIVE_VALUE", () => {
    const r = cv("0", "n", "kgf");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NON_POSITIVE_VALUE");
  });

  it("超 1e15：OUT_OF_RANGE", () => {
    const r = cv("10000000000000000", "n", "kn");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });

  it("未知单位：UNSUPPORTED_UNIT", () => {
    const r = cv("1", "psi", "n");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNSUPPORTED_UNIT");
  });
});
