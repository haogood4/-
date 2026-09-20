import { describe, expect, it } from "vitest";
import {
  convertClothingSize,
  formatSizeComparison,
  getSizeTable,
} from "./clothing-size-cn";

describe("clothing-size-cn / 男装上装四制互查", () => {
  it("中国号 175 → L：EU 50 / US 40 / UK 18，胸围 94–98", () => {
    const r = convertClothingSize({
      category: "men",
      system: "cn",
      value: "175",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.eu).toBe("50");
      expect(r.value.us).toBe("40");
      expect(r.value.uk).toBe("18");
      expect(r.value.label).toBe("L");
      expect(r.value.measures).toContain("胸围 94–98 cm");
      expect(r.value.measures).toContain("腰围 84–90 cm");
    }
  });
  it("欧洲号 52 → XL：CN 180 / US 42 / UK 20", () => {
    const r = convertClothingSize({
      category: "men",
      system: "eu",
      value: "52",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.cn).toBe("180");
      expect(r.value.us).toBe("42");
      expect(r.value.uk).toBe("20");
    }
  });
  it("美国号 36 → S：CN 165 / EU 46 / UK 14", () => {
    const r = convertClothingSize({
      category: "men",
      system: "us",
      value: "36",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.cn).toBe("165");
      expect(r.value.eu).toBe("46");
      expect(r.value.uk).toBe("14");
    }
  });
  it("边界：最小 S（CN 165）与最大 3XL（UK 24）均可命中", () => {
    const min = convertClothingSize({
      category: "men",
      system: "cn",
      value: "165",
    });
    const max = convertClothingSize({
      category: "men",
      system: "uk",
      value: "24",
    });
    expect(min.ok).toBe(true);
    expect(max.ok).toBe(true);
    if (min.ok) expect(min.value.label).toBe("S");
    if (max.ok) {
      expect(max.value.label).toBe("3XL");
      expect(max.value.cn).toBe("190");
    }
  });
  it("字母码直接输入：xl / XXL（别名 2XL）大小写不敏感", () => {
    const a = convertClothingSize({
      category: "men",
      system: "cn",
      value: "xl",
    });
    const b = convertClothingSize({
      category: "men",
      system: "cn",
      value: " XXL ",
    });
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    if (a.ok) expect(a.value.cn).toBe("180");
    if (b.ok) expect(b.value.cn).toBe("185");
  });
});

describe("clothing-size-cn / 女装上装", () => {
  it("英国号 12 → L：CN 170 / EU 40 / US 8", () => {
    const r = convertClothingSize({
      category: "women",
      system: "uk",
      value: "12",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.cn).toBe("170");
      expect(r.value.eu).toBe("40");
      expect(r.value.us).toBe("8");
    }
  });
  it("边界：最小 XS（CN 155 → EU 34 / US 2 / UK 6）", () => {
    const r = convertClothingSize({
      category: "women",
      system: "cn",
      value: "155",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.label).toBe("XS");
      expect(r.value.eu).toBe("34");
      expect(r.value.us).toBe("2");
      expect(r.value.uk).toBe("6");
    }
  });
});

describe("clothing-size-cn / 童装区间", () => {
  it("中国号 130（身高 130）→ US 8 / UK 7-8，含适用年龄", () => {
    const r = convertClothingSize({
      category: "kids",
      system: "cn",
      value: "130",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.us).toBe("8");
      expect(r.value.uk).toBe("7-8");
      expect(r.value.measures).toContain("适用年龄 7-8 岁");
      expect(r.value.measures).toContain("胸围 64–68 cm");
    }
  });
  it("英国号 11-12（非数值串匹配）→ CN 150 / US 12", () => {
    const r = convertClothingSize({
      category: "kids",
      system: "uk",
      value: "11-12",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.cn).toBe("150");
      expect(r.value.us).toBe("12");
    }
  });
  it("边界：童装最大 CN 160 → US 14；105（低于区间）拒绝", () => {
    const max = convertClothingSize({
      category: "kids",
      system: "cn",
      value: "160",
    });
    const low = convertClothingSize({
      category: "kids",
      system: "cn",
      value: "105",
    });
    expect(max.ok).toBe(true);
    if (max.ok) expect(max.value.us).toBe("14");
    expect(low.ok).toBe(false);
    if (!low.ok) expect(low.error.code).toBe("SIZE_NOT_FOUND");
  });
});

describe("clothing-size-cn / 鞋码", () => {
  it("欧洲号 40 → CN 250 / US 7 / UK 6，脚长约 25.0 cm", () => {
    const r = convertClothingSize({
      category: "shoes",
      system: "eu",
      value: "40",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.cn).toBe("250");
      expect(r.value.us).toBe("7");
      expect(r.value.uk).toBe("6");
      expect(r.value.measures).toContain("脚长约 25.0 cm");
    }
  });
  it("美国号 8.5 → EU 42；8.50 数值等价同样命中", () => {
    const a = convertClothingSize({
      category: "shoes",
      system: "us",
      value: "8.5",
    });
    const b = convertClothingSize({
      category: "shoes",
      system: "us",
      value: "8.50",
    });
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    if (a.ok) expect(a.value.eu).toBe("42");
    if (b.ok) expect(b.value.eu).toBe("42");
  });
  it("边界：最小 EU 36 与最大 EU 46 均可命中", () => {
    const min = convertClothingSize({
      category: "shoes",
      system: "eu",
      value: "36",
    });
    const max = convertClothingSize({
      category: "shoes",
      system: "eu",
      value: "46",
    });
    expect(min.ok).toBe(true);
    expect(max.ok).toBe(true);
    if (min.ok) expect(min.value.cn).toBe("230");
    if (max.ok) expect(max.value.uk).toBe("11");
  });
});

describe("clothing-size-cn / 无效输入", () => {
  it("尺码为空 → EMPTY", () => {
    const r = convertClothingSize({
      category: "men",
      system: "cn",
      value: "   ",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });
  it("未知分类 → UNKNOWN_CATEGORY", () => {
    const r = convertClothingSize({
      category: "hat",
      system: "cn",
      value: "175",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNKNOWN_CATEGORY");
  });
  it("未知号制 → UNKNOWN_SYSTEM", () => {
    const r = convertClothingSize({
      category: "men",
      system: "jp",
      value: "M",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNKNOWN_SYSTEM");
  });
  it("表外尺码 → SIZE_NOT_FOUND 且提示有效值列表", () => {
    const r = convertClothingSize({
      category: "men",
      system: "eu",
      value: "99",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("SIZE_NOT_FOUND");
      expect(r.error.message).toContain("欧洲号");
      expect(r.error.message).toContain("46");
    }
  });
});

describe("clothing-size-cn / 表访问与复制文本", () => {
  it("getSizeTable：已知分类返回整表，未知分类返回 null", () => {
    expect(getSizeTable("shoes")).toHaveLength(11);
    expect(getSizeTable("men")).toHaveLength(6);
    expect(getSizeTable("nope")).toBeNull();
  });
  it("formatSizeComparison 含四制、参考区间与免责声明", () => {
    const r = convertClothingSize({
      category: "women",
      system: "cn",
      value: "165",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const text = formatSizeComparison(r.value);
      expect(text).toContain("女装上装");
      expect(text).toContain("中国号 165");
      expect(text).toContain("欧洲号 38");
      expect(text).toContain("美国号 6");
      expect(text).toContain("英国号 10");
      expect(text).toContain("字母码 M");
      expect(text).toContain(
        "仅供参考，各品牌尺码存在差异，请以实际商品尺码表为准",
      );
    }
  });
});
