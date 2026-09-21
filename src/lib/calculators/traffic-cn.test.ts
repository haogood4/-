import { describe, expect, it } from "vitest";
import { calculateTraffic } from "./traffic-cn";

const base = {
  income: "200",
  liability: "1",
  medical: "0",
  missDays: "0",
  careDays: "0",
  dailyCare: "0",
  hospitalDays: "0",
  nutrition: "0",
  transport: "0",
  disability: "",
  age: "",
  death: "false",
  disposableIncome: "0",
  funeralBase: "0",
};

const run = (overrides: Record<string, string>) =>
  calculateTraffic({ ...base, ...overrides });

describe("traffic / 实报项目与基础估算", () => {
  it("仅医疗费 10000 元 + 全责（默认 1） → 10000", () => {
    const r = run({ medical: "10000" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.subtotal).toBe(10000);
      expect(r.total).toBe(10000);
      expect(r.items.find((it) => it.label === "医疗费")?.amount).toBe(10000);
    }
  });

  it("误工 30 天 × 日收入 200 → 6000", () => {
    const r = run({ missDays: "30", income: "200" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.items.find((it) => it.label === "误工费")?.amount).toBe(6000);
    }
  });

  it("护理 20 天 × 日护工 150 → 3000", () => {
    const r = run({ careDays: "20", dailyCare: "150" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.items.find((it) => it.label === "护理费")?.amount).toBe(3000);
    }
  });

  it("住院 10 天 → 伙食补助 1000 元（100/天 参考口径）", () => {
    const r = run({ hospitalDays: "10" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.items.find((it) => it.label === "住院伙食补助")?.amount).toBe(
        1000,
      );
    }
  });
});

describe("traffic / 残疾与死亡赔偿金", () => {
  it("10 级 / 年龄 30 / 人均可支配 50000：50000 × 1.0 × 20 = 1000000", () => {
    const r = run({
      disability: "10",
      age: "30",
      disposableIncome: "50000",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.items.find((it) => it.label === "残疾赔偿金")?.amount).toBe(
        1000000,
      );
    }
  });

  it("6 级 / 年龄 30 / 人均可支配 50000：50000 × 0.6 × 20 = 600000", () => {
    const r = run({
      disability: "6",
      age: "30",
      disposableIncome: "50000",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.items.find((it) => it.label === "残疾赔偿金")?.amount).toBe(
        600000,
      );
    }
  });

  it("5 级 / 年龄 65：每多 1 岁减 1 年 → 20 − 5 = 15 年", () => {
    const r = run({
      disability: "5",
      age: "65",
      disposableIncome: "50000",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 50000 × 0.5 × 15 = 375000
      expect(r.items.find((it) => it.label === "残疾赔偿金")?.amount).toBe(
        375000,
      );
    }
  });

  it("10 级 / 年龄 78（≥75）：按 5 年 → 50000 × 1.0 × 5 = 250000", () => {
    const r = run({
      disability: "10",
      age: "78",
      disposableIncome: "50000",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.items.find((it) => it.label === "残疾赔偿金")?.amount).toBe(
        250000,
      );
    }
  });

  it("死亡 + 年龄 30 / 人均可支配 50000：50000 × 0.1 × 20 = 100000 + 丧葬费", () => {
    const r = run({
      death: "true",
      age: "30",
      disposableIncome: "50000",
      funeralBase: "8000",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.items.find((it) => it.label === "死亡赔偿金")?.amount).toBe(
        100000,
      );
      // 丧葬费 = 8000 × 6 = 48000
      expect(r.items.find((it) => it.label === "丧葬费")?.amount).toBe(48000);
    }
  });
});

describe("traffic / 责任比例与合计", () => {
  it("医疗 10000 + 责任比例 0.6 → 6000", () => {
    const r = run({ medical: "10000", liability: "0.6" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.subtotal).toBe(10000);
      expect(r.liabilityRatio).toBe(0.6);
      expect(r.total).toBe(6000);
    }
  });

  it("医疗 + 误工 + 责任 0.5：合计 15000 × 0.5 = 7500", () => {
    const r = run({
      medical: "5000",
      missDays: "50",
      income: "200",
      liability: "0.5",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.subtotal).toBe(15000);
      expect(r.total).toBe(7500);
    }
  });

  it("责任 0 视为 1（全额），避免误归零", () => {
    const r = run({ medical: "5000", liability: "0" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.liabilityRatio).toBe(1);
      expect(r.total).toBe(5000);
    }
  });
});

describe("traffic / 错误处理", () => {
  it("责任比例 > 1 / < 0 拒绝（OUT_OF_RANGE）", () => {
    expect(run({ liability: "1.5" }).ok).toBe(false);
    expect(run({ liability: "-0.5" }).ok).toBe(false);
  });

  it("伤残等级非法（11 / x / 5.5）拒绝", () => {
    const r1 = run({ disability: "11" });
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.error.code).toBe("OUT_OF_RANGE");
    const r2 = run({ disability: "x" });
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.error.code).toBe("INVALID_NUMBER");
    expect(run({ disability: "5.5" }).ok).toBe(false);
  });

  it("年龄 > 120 拒绝，3 位小数拒绝", () => {
    expect(run({ age: "121" }).ok).toBe(false);
    const r = run({ medical: "100.123" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOO_MANY_DECIMALS");
  });

  it("非法字符与科学计数法拒绝（INVALID_NUMBER）", () => {
    expect(run({ medical: "abc" }).ok).toBe(false);
    const r = run({ medical: "1e5" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_NUMBER");
  });
});
