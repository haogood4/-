import { describe, expect, it } from "vitest";
import { calculateBmi, formatBmi } from "./bmi-cn";

describe("bmi-cn / 正常计算", () => {
  it("170cm 65kg → BMI 22.5 正常", () => {
    const r = calculateBmi({ height: "170", weight: "65" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.bmi).toBeCloseTo(22.5, 6);
      expect(r.value.categoryCn).toBe("正常");
      expect(r.value.categoryWho).toBe("正常");
    }
  });
  it("180cm 85kg → BMI 26.2 两标准均偏胖", () => {
    const r = calculateBmi({ height: "180", weight: "85" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.bmi).toBeCloseTo(26.2, 6);
      expect(r.value.categoryCn).toBe("偏胖");
      expect(r.value.categoryWho).toBe("偏胖");
    }
  });
  it("160cm 45kg → BMI 17.6 偏瘦", () => {
    const r = calculateBmi({ height: "160", weight: "45" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.bmi).toBeCloseTo(17.6, 6);
      expect(r.value.categoryCn).toBe("偏瘦");
      expect(r.value.categoryWho).toBe("偏瘦");
    }
  });
  it("175cm 70kg → BMI 22.9（精度：四舍五入到 1 位小数）", () => {
    const r = calculateBmi({ height: "175", weight: "70" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.bmi).toBeCloseTo(22.9, 6);
  });
  it("健康体重区间 170cm：中国 53.5–69.1 / WHO 53.5–72.0", () => {
    const r = calculateBmi({ height: "170", weight: "65" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.healthyMinCn).toBeCloseTo(53.5, 6);
      expect(r.value.healthyMaxCn).toBeCloseTo(69.1, 6);
      expect(r.value.healthyMinWho).toBeCloseTo(53.5, 6);
      expect(r.value.healthyMaxWho).toBeCloseTo(72.0, 6);
    }
  });
});

describe("bmi-cn / 双标准分类边界", () => {
  it("BMI 18.5 恰为正常下限（200cm 74kg）", () => {
    const r = calculateBmi({ height: "200", weight: "74" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.bmi).toBeCloseTo(18.5, 6);
      expect(r.value.categoryCn).toBe("正常");
      expect(r.value.categoryWho).toBe("正常");
    }
  });
  it("BMI 18.3 为偏瘦（200cm 73kg）", () => {
    const r = calculateBmi({ height: "200", weight: "73" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.bmi).toBeCloseTo(18.3, 6);
      expect(r.value.categoryCn).toBe("偏瘦");
    }
  });
  it("中国标准 24 边界：BMI 24.0 偏胖但 WHO 仍正常（150cm 54kg）", () => {
    const r = calculateBmi({ height: "150", weight: "54" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.bmi).toBeCloseTo(24.0, 6);
      expect(r.value.categoryCn).toBe("偏胖");
      expect(r.value.categoryWho).toBe("正常");
    }
  });
  it("中国标准 28 边界：BMI 28.0 肥胖但 WHO 仍偏胖（170cm 81kg）", () => {
    const r = calculateBmi({ height: "170", weight: "81" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.bmi).toBeCloseTo(28.0, 6);
      expect(r.value.categoryCn).toBe("肥胖");
      expect(r.value.categoryWho).toBe("偏胖");
    }
  });
  it("WHO 30 边界：BMI 30.0 两标准均肥胖（175cm 92kg）", () => {
    const r = calculateBmi({ height: "175", weight: "92" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.bmi).toBeCloseTo(30.0, 6);
      expect(r.value.categoryCn).toBe("肥胖");
      expect(r.value.categoryWho).toBe("肥胖");
    }
  });
  it("WHO 25 边界：BMI 25.0 两标准均偏胖（200cm 100kg）", () => {
    const r = calculateBmi({ height: "200", weight: "100" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.bmi).toBeCloseTo(25.0, 6);
      expect(r.value.categoryCn).toBe("偏胖");
      expect(r.value.categoryWho).toBe("偏胖");
    }
  });
});

describe("bmi-cn / 非法输入", () => {
  it("身高为空拒绝", () => {
    const r = calculateBmi({ height: "", weight: "65" });
    expect(r.ok).toBe(false);
  });
  it("非数字拒绝", () => {
    const r = calculateBmi({ height: "abc", weight: "65" });
    expect(r.ok).toBe(false);
  });
  it("负数体重拒绝", () => {
    const r = calculateBmi({ height: "170", weight: "-65" });
    expect(r.ok).toBe(false);
  });
  it("身高超范围（300cm）拒绝", () => {
    const r = calculateBmi({ height: "300", weight: "65" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toContain("身高");
  });
  it("体重超范围（800kg）拒绝", () => {
    const r = calculateBmi({ height: "170", weight: "800" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toContain("体重");
  });
});

describe("bmi-cn / 格式化", () => {
  it("formatBmi 输出 1 位小数字符串与区间", () => {
    const r = calculateBmi({ height: "170", weight: "65" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const f = formatBmi(r.value);
      expect(f.bmi).toBe("22.5");
      expect(f.healthyRangeCn).toBe("53.5 – 69.1 kg");
      expect(f.healthyRangeWho).toBe("53.5 – 72.0 kg");
    }
  });
});
