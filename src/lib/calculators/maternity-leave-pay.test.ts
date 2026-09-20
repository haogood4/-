import { describe, expect, it } from "vitest";
import {
  calculateMaternityLeavePay,
  REWARD_PRESETS,
} from "./maternity-leave-pay";

const cv = (
  salary: string,
  rewardPreset: string,
  rewardDaysCustom: string,
  birthType: "normal" | "difficult",
  babies: string,
) =>
  calculateMaternityLeavePay({
    monthlySalary: salary,
    rewardPreset,
    rewardDaysCustom,
    birthType,
    babies,
  });

describe("maternityLeavePay / 典型场景（月薪 ÷ 21.75 × 总天数）", () => {
  it("广东预设：98 + 80 = 178 天，月薪 8000 → 65471.26", () => {
    const r = cv("8000", "guangdong", "", "normal", "1");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.baseDays).toBe(98);
      expect(r.rewardDays).toBe(80);
      expect(r.totalDays).toBe(178);
      expect(r.dailyWage).toBe(367.82); // 8000 ÷ 21.75 ≈ 367.816
      expect(r.leavePay).toBeCloseTo(65471.26, 2);
      expect(r.formulaText).toContain("178");
    }
  });

  it("其他多数省份预设：98 + 60 = 158 天 → 58114.94", () => {
    const r = cv("8000", "other", "", "normal", "1");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.totalDays).toBe(158);
      expect(r.leavePay).toBeCloseTo(58114.94, 2);
    }
  });

  it("整除场景：月薪 2175，other 158 天 → 15800", () => {
    const r = cv("2175", "other", "", "normal", "1");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.dailyWage).toBe(100);
      expect(r.leavePay).toBe(15800);
    }
  });

  it("难产 +15 天；多胞胎每多 1 婴 +15 天（叠加到总天数）", () => {
    const d = cv("8000", "other", "", "difficult", "1");
    expect(d.ok).toBe(true);
    if (d.ok) {
      expect(d.baseDays).toBe(113);
      expect(d.totalDays).toBe(173);
    }
    const t = cv("8000", "other", "", "normal", "2");
    expect(t.ok).toBe(true);
    if (t.ok) expect(t.totalDays).toBe(173);
    const dt = cv("8000", "other", "", "difficult", "2");
    expect(dt.ok).toBe(true);
    if (dt.ok) {
      expect(dt.baseDays).toBe(128);
      expect(dt.totalDays).toBe(188);
      expect(dt.leavePay).toBeCloseTo(69149.43, 2); // 8000 ÷ 21.75 × 188
    }
  });

  it("六胞胎 + 难产 + 广东：98 + 15 + 75 + 80 = 268 天", () => {
    const r = cv("8000", "guangdong", "", "difficult", "6");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.baseDays).toBe(188);
      expect(r.totalDays).toBe(268);
      expect(r.leavePay).toBeCloseTo(98574.71, 2);
    }
  });
});

describe("maternityLeavePay / 自定义奖励假", () => {
  it("custom 30 天：98 + 30 = 128 天", () => {
    const r = cv("8000", "custom", "30", "normal", "1");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.rewardDays).toBe(30);
      expect(r.totalDays).toBe(128);
    }
  });

  it("custom 0 天（下边界）与 300 天（上边界）合法", () => {
    const lo = cv("8000", "custom", "0", "normal", "1");
    expect(lo.ok).toBe(true);
    if (lo.ok) expect(lo.totalDays).toBe(98);
    const hi = cv("8000", "custom", "300", "normal", "1");
    expect(hi.ok).toBe(true);
    if (hi.ok) expect(hi.totalDays).toBe(398);
  });

  it("custom 301 越界拒绝（OUT_OF_RANGE，定位 rewardDays）", () => {
    const r = cv("8000", "custom", "301", "normal", "1");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("OUT_OF_RANGE");
      expect(r.error.field).toBe("rewardDays");
    }
  });

  it("custom 留空 / 非整数拒绝", () => {
    const empty = cv("8000", "custom", "", "normal", "1");
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error.code).toBe("EMPTY");
    const frac = cv("8000", "custom", "30.5", "normal", "1");
    expect(frac.ok).toBe(false);
    if (!frac.ok) expect(frac.error.code).toBe("NOT_INTEGER");
  });

  it("预设非 custom 时自定义天数被忽略（可留空）", () => {
    const r = cv("8000", "shandong", "", "normal", "1");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.rewardDays).toBe(60);
  });
});

describe("maternityLeavePay / 错误处理", () => {
  it("月薪空值 / 非法字符 / 科学计数法拒绝", () => {
    const empty = cv("", "other", "", "normal", "1");
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error.code).toBe("EMPTY");
    const abc = cv("abc", "other", "", "normal", "1");
    expect(abc.ok).toBe(false);
    if (!abc.ok) expect(abc.error.code).toBe("INVALID_NUMBER");
    const sci = cv("1e5", "other", "", "normal", "1");
    expect(sci.ok).toBe(false);
    if (!sci.ok) expect(sci.error.code).toBe("INVALID_NUMBER");
  });

  it("月薪 3 位小数拒绝，2 位合法；0 与负数越界拒绝", () => {
    const many = cv("8000.123", "other", "", "normal", "1");
    expect(many.ok).toBe(false);
    if (!many.ok) expect(many.error.code).toBe("TOO_MANY_DECIMALS");
    expect(cv("8000.55", "other", "", "normal", "1").ok).toBe(true);
    expect(cv("0", "other", "", "normal", "1").ok).toBe(false);
    expect(cv("-8000", "other", "", "normal", "1").ok).toBe(false);
  });

  it("婴儿数 0 / 7 越界拒绝（OUT_OF_RANGE）", () => {
    const zero = cv("8000", "other", "", "normal", "0");
    expect(zero.ok).toBe(false);
    if (!zero.ok) {
      expect(zero.error.code).toBe("OUT_OF_RANGE");
      expect(zero.error.field).toBe("babies");
    }
    expect(cv("8000", "other", "", "normal", "7").ok).toBe(false);
  });

  it("未知生育类型拒绝（INVALID_BIRTH_TYPE）", () => {
    const r = calculateMaternityLeavePay({
      monthlySalary: "8000",
      rewardPreset: "other",
      rewardDaysCustom: "",
      birthType: "c",
      babies: "1",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_BIRTH_TYPE");
      expect(r.error.field).toBe("birth");
    }
  });

  it("未知奖励假预设拒绝（INVALID_REWARD_PRESET）", () => {
    const r = cv("8000", "guangxi", "", "normal", "1");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_REWARD_PRESET");
      expect(r.error.field).toBe("reward");
    }
  });
});

describe("maternityLeavePay / 奖励假预设（REWARD_PRESETS）", () => {
  it("共 7 个预设，广东 80 天、其余 60 天、custom 无固定天数", () => {
    expect(REWARD_PRESETS).toHaveLength(7);
    expect(REWARD_PRESETS.find((p) => p.key === "guangdong")?.days).toBe(80);
    for (const key of [
      "shandong",
      "beijing",
      "shanghai",
      "zhejiang",
      "other",
    ]) {
      expect(REWARD_PRESETS.find((p) => p.key === key)?.days).toBe(60);
    }
    expect(REWARD_PRESETS.find((p) => p.key === "custom")?.days).toBeNull();
  });
});
