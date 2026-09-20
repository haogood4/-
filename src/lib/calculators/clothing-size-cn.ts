// 服装尺码对照/换算引擎（男装上装 / 女装上装 / 童装上装 / 鞋码，CN·EU·US·UK 四制互查）
// 架构约定：对照表数据外置于 public/data/clothing-size.json（不进 JS bundle），
// 由页面脚本首次使用时懒加载并以 tables 参数注入；匹配/别名逻辑留在本引擎。
// 所有对外函数返回判别联合，绝不 throw。数据为行业通用参考对照，
// 各品牌版型差异由页面免责声明覆盖。

export type ClothingCategory = "men" | "women" | "kids" | "shoes";
export type SizeSystem = "cn" | "eu" | "us" | "uk";

export interface SizeRow {
  /** 中国号（上装为身高 cm 号型，鞋码为毫米数） */
  cn: string;
  /** 欧洲号 */
  eu: string;
  /** 美国号（鞋码为 US Men） */
  us: string;
  /** 英国号 */
  uk: string;
  /** 字母码别名（如 S/M/L/XL），任意号制下均可直接输入匹配 */
  label?: string;
  /** 胸围/净胸围参考区间下限（cm） */
  chestMin?: number;
  /** 胸围/净胸围参考区间上限（cm） */
  chestMax?: number;
  /** 腰围参考区间下限（cm） */
  waistMin?: number;
  /** 腰围参考区间上限（cm） */
  waistMax?: number;
  /** 脚长参考值（cm，仅鞋码） */
  footCm?: number;
  /** 适用年龄参考（仅童装） */
  ageNote?: string;
}

// ---------- 对照表数据类型与分类常量 ----------

/** 全量对照表：分类 → 行数组，即 public/data/clothing-size.json 的结构 */
export type ClothingSizeTables = Record<ClothingCategory, readonly SizeRow[]>;

/** 支持的分类（与 JSON 顶层键一致；数据外置后仅保留键名常量） */
const CLOTHING_CATEGORIES: readonly ClothingCategory[] = [
  "men",
  "women",
  "kids",
  "shoes",
];

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  men: "男装上装",
  women: "女装上装",
  kids: "童装上装",
  shoes: "鞋码",
};

export const SYSTEM_LABELS: Record<SizeSystem, string> = {
  cn: "中国号",
  eu: "欧洲号",
  us: "美国号",
  uk: "英国号",
};

/** 字母码别名：XXL→2XL、XXXL→3XL（大小写与空格不敏感） */
const LABEL_ALIASES: Record<string, string> = {
  xxl: "2xl",
  xxxl: "3xl",
};

// ---------- 类型守卫与表访问 ----------

export function isClothingCategory(value: string): value is ClothingCategory {
  return (CLOTHING_CATEGORIES as readonly string[]).includes(value);
}

export function isSizeSystem(value: string): value is SizeSystem {
  return value === "cn" || value === "eu" || value === "us" || value === "uk";
}

/** 取分类对照表；未知分类或数据缺失返回 null（不抛错） */
export function getSizeTable(
  category: string,
  tables: ClothingSizeTables,
): readonly SizeRow[] | null {
  if (!isClothingCategory(category) || !tables) return null;
  const table: readonly SizeRow[] | undefined = tables[category];
  return Array.isArray(table) ? table : null;
}

// ---------- 匹配逻辑 ----------

