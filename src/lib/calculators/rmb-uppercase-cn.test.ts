import { describe, expect, it } from "vitest";
import { convertRmbUppercase } from "./rmb-uppercase-cn";

const cn = (value: string) => convertRmbUppercase({ value });
const text = (value: string): string => {
  const r = cn(value);
  if (!r.ok) throw new Error(`unexpected error: ${r.error.code}`);
  return r.text;
};

describe("convertRmbUppercase / 基本金额", () => {
  it("123.45 → 壹佰贰拾叁元肆角伍分", () => {
    expect(text("123.45")).toBe("壹佰贰拾叁元肆角伍分");
  });

  it("纯整数无小数点：100 → 壹佰元整", () => {
    expect(text("100")).toBe("壹佰元整");
  });

  it("整数结尾无角分补「整」：1000000 → 壹佰万元整", () => {
    expect(text("1000000")).toBe("壹佰万元整");
  });

  it("1234567.89 → 壹佰贰拾叁万肆仟伍佰陆拾柒元捌角玖分", () => {
    expect(text("1234567.89")).toBe("壹佰贰拾叁万肆仟伍佰陆拾柒元捌角玖分");
  });

  it("80.08 → 捌拾元零捌分", () => {
    expect(text("80.08")).toBe("捌拾元零捌分");
  });
});

describe("convertRmbUppercase / 零的处理", () => {
  it("0 → 零元整", () => {
    expect(text("0")).toBe("零元整");
  });

  it("仅角：0.5 → 零元伍角", () => {
    expect(text("0.5")).toBe("零元伍角");
  });

  it("仅分：0.05 → 零元零伍分（角位为 0 分位非 0，元后写零）", () => {
    expect(text("0.05")).toBe("零元零伍分");
  });

  it("1.05 → 壹元零伍分", () => {
    expect(text("1.05")).toBe("壹元零伍分");
  });

  it("1.5 → 壹元伍角（有角无分不加整）", () => {
    expect(text("1.5")).toBe("壹元伍角");
  });

  it("连续零：1005 → 壹仟零伍元整", () => {
    expect(text("1005")).toBe("壹仟零伍元整");
  });

  it("连续零跨组：10005 → 壹万零伍元整", () => {
    expect(text("10005")).toBe("壹万零伍元整");
  });

  it("连续零跨组：100005 → 壹拾万零伍元整", () => {
    expect(text("100005")).toBe("壹拾万零伍元整");
  });
});

describe("convertRmbUppercase / 万亿进位", () => {
  it("100000000 → 壹亿元整", () => {
    expect(text("100000000")).toBe("壹亿元整");
  });

  it("亿级+个级组合：100000001 → 壹亿零壹元整", () => {
    expect(text("100000001")).toBe("壹亿零壹元整");
  });

  it("亿级+万级组合：100010000 → 壹亿零壹万元整", () => {
    expect(text("100010000")).toBe("壹亿零壹万元整");
  });

  it("万组末零不写多余零：203000 → 贰拾万叁仟元整", () => {
    expect(text("203000")).toBe("贰拾万叁仟元整");
  });

  it("100000000000 → 壹仟亿元整", () => {
    expect(text("100000000000")).toBe("壹仟亿元整");
  });
});

describe("convertRmbUppercase / 负数", () => {
  it("-1000000 → 负壹佰万元整", () => {
    const r = cn("-1000000");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.text).toBe("负壹佰万元整");
      expect(r.negative).toBe(true);
    }
  });

  it("-0.05 → 负零元零伍分", () => {
    expect(text("-0.05")).toBe("负零元零伍分");
  });

  it("-0 → 零元整（舍去符号）", () => {
    const r = cn("-0");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.text).toBe("零元整");
      expect(r.negative).toBe(false);
    }
  });

  it("+100 → 壹佰元整（正号允许）", () => {
    expect(text("+100")).toBe("壹佰元整");
  });
});

describe("convertRmbUppercase / 四舍五入（字符串运算）", () => {
  it("0.005 → 0.01：零元零壹分（浮点陷阱值）", () => {
    expect(text("0.005")).toBe("零元零壹分");
  });

  it("1.235 → 壹元贰角肆分", () => {
    expect(text("1.235")).toBe("壹元贰角肆分");
  });

  it("1.234 → 壹元贰角叁分（舍去）", () => {
    expect(text("1.234")).toBe("壹元贰角叁分");
  });

  it("0.004999 → 零元整（不足半分舍去）", () => {
    expect(text("0.004999")).toBe("零元整");
  });

  it("9.999 → 壹拾元整（分进位到元）", () => {
    expect(text("9.999")).toBe("壹拾元整");
  });
});

describe("convertRmbUppercase / 边界与错误", () => {
  it("边界值 999999999999.99 允许", () => {
    expect(text("999999999999.99")).toBe(
      "玖仟玖佰玖拾玖亿玖仟玖佰玖拾玖万玖仟玖佰玖拾玖元玖角玖分",
    );
  });

  it("整数部分 13 位超限 → OUT_OF_RANGE", () => {
    const r = cn("1000000000000");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });

  it("舍入进位导致超限：999999999999.995 → OUT_OF_RANGE", () => {
    const r = cn("999999999999.995");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });

  it("空值 → EMPTY", () => {
    const r = cn("");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("纯空白 → EMPTY", () => {
    expect(cn("   ").ok).toBe(false);
  });

  it("非法字符 abc → INVALID_NUMBER", () => {
    const r = cn("abc");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_NUMBER");
  });

  it("科学计数法 1e5 拒绝", () => {
    expect(cn("1e5").ok).toBe(false);
  });

  it("千分位逗号 1,234 拒绝", () => {
    expect(cn("1,234").ok).toBe(false);
  });

  it("货币符号 ¥100 拒绝", () => {
    expect(cn("¥100").ok).toBe(false);
  });

  it("尾点 12. 拒绝", () => {
    expect(cn("12.").ok).toBe(false);
  });

  it("前导零 007.5 → 柒元伍角", () => {
    expect(text("007.5")).toBe("柒元伍角");
  });

  it("多余小数位 >2 舍入到分：123.456 → 壹佰贰拾叁元肆角陆分", () => {
    expect(text("123.456")).toBe("壹佰贰拾叁元肆角陆分");
  });
});
