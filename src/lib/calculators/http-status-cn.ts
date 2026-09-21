// HTTP 状态码查询引擎 —— 数据外置于 public/data/http-status-codes.json
//（61 条，页面脚本 lazy fetch），引擎只做纯函数过滤/查找，不自行加载数据。
export type HttpStatusCategory =
  "1xx 信息" | "2xx 成功" | "3xx 重定向" | "4xx 客户端错误" | "5xx 服务端错误";

export const HTTP_CATEGORIES: readonly (HttpStatusCategory | "全部")[] = [
  "全部",
  "1xx 信息",
  "2xx 成功",
  "3xx 重定向",
  "4xx 客户端错误",
  "5xx 服务端错误",
];

export interface HttpStatusEntry {
  code: number;
  name: string;
  desc: string;
  category: string;
}

/** 按分类过滤（"全部" 返回原数组浅拷贝） */
export function filterByCategory(
  codes: readonly HttpStatusEntry[],
  category: HttpStatusCategory | "全部",
): HttpStatusEntry[] {
  if (category === "全部") return [...codes];
  return codes.filter((c) => c.category === category);
}

/** 按关键词搜索：匹配状态码数字或英文名/中文描述（不区分大小写） */
export function searchStatus(
  codes: readonly HttpStatusEntry[],
  query: string,
): HttpStatusEntry[] {
  const q = query.trim().toLowerCase();
  if (q === "") return [...codes];
  return codes.filter(
    (c) =>
      String(c.code).includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q),
  );
}

/** 精确查找某状态码 */
export function findByCode(
  codes: readonly HttpStatusEntry[],
  code: number,
): HttpStatusEntry | undefined {
  return codes.find((c) => c.code === code);
}
