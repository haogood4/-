// 手机号归属地查询引擎（纯函数，无 DOM / 无 fetch）
// 架构约定：号段数据（public/data/phone-region-{13..19}.json）不进 JS bundle，
// 由页面脚本按手机号前 2 位懒加载对应分块并以参数注入。
// 数据格式：d 为按前 7 位号段升序、区间不重叠的 [起, 止, 省, 市, 运营商] 数组。

/** 单条号段记录：[起始前7位, 结束前7位, 省份, 城市, 运营商] */
export type PhoneRegionRow = [string, string, string, string, string];

export interface PhoneRegionChunk {
  /** 数据版本（如 "2302" = 2023 年 2 月） */
  v: string;
  d: PhoneRegionRow[];
}

export interface PhoneRegionInput {
  phone: string;
  chunk: PhoneRegionChunk;
}

export interface PhoneRegionValue {
  province: string;
  city: string;
  vendor: string;
  /** 命中的手机号前 7 位 */
  prefix7: string;
}

export type PhoneRegionResult =
  | { ok: true; value: PhoneRegionValue }
  | {
      ok: false;
      error: { code: "INVALID" | "NOT_FOUND"; message: string };
    };

const PHONE_RE = /^1\d{10}$/;

export function lookupPhoneRegion(input: PhoneRegionInput): PhoneRegionResult {
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  if (!PHONE_RE.test(phone)) {
    return {
      ok: false,
      error: { code: "INVALID", message: "请输入 11 位中国大陆手机号" },
    };
  }
  const prefix7 = phone.slice(0, 7);

  // 二分查找：d 升序且区间不重叠，等长数字串可直接按字典序比较
  const rows = input.chunk.d;
  let lo = 0;
  let hi = rows.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const row = rows[mid];
    if (prefix7 < row[0]) {
      hi = mid - 1;
    } else if (prefix7 > row[1]) {
      lo = mid + 1;
    } else {
      return {
        ok: true,
        value: {
          province: row[2],
          city: row[3],
          vendor: row[4],
          prefix7,
        },
      };
    }
  }
  return {
    ok: false,
    error: { code: "NOT_FOUND", message: "该号段未收录或尚未分配" },
  };
}