function normalizeSize(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

function toNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/** 数值型号（如 40 与 40.0）按数值比较；非数值（如 "3-4"）按规范化字符串比较 */
function sameSize(a: string, b: string): boolean {
  const na = toNumber(a);
  const nb = toNumber(b);
  if (na !== null && nb !== null) return Math.abs(na - nb) < 1e-9;
  return normalizeSize(a) === normalizeSize(b);
}

function matchesRow(row: SizeRow, system: SizeSystem, raw: string): boolean {
  if (sameSize(row[system], raw)) return true;
  if (row.label === undefined) return false;
  const nv = normalizeSize(raw);
  const nl = normalizeSize(row.label);
  return nv === nl || LABEL_ALIASES[nv] === nl;
}

function measuresText(row: SizeRow): string {
  const parts: string[] = [];
  if (row.chestMin !== undefined && row.chestMax !== undefined) {
    parts.push(`胸围 ${row.chestMin}–${row.chestMax} cm`);
  }
  if (row.waistMin !== undefined && row.waistMax !== undefined) {
    parts.push(`腰围 ${row.waistMin}–${row.waistMax} cm`);
  }
  if (row.footCm !== undefined) {
    parts.push(`脚长约 ${row.footCm.toFixed(1)} cm`);
  }
  if (row.ageNote !== undefined) {
    parts.push(`适用年龄 ${row.ageNote}`);
  }
  return parts.join(" · ");
}

// ---------- 对外结果类型 ----------

export interface ClothingSizeResult {
  category: ClothingCategory;
  categoryLabel: string;
  system: SizeSystem;
  systemLabel: string;
  /** 用户输入的原始号（已 trim） */
  input: string;
  cn: string;
  eu: string;
  us: string;
  uk: string;
  /** 字母码；鞋码等无字母码时为空串 */
  label: string;
  /** 胸围/腰围/脚长/年龄参考区间描述 */
  measures: string;
}

export type ClothingErrorCode =
  "EMPTY" | "UNKNOWN_CATEGORY" | "UNKNOWN_SYSTEM" | "SIZE_NOT_FOUND";

export interface ClothingSizeError {
  code: ClothingErrorCode;
  message: string;
}

export type ClothingSizeOutput =
  | { ok: true; value: ClothingSizeResult }
  | { ok: false; error: ClothingSizeError };

/**
 * 尺码换算主入口：按分类 + 号制在注入的对照表（tables）中查行，返回四制全量与参考区间。
 * 输入全部按字符串接收并防御式校验，任何失败走 { ok: false }，绝不 throw。
 */
export function convertClothingSize(input: {
  category: string;
  system: string;
  value: string;
  tables: ClothingSizeTables;
}): ClothingSizeOutput {
  const { category, system, value, tables } = input;
  if (typeof category !== "string" || !isClothingCategory(category)) {
    return {
      ok: false,
      error: { code: "UNKNOWN_CATEGORY", message: "请选择有效的服装分类" },
    };
  }
  if (typeof system !== "string" || !isSizeSystem(system)) {
    return {
      ok: false,
      error: { code: "UNKNOWN_SYSTEM", message: "请选择有效的号制" },
    };
  }
  const raw = typeof value === "string" ? value.trim() : "";
  if (raw === "") {
    return { ok: false, error: { code: "EMPTY", message: "请输入或选择尺码" } };
  }
  const table = getSizeTable(category, tables);
  if (!table) {
    return {
      ok: false,
      error: {
        code: "SIZE_NOT_FOUND",
        message: "尺码数据不可用，请刷新页面重试",
      },
    };
  }
  const row = table.find((r) => matchesRow(r, system, raw));
  if (!row) {
    const valid = table.map((r) => r[system]).join("、");
    return {
      ok: false,
      error: {
        code: "SIZE_NOT_FOUND",
        message: `未找到该尺码。${CATEGORY_LABELS[category]}·${SYSTEM_LABELS[system]}有效值：${valid}`,
      },
    };
  }
  return {
    ok: true,
    value: {
      category,
      categoryLabel: CATEGORY_LABELS[category],
      system,
      systemLabel: SYSTEM_LABELS[system],
      input: raw,
      cn: row.cn,
      eu: row.eu,
      us: row.us,
      uk: row.uk,
      label: row.label ?? "",
      measures: measuresText(row),
    },
  };
}

/** 复制用完整对照文本（含免责声明）；仅消费换算结果，无需表数据 */
export function formatSizeComparison(value: ClothingSizeResult): string {
  const letter = value.label ? `（字母码 ${value.label}）` : "";
  return (
    `${value.categoryLabel}尺码对照：中国号 ${value.cn} / 欧洲号 ${value.eu}` +
    ` / 美国号 ${value.us} / 英国号 ${value.uk}${letter}；` +
    `参考区间：${value.measures}。` +
    `仅供参考，各品牌尺码存在差异，请以实际商品尺码表为准。`
  );
}
