// src/lib/tool-store.test.ts — 最近使用/收藏纯逻辑单测（P2-10）
import { describe, it, expect } from "vitest";
import {
  RECENT_KEY,
  FAV_KEY,
  RECENT_LIMIT,
  resolveTool,
  recordRecent,
  listRecent,
  toggleFav,
  isFav,
  removeFav,
  listFav,
  type Store,
} from "./tool-store";

function memStore(
  init: Record<string, string> = {},
): Store & { data: Map<string, string> } {
  const data = new Map<string, string>(Object.entries(init));
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
  };
}

describe("resolveTool", () => {
  it("命中 nav 工具（带尾斜杠）", () => {
    const t = resolveTool("/finance/mortgage-cn/");
    expect(t).not.toBeNull();
    expect(t?.h).toBe("/finance/mortgage-cn/");
    expect(t?.l).toContain("房贷");
  });
  it("无尾斜杠归一化命中", () => {
    expect(resolveTool("/daily/age")).not.toBeNull();
  });
  it("非工具路径返回 null", () => {
    expect(resolveTool("/search/")).toBeNull();
    expect(resolveTool("/")).toBeNull();
    expect(resolveTool("/articles/foo/")).toBeNull();
  });
});

describe("recordRecent / listRecent", () => {
  it("首次记录", () => {
    const s = memStore();
    recordRecent(s, "/daily/age/", 1000);
    expect(listRecent(s)).toEqual([
      { h: "/daily/age/", l: "年龄计算器", t: 1000 },
    ]);
  });
  it("重复记录去重并置顶", () => {
    const s = memStore();
    recordRecent(s, "/daily/age/", 1);
    recordRecent(s, "/daily/date-diff/", 2);
    recordRecent(s, "/daily/age/", 3);
    const list = listRecent(s);
    expect(list.map((e) => e.h)).toEqual(["/daily/age/", "/daily/date-diff/"]);
    expect(list[0].t).toBe(3);
  });
  it("超出上限截断", () => {
    const s = memStore();
    const paths = [
      "/daily/age/",
      "/daily/date-diff/",
      "/math/percentage/",
      "/math/discount/",
      "/unit/length/",
      "/unit/temperature/",
      "/math/average/",
      "/math/ratio/",
      "/math/unit-price/",
      "/dev/timestamp/",
    ];
    paths.forEach((p, i) => recordRecent(s, p, i + 1));
    const list = listRecent(s);
    expect(list.length).toBe(RECENT_LIMIT);
    expect(list[0].h).toBe("/dev/timestamp/");
  });
  it("非工具页不记录", () => {
    const s = memStore();
    recordRecent(s, "/search/", 1);
    expect(listRecent(s)).toEqual([]);
  });
  it("损坏 JSON 兜底为空列表", () => {
    const s = memStore({ [RECENT_KEY]: "{not json" });
    expect(listRecent(s)).toEqual([]);
    recordRecent(s, "/daily/age/", 9);
    expect(listRecent(s).length).toBe(1);
  });
  it("混入非法条目时过滤保留合法项", () => {
    const s = memStore({
      [RECENT_KEY]: JSON.stringify([
        { h: "/daily/age/", l: "x", t: 1 },
        42,
        { bad: true },
      ]),
    });
    expect(listRecent(s).length).toBe(1);
  });
});

describe("toggleFav / isFav / removeFav", () => {
  it("添加与取消收藏", () => {
    const s = memStore();
    expect(toggleFav(s, "/daily/age/", "年龄计算器")).toBe(true);
    expect(isFav(s, "/daily/age/")).toBe(true);
    expect(toggleFav(s, "/daily/age/", "年龄计算器")).toBe(false);
    expect(isFav(s, "/daily/age/")).toBe(false);
    expect(listFav(s)).toEqual([]);
  });
  it("新收藏置顶", () => {
    const s = memStore();
    toggleFav(s, "/daily/age/", "A");
    toggleFav(s, "/math/percentage/", "B");
    expect(listFav(s).map((e) => e.h)).toEqual([
      "/math/percentage/",
      "/daily/age/",
    ]);
  });
  it("removeFav 只删目标项", () => {
    const s = memStore();
    toggleFav(s, "/daily/age/", "A");
    toggleFav(s, "/math/percentage/", "B");
    removeFav(s, "/daily/age/");
    expect(listFav(s).map((e) => e.h)).toEqual(["/math/percentage/"]);
  });
  it("损坏收藏数据兜底", () => {
    const s = memStore({ [FAV_KEY]: "[]" });
    s.setItem(FAV_KEY, "garbage");
    expect(isFav(s, "/daily/age/")).toBe(false);
    expect(toggleFav(s, "/daily/age/", "A")).toBe(true);
    expect(isFav(s, "/daily/age/")).toBe(true);
  });
});
