// src/lib/calculators/ai-prompts-cn.ts — AI 提示词过滤（纯函数）
// 词库外置于 public/data/ai-prompts.json（36 条中文模板约 10KB 源文本，
// 按项目「工具数据外置」惯例由页面 lazy fetch 加载，避免数据内联进 JS）；
// 本模块只保留类型与过滤逻辑，供单测覆盖。

export interface PromptItem {
  id: string;
  category: string;
  title: string;
  /** 提示词模板，{占位符} 由使用者替换为实际内容 */
  content: string;
}

export interface PromptLibrary {
  categories: readonly string[];
  prompts: readonly PromptItem[];
}

/**
 * 按分类与关键词过滤提示词列表。
 * @param prompts  提示词库（通常来自 /data/ai-prompts.json）
 * @param category 分类名；留空或「全部」表示不过滤
 * @param keyword  关键词；对标题与内容做不区分大小写的包含匹配
 */
export function filterPrompts(
  prompts: readonly PromptItem[],
  category?: string,
  keyword?: string,
): PromptItem[] {
  const cat = category ?? "";
  const kw = (keyword ?? "").trim().toLowerCase();
  return prompts.filter((p) => {
    if (cat !== "" && cat !== "全部" && p.category !== cat) return false;
    if (kw === "") return true;
    return (
      p.title.toLowerCase().includes(kw) || p.content.toLowerCase().includes(kw)
    );
  });
}
