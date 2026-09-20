import { describe, expect, it } from "vitest";
import { calculateHeatSubsidy, HEAT_PRESETS } from "./heat-subsidy";

const cv = (mode: string, rate: string, duration: string) =>
  calculateHeatSubsidy({ mode, rate, duration });

describe("heatSubsidy / 典型场景（总额 = 标准 × 时长）", () => {
  it("按月：300 元/月 × 4 个月 = 1200", () => {
    const r = cv("monthly", "300", "4");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.total).toBe(1200);
      expect(r.formulaText).toContain("300 元/月 × 4 个月");
    }
  });

  it("按日：15 元/日 × 88 日 = 1320", () => {
    const r = cv("daily", "15", "88");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.total).toBe(1320);
      expect(r.formulaText).toContain("15 元/日 × 88 日");
    }
  });

  it("标准带小数（2 位）合法：0.5 元/日 × 1 日 = 0.5", () => {
    const r = cv("daily", "0.5", "1");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.total).toBe(0.5);
  });
});

describe("heatSubsidy / 边界与极值", () => {
  it("按月标准下边界 0.01 × 12 = 0.12，上边界 1000 × 12 = 12000", () => {
    const lo = cv("monthly", "0.01", "12");
    expect(lo.ok).toBe(true);
    if (lo.ok) expect(lo.total).toBe(0.12);
    const hi = cv("monthly", "1000", "12");
    expect(hi.ok).toBe(true);
    if (hi.ok) expect(hi.total).toBe(12000);
  });

  it("按日标准上边界 200 × 366 = 73200", () => {
    const r = cv("daily", "200", "366");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.total).toBe(73200);
  });

  it("按月标准超 1000 拒绝（OUT_OF_RANGE）", () => {
    const r = cv("monthly", "1000.01", "1");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("OUT_OF_RANGE");
      expect(r.error.field).toBe("rate");
    }
  });

  it("按日标准超 200 拒绝（OUT_OF_RANGE）", () => {
    expect(cv("daily", "200.01", "1").ok).toBe(false);
    expect(cv("daily", "99999", "1").ok).toBe(false);
  });

  it("负标准拒绝（OUT_OF_RANGE）", () => {
    const r = cv("monthly", "-300", "4");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });

  it("月数 1/12 边界合法，0 与 13 拒绝", () => {
    expect(cv("monthly", "300", "1").ok).toBe(true);
    expect(cv("monthly", "300", "12").ok).toBe(true);
    expect(cv("monthly", "300", "0").ok).toBe(false);
    const over = cv("monthly", "300", "13");
    expect(over.ok).toBe(false);
    if (!over.ok) {
      expect(over.error.code).toBe("OUT_OF_RANGE");
      expect(over.error.field).toBe("duration");
    }
  });

  it("天数 1/366 边界合法，0 与 367 拒绝", () => {
    expect(cv("daily", "10", "1").ok).toBe(true);
    expect(cv("daily", "10", "366").ok).toBe(true);
    expect(cv("daily", "10", "0").ok).toBe(false);
    expect(cv("daily", "10", "367").ok).toBe(false);
  });
});

describe("heatSubsidy / 错误处理", () => {
  it("未知计发方式拒绝（INVALID_MODE）", () => {
    const r = cv("weekly", "300", "4");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_MODE");
      expect(r.error.field).toBe("mode");
    }
  });

  it("标准空值 / 非法字符 / 3 位小数拒绝", () => {
    const empty = cv("monthly", "", "4");
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error.code).toBe("EMPTY");
    const abc = cv("monthly", "abc", "4");
    expect(abc.ok).toBe(false);
    if (!abc.ok) expect(abc.error.code).toBe("INVALID_NUMBER");
    const dec = cv("monthly", "300.123", "4");
    expect(dec.ok).toBe(false);
    if (!dec.ok) expect(dec.error.code).toBe("TOO_MANY_DECIMALS");
  });

  it("时长空值 / 非法字符拒绝", () => {
    const empty = cv("monthly", "300", "");
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error.code).toBe("EMPTY");
    const abc = cv("daily", "15", "abc");
    expect(abc.ok).toBe(false);
    if (!abc.ok) expect(abc.error.code).toBe("INVALID_NUMBER");
  });

  it("时长非整数拒绝（NOT_INTEGER）", () => {
    const m = cv("monthly", "300", "4.5");
    expect(m.ok).toBe(false);
    if (!m.ok) expect(m.error.code).toBe("NOT_INTEGER");
    const d = cv("daily", "15", "88.5");
    expect(d.ok).toBe(false);
    if (!d.ok) expect(d.error.code).toBe("NOT_INTEGER");
  });
});

describe("heatSubsidy / 2026 省份预设（HEAT_PRESETS）", () => {
  it("共收录 12 个预设", () => {
    expect(HEAT_PRESETS).toHaveLength(12);
  });

  it("上海：300 元/月 × 4 个月", () => {
    const p = HEAT_PRESETS.find((x) => x.province === "上海");
    expect(p).toBeDefined();
    expect(p?.mode).toBe("monthly");
    expect(p?.rate).toBe(300);
    expect(p?.duration).toBe(4);
    expect(p?.note).toContain("以当地最新通知为准");
  });

  it("海南：10 元/日 × 212 日（7 × 30 天历日估算）", () => {
    const p = HEAT_PRESETS.find((x) => x.province === "海南");
    expect(p).toBeDefined();
    expect(p?.mode).toBe("daily");
    expect(p?.rate).toBe(10);
    expect(p?.duration).toBe(212);
    expect(p?.note).toContain("30 天历日");
    expect(p?.months).toBe("4-10月");
  });

  it("河南/安徽/陕西按 21.75 个工作日估算 88 日", () => {
    for (const province of ["河南", "安徽", "陕西"]) {
      const p = HEAT_PRESETS.find((x) => x.province === province);
      expect(p).toBeDefined();
      expect(p?.mode).toBe("daily");
      expect(p?.duration).toBe(88);
      expect(p?.note).toContain("21.75");
    }
  });

  it("浙江/河北标注室内外差异，贵州标注 8 元/日口径", () => {
    expect(
      HEAT_PRESETS.find((x) => x.province === "浙江（室外作业）")?.note,
    ).toContain("室内");
    expect(
      HEAT_PRESETS.find((x) => x.province === "河北（室外作业）")?.note,
    ).toContain("155");
    expect(HEAT_PRESETS.find((x) => x.province === "贵州")?.note).toContain(
      "8 元/日",
    );
  });

  it("预设全部可通过引擎计算（抽样：广东 300 × 5 = 1500）", () => {
    const p = HEAT_PRESETS.find((x) => x.province === "广东");
    expect(p).toBeDefined();
    const r = calculateHeatSubsidy({
      mode: p?.mode ?? "",
      rate: String(p?.rate ?? ""),
      duration: String(p?.duration ?? ""),
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.total).toBe(1500);
  });
});
