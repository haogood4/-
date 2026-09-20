import { describe, expect, it } from "vitest";
import { lookupPhoneRegion, type PhoneRegionChunk } from "./phone-region-cn";

// 手写小区间数组（不读 public/data）：升序、区间不重叠
const CHUNK: PhoneRegionChunk = {
  v: "2302",
  d: [
    ["1300000", "1300099", "北京", "北京", "中国联通"],
    ["1310000", "1310050", "上海", "上海", "中国联通"],
    ["1380000", "1380099", "广东", "广州", "中国移动"],
  ],
};

const run = (phone: string, chunk: PhoneRegionChunk = CHUNK) =>
  lookupPhoneRegion({ phone, chunk });

describe("lookupPhoneRegion / 二分命中", () => {
  it("区间中部命中", () => {
    const r = run("13000501234");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toEqual({
        province: "北京",
        city: "北京",
        vendor: "中国联通",
        prefix7: "1300050",
      });
    }
  });

  it("区间起点边界命中", () => {
    const r = run("13000001234");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.province).toBe("北京");
  });

  it("区间终点边界命中", () => {
    const r = run("13000991234");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.vendor).toBe("中国联通");
  });

  it("最后一个区间命中（hi 收敛路径）", () => {
    const r = run("13800001234");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toEqual({
        province: "广东",
        city: "广州",
        vendor: "中国移动",
        prefix7: "1380000",
      });
    }
  });

  it("首尾带空格的输入先 trim 再查询", () => {
    const r = run("  13100001234  ");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.city).toBe("上海");
  });
});

describe("lookupPhoneRegion / 未命中", () => {
  it("落在两个区间之间的空隙 → NOT_FOUND", () => {
    const r = run("13001001234");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("NOT_FOUND");
      expect(r.error.message).toBe("该号段未收录或尚未分配");
    }
  });

  it("小于最小区间起点 → NOT_FOUND", () => {
    const r = run("12999991234");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });

  it("大于最大区间终点 → NOT_FOUND", () => {
    const r = run("13801001234");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });

  it("12 开头格式合法但本分块未收录 → NOT_FOUND（前缀过滤由页面脚本负责）", () => {
    const r = run("12345678901");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });

  it("空数据块 → NOT_FOUND", () => {
    const r = run("13800001234", { v: "2302", d: [] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });
});

describe("lookupPhoneRegion / 格式校验", () => {
  it("不足 11 位 → INVALID", () => {
    const r = run("1380000123");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID");
      expect(r.error.message).toBe("请输入 11 位中国大陆手机号");
    }
  });

  it("超过 11 位 → INVALID", () => {
    expect(run("138000012345").ok).toBe(false);
  });

  it("非 1 开头 → INVALID", () => {
    expect(run("23800001234").ok).toBe(false);
    expect(run("03800001234").ok).toBe(false);
  });

  it("含非数字字符 → INVALID", () => {
    expect(run("138-0000-1234").ok).toBe(false);
    expect(run("1380000123a").ok).toBe(false);
  });

  it("空字符串 / 纯空白 → INVALID", () => {
    expect(run("").ok).toBe(false);
    const r = run("    ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID");
  });
});
