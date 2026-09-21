import { describe, expect, it } from "vitest";
import {
  filterByCategory,
  findByCode,
  searchStatus,
  type HttpStatusEntry,
} from "./http-status-cn";
// 状态码表单一来源：public/data/http-status-codes.json（页面运行时 lazy fetch 同一文件）
import rawCodes from "../../../public/data/http-status-codes.json";

const CODES = rawCodes as HttpStatusEntry[];

describe("外置状态码表完整性", () => {
  it("条目数 ≥ 60", () => {
    expect(CODES.length).toBeGreaterThanOrEqual(60);
  });

  it("每条字段齐全且分类合法", () => {
    const validCats = new Set([
      "1xx 信息",
      "2xx 成功",
      "3xx 重定向",
      "4xx 客户端错误",
      "5xx 服务端错误",
    ]);
    for (const c of CODES) {
      expect(Number.isInteger(c.code)).toBe(true);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.desc.length).toBeGreaterThan(0);
      expect(validCats.has(c.category)).toBe(true);
      // 分类与状态码首位一致
      expect(c.category[0]).toBe(String(Math.floor(c.code / 100)));
    }
  });

  it("状态码无重复", () => {
    const set = new Set(CODES.map((c) => c.code));
    expect(set.size).toBe(CODES.length);
  });
});

describe("filterByCategory", () => {
  it("全部返回所有条目", () => {
    expect(filterByCategory(CODES, "全部")).toHaveLength(CODES.length);
  });

  it("2xx 成功只含 2 开头", () => {
    const out = filterByCategory(CODES, "2xx 成功");
    expect(out.length).toBeGreaterThan(0);
    for (const c of out) expect(Math.floor(c.code / 100)).toBe(2);
  });

  it("4xx 客户端错误数量最多", () => {
    const sizes = [
      "1xx 信息",
      "2xx 成功",
      "3xx 重定向",
      "4xx 客户端错误",
      "5xx 服务端错误",
    ].map((cat) => filterByCategory(CODES, cat as "4xx 客户端错误").length);
    expect(Math.max(...sizes)).toBe(sizes[3]);
  });
});

describe("searchStatus", () => {
  it("按状态码数字搜索", () => {
    const out = searchStatus(CODES, "404");
    expect(out[0]?.name).toBe("Not Found");
  });

  it("按英文名不区分大小写搜索", () => {
    const out = searchStatus(CODES, "forbidden");
    expect(out[0]?.code).toBe(403);
  });

  it("空关键词返回全部", () => {
    expect(searchStatus(CODES, "  ")).toHaveLength(CODES.length);
  });
});

describe("findByCode", () => {
  it("精确命中 301", () => {
    expect(findByCode(CODES, 301)?.name).toBe("Moved Permanently");
  });

  it("未收录返回 undefined", () => {
    expect(findByCode(CODES, 599)).toBeUndefined();
  });
});
