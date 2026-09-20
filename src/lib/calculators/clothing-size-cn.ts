// 服装尺码对照/换算引擎（男装上装 / 女装上装 / 童装上装 / 鞋码，CN·EU·US·UK 四制互查）
// 纯查表逻辑：所有对外函数返回判别联合，绝不 throw。
// 数据为行业通用参考对照（内置 const 表），各品牌版型差异由页面免责声明覆盖。

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

// ---------- 内置对照表 ----------

/** 男装上装：S–3XL ↔ CN 165–190 ↔ EU 46–56 ↔ US 36–46 ↔ UK 14–24 */
const MEN_TOPS: readonly SizeRow[] = [
  {
    cn: "165",
    eu: "46",
    us: "36",
    uk: "14",
    label: "S",
    chestMin: 86,
    chestMax: 90,
    waistMin: 72,
    waistMax: 78,
  },
  {
    cn: "170",
    eu: "48",
    us: "38",
    uk: "16",
    label: "M",
    chestMin: 90,
    chestMax: 94,
    waistMin: 78,
    waistMax: 84,
  },
  {
    cn: "175",
    eu: "50",
    us: "40",
    uk: "18",
    label: "L",
    chestMin: 94,
    chestMax: 98,
    waistMin: 84,
    waistMax: 90,
  },
  {
    cn: "180",
    eu: "52",
    us: "42",
    uk: "20",
    label: "XL",
    chestMin: 98,
    chestMax: 104,
    waistMin: 90,
    waistMax: 96,
  },
  {
    cn: "185",
    eu: "54",
    us: "44",
    uk: "22",
    label: "2XL",
    chestMin: 104,
    chestMax: 110,
    waistMin: 96,
    waistMax: 102,
  },
  {
    cn: "190",
    eu: "56",
    us: "46",
    uk: "24",
    label: "3XL",
    chestMin: 110,
    chestMax: 116,
    waistMin: 102,
    waistMax: 108,
  },
];

/** 女装上装：XS–2XL ↔ CN 155–180 ↔ EU 34–44 ↔ US 2–12 ↔ UK 6–16 */
const WOMEN_TOPS: readonly SizeRow[] = [
  {
    cn: "155",
    eu: "34",
    us: "2",
    uk: "6",
    label: "XS",
    chestMin: 80,
    chestMax: 84,
    waistMin: 62,
    waistMax: 66,
  },
  {
    cn: "160",
    eu: "36",
    us: "4",
    uk: "8",
    label: "S",
    chestMin: 84,
    chestMax: 88,
    waistMin: 66,
    waistMax: 70,
  },
  {
    cn: "165",
    eu: "38",
    us: "6",
    uk: "10",
    label: "M",
    chestMin: 88,
    chestMax: 92,
    waistMin: 70,
    waistMax: 74,
  },
  {
    cn: "170",
    eu: "40",
    us: "8",
    uk: "12",
    label: "L",
    chestMin: 92,
    chestMax: 96,
    waistMin: 74,
    waistMax: 78,
  },
  {
    cn: "175",
    eu: "42",
    us: "10",
    uk: "14",
    label: "XL",
    chestMin: 96,
    chestMax: 102,
    waistMin: 78,
    waistMax: 84,
  },
  {
    cn: "180",
    eu: "44",
    us: "12",
    uk: "16",
    label: "2XL",
    chestMin: 102,
    chestMax: 108,
    waistMin: 84,
    waistMax: 90,
  },
];

/** 童装上装：CN 身高 110–160（EU 同以身高标注）↔ US/UK 年龄码 */
const KIDS_TOPS: readonly SizeRow[] = [
  {
    cn: "110",
    eu: "110",
    us: "4",
    uk: "3-4",
    chestMin: 55,
    chestMax: 58,
    ageNote: "3-4 岁",
  },
  {
    cn: "120",
    eu: "120",
    us: "6",
    uk: "5-6",
    chestMin: 59,
    chestMax: 63,
    ageNote: "5-6 岁",
  },
  {
    cn: "130",
    eu: "130",
    us: "8",
    uk: "7-8",
    chestMin: 64,
    chestMax: 68,
    ageNote: "7-8 岁",
  },
  {
    cn: "140",
    eu: "140",
    us: "10",
    uk: "9-10",
    chestMin: 69,
    chestMax: 74,
    ageNote: "9-10 岁",
  },
  {
    cn: "150",
    eu: "150",
    us: "12",
    uk: "11-12",
    chestMin: 75,
    chestMax: 81,
    ageNote: "11-12 岁",
  },
  {
    cn: "160",
    eu: "160",
    us: "14",
    uk: "13",
    chestMin: 82,
    chestMax: 88,
    ageNote: "13 岁以上",
  },
];

/** 鞋码：EU 36–46 ↔ CN 毫米数 ↔ US Men ↔ UK，附脚长参考（cm） */
const SHOES: readonly SizeRow[] = [
  { cn: "230", eu: "36", us: "4", uk: "3", footCm: 23.0 },
  { cn: "235", eu: "37", us: "4.5", uk: "3.5", footCm: 23.5 },
  { cn: "240", eu: "38", us: "5.5", uk: "4.5", footCm: 24.0 },
  { cn: "245", eu: "39", us: "6.5", uk: "5.5", footCm: 24.5 },
  { cn: "250", eu: "40", us: "7", uk: "6", footCm: 25.0 },
  { cn: "255", eu: "41", us: "8", uk: "7", footCm: 25.5 },
  { cn: "260", eu: "42", us: "8.5", uk: "7.5", footCm: 26.0 },
  { cn: "265", eu: "43", us: "9.5", uk: "8.5", footCm: 26.5 },
  { cn: "270", eu: "44", us: "10", uk: "9", footCm: 27.0 },
  { cn: "275", eu: "45", us: "11", uk: "10", footCm: 27.5 },
  { cn: "280", eu: "46", us: "11.5", uk: "11", footCm: 28.0 },
];

export const CLOTHING_SIZE_TABLES: Record<
  ClothingCategory,
  readonly SizeRow[]
> = {
  men: MEN_TOPS,
  women: WOMEN_TOPS,
  kids: KIDS_TOPS,
  shoes: SHOES,
};

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
  return Object.prototype.hasOwnProperty.call(CLOTHING_SIZE_TABLES, value);
}

export function isSizeSystem(value: string): value is SizeSystem {
  return value === "cn" || value === "eu" || value === "us" || value === "uk";
}

/** 取分类对照表；未知分类返回 null（不抛错） */
export function getSizeTable(category: string): readonly SizeRow[] | null {
  return isClothingCategory(category) ? CLOTHING_SIZE_TABLES[category] : null;
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
 * 尺码换算主入口：按分类 + 号制查对照行，返回四制全量与参考区间。
 * 输入全部按字符串接收并防御式校验，任何失败走 { ok: false }，绝不 throw。
 */
export function convertClothingSize(input: {
  category: string;
  system: string;
  value: string;
}): ClothingSizeOutput {
  const { category, system, value } = input;
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
  const table = CLOTHING_SIZE_TABLES[category];
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

/** 复制用完整对照文本（含免责声明） */
export function formatSizeComparison(value: ClothingSizeResult): string {
  const letter = value.label ? `（字母码 ${value.label}）` : "";
  return (
    `${value.categoryLabel}尺码对照：中国号 ${value.cn} / 欧洲号 ${value.eu}` +
    ` / 美国号 ${value.us} / 英国号 ${value.uk}${letter}；` +
    `参考区间：${value.measures}。` +
    `仅供参考，各品牌尺码存在差异，请以实际商品尺码表为准。`
  );
}
