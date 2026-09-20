/**
 * src/lib/tool-store.ts — 最近使用 / 我的收藏（P2-10）纯逻辑层
 * 存储介质为 localStorage（经 Store 接口注入，便于单测与隐私模式降级）。
 * 所有读取对损坏数据 / 异常存储做兜底，绝不抛错到调用方。
 */
import { NAV_CATEGORIES } from "../data/nav";

export const RECENT_KEY = "caldaq:recent-v1";
export const FAV_KEY = "caldaq:fav-v1";
export const RECENT_LIMIT = 8;
export const FAV_LIMIT = 24;

export interface Store {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ToolEntry {
  /** 站内 URL（与 nav.ts href 一致，作为唯一键） */
  h: string;
  /** 显示名 */
  l: string;
}

export interface RecentEntry extends ToolEntry {
  /** 最后访问时间戳（ms） */
  t: number;
}

/** localStorage 适配器；不可用（隐私模式等）时退化为内存 Map */
export function browserStore(): Store {
  try {
    const probe = "__caldaq_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return {
      getItem: (k) => window.localStorage.getItem(k),
      setItem: (k, v) => window.localStorage.setItem(k, v),
    };
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => {
        mem.set(k, v);
      },
    };
  }
}

/** 按 pathname 解析工具条目（尾斜杠归一化）；非工具页返回 null */
export function resolveTool(pathname: string): ToolEntry | null {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  for (const cat of NAV_CATEGORIES) {
    for (const tool of cat.tools) {
      if (tool.href === path) return { h: tool.href, l: tool.label };
    }
  }
  return null;
}

function readList<T>(store: Store, key: string): T[] {
  try {
    const raw = store.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is T =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as ToolEntry).h === "string" &&
        typeof (x as ToolEntry).l === "string",
    );
  } catch {
    return [];
  }
}

function writeList(store: Store, key: string, list: unknown): void {
  try {
    store.setItem(key, JSON.stringify(list));
  } catch {
    // 配额满等异常静默：功能为增强项，不阻塞计算
  }
}

/** 记录一次使用：去重、置顶、限长。pathname 非工具页时不记录。 */
export function recordRecent(
  store: Store,
  pathname: string,
  now = Date.now(),
): void {
  const tool = resolveTool(pathname);
  if (!tool) return;
  const rest = readList<RecentEntry>(store, RECENT_KEY).filter(
    (e) => e.h !== tool.h,
  );
  writeList(
    store,
    RECENT_KEY,
    [{ ...tool, t: now }, ...rest].slice(0, RECENT_LIMIT),
  );
}

export function listRecent(store: Store): RecentEntry[] {
  return readList<RecentEntry>(store, RECENT_KEY);
}

export function isFav(store: Store, href: string): boolean {
  return readList<ToolEntry>(store, FAV_KEY).some((e) => e.h === href);
}

/** 切换收藏，返回切换后的状态 */
export function toggleFav(store: Store, href: string, label: string): boolean {
  const list = readList<ToolEntry>(store, FAV_KEY);
  const idx = list.findIndex((e) => e.h === href);
  let nowFav: boolean;
  if (idx >= 0) {
    list.splice(idx, 1);
    nowFav = false;
  } else {
    list.unshift({ h: href, l: label });
    nowFav = true;
  }
  writeList(store, FAV_KEY, list.slice(0, FAV_LIMIT));
  return nowFav;
}

export function removeFav(store: Store, href: string): void {
  writeList(
    store,
    FAV_KEY,
    readList<ToolEntry>(store, FAV_KEY).filter((e) => e.h !== href),
  );
}

export function listFav(store: Store): ToolEntry[] {
  return readList<ToolEntry>(store, FAV_KEY);
}
