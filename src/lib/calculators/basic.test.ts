// 四则运算计算器单元测试
// 测试向量与 src/lib/calculators/basic.ts 的实际输出对齐
import { describe, expect, it } from "vitest";
import {
  applyOperator,
  applyPercent,
  evaluateExpression,
  formatBasic,
  toggleSign,
} from "./basic";

describe("basic / applyOperator", () => {
  it("加法", () => {
    expect(applyOperator(2, "+", 3)).toEqual({ ok: true, value: 5 });
  });
  it("减法", () => {
    expect(applyOperator(10, "−", 4)).toEqual({ ok: true, value: 6 });
  });
  it("乘法", () => {
    expect(applyOperator(3, "×", 7)).toEqual({ ok: true, value: 21 });
  });
  it("除法", () => {
    expect(applyOperator(20, "÷", 4)).toEqual({ ok: true, value: 5 });
  });
  it("除零", () => {
    const r = applyOperator(5, "÷", 0);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DIVIDE_BY_ZERO");
  });
});

describe("basic / evaluateExpression 加减乘除基础", () => {
  it("2+3=5", () => {
    const r = evaluateExpression("2+3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(5);
  });
  it("10-4=6", () => {
    const r = evaluateExpression("10−4");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(6);
  });
  it("3×7=21", () => {
    const r = evaluateExpression("3×7");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(21);
  });
  it("20÷4=5", () => {
    const r = evaluateExpression("20÷4");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(5);
  });
});

describe("basic / evaluateExpression 运算优先级", () => {
  it("2+3×4=14", () => {
    const r = evaluateExpression("2+3×4");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(14);
  });
  it("4×(2+3)=20", () => {
    const r = evaluateExpression("4×(2+3)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(20);
  });
  it("(10−2)÷4=2", () => {
    const r = evaluateExpression("(10−2)÷4");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(2);
  });
  it("同优先级左结合 10−4−2=4", () => {
    const r = evaluateExpression("10−4−2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(4);
  });
});

describe("basic / evaluateExpression 负数与一元负号", () => {
  it("-5+3=-2", () => {
    const r = evaluateExpression("−5+3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(-2);
  });
  it("5*(-2)=-10", () => {
    const r = evaluateExpression("5×(−2)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(-10);
  });
  it("(-3)*(-2)=6", () => {
    const r = evaluateExpression("(−3)×(−2)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(6);
  });
});

describe("basic / evaluateExpression 小数", () => {
  it("0.1+0.2 约 0.3", () => {
    const r = evaluateExpression("0.1+0.2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(0.3, 10);
  });
  it("1.5×2=3", () => {
    const r = evaluateExpression("1.5×2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(3);
  });
  it(".5+0.5=1", () => {
    const r = evaluateExpression(".5+0.5");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(1);
  });
});

describe("basic / evaluateExpression 错误处理", () => {
  it("5÷0 DIVIDE_BY_ZERO", () => {
    const r = evaluateExpression("5÷0");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DIVIDE_BY_ZERO");
  });
  it("空 INCOMPLETE_EXPR", () => {
    const r = evaluateExpression("12+");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INCOMPLETE_EXPR");
  });
  it("连续运算符 INVALID_FORMAT", () => {
    const r = evaluateExpression("12++3");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_FORMAT");
  });
  it("双小数点 INVALID_FORMAT", () => {
    const r = evaluateExpression("1.2.3");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_FORMAT");
  });
  it("空字符串 EMPTY", () => {
    const r = evaluateExpression("");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });
});

describe("basic / evaluateExpression 范围", () => {
  it("1e12×2 OUT_OF_RANGE", () => {
    const r = evaluateExpression("1000000000000×2");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });
  it("999999999999+1 通过", () => {
    const r = evaluateExpression("999999999999+1");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(1000000000000);
  });
  it("字符超 32 拒绝", () => {
    const r = evaluateExpression("1".repeat(33));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });
});

describe("basic / formatBasic", () => {
  it("0.1+0.2 含「约」前缀", () => {
    expect(formatBasic(0.1 + 0.2)).toBe("约 0.3");
  });
  it("-0 显示为 0", () => {
    expect(formatBasic(-0)).toBe("0");
  });
  it("整数无小数点", () => {
    expect(formatBasic(42)).toBe("42");
  });
  it("小数保留", () => {
    expect(formatBasic(1.25)).toBe("1.25");
  });
  it("Infinity 文本", () => {
    expect(formatBasic(Infinity)).toBe("数值超出范围");
  });
});

describe("basic / ± 与 %", () => {
  it("± 切换 5 → -5 → 5", () => {
    expect(toggleSign("5")).toBe("−5");
    expect(toggleSign("−5")).toBe("5");
  });
  it("± 空 no-op", () => {
    expect(toggleSign("")).toBe("");
  });
  it("% 50×20% = 50×0.2", () => {
    const r = evaluateExpression("50×20÷100");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(10);
  });
  it("applyPercent 50 → 50÷100", () => {
    expect(applyPercent("50")).toBe("50÷100");
  });
  it("applyPercent 空 no-op", () => {
    expect(applyPercent("")).toBe("");
  });
});

describe("basic / 表达式语法细节", () => {
  it("含空格的表达式", () => {
    const r = evaluateExpression(" 2 + 3 ");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(5);
  });
  it("括号嵌套 (1+2)×(3+4)=21", () => {
    const r = evaluateExpression("(1+2)×(3+4)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(21);
  });
});
