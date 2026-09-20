// 跨行转账手续费计算器（柜台 / 网上银行 / 手机银行 / ATM 对照）
// 政策依据：发改委《政府定价的经营服务性收费目录》（发改价格〔2014〕268 号）
//   个人跨行柜台转账汇款政府指导价：≤2000 元 2 元/笔；2000~5000（含）5 元/笔；
//   5000~10000（含）10 元/笔；10000~50000（含）15 元/笔；>50000 按 0.03% 收取、最高 50 元/笔。
// 渠道折算：柜台=指导价原价；网上银行=柜台价 4 折（部分银行口径，最高 20 元/笔）；
//   手机银行=0 元（主流银行全免）；ATM=0 元（2021-07-25 起跨行 ATM 取现/转账暂免，
//   注意 ATM 转账单日限额 5 万元）。实际收费以各银行公示为准。

export type TransferChannel = "counter" | "netbank" | "mobile" | "atm";

export type TransferFeeErrorCode =
  "EMPTY" | "INVALID_NUMBER" | "OUT_OF_RANGE" | "NEGATIVE";

export type TransferFeeField = "amount" | "channel";

export type TransferFeeResult =
  | {
      ok: true;
      fee: number; // 所选渠道应收手续费
      counterFee: number; // 柜台指导价（对照）
      noteText: string; // 渠道说明
      formulaText: string;
    }
  | {
      ok: false;
      error: {
        code: TransferFeeErrorCode;
        message: string;
        field: TransferFeeField;
      };
    };

const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;

const AMOUNT_MIN = 0.01;
const AMOUNT_MAX = 10_000_000;

// 柜台政府指导价分档：上限（含）→ 固定费；> 50000 按 0.03%、最高 50
const COUNTER_TIERS: Array<{ upTo: number; fee: number; label: string }> = [
  { upTo: 2000, fee: 2, label: "≤2000 元档 2 元/笔" },
  { upTo: 5000, fee: 5, label: "2000~5000（含）档 5 元/笔" },
  { upTo: 10000, fee: 10, label: "5000~10000（含）档 10 元/笔" },
  { upTo: 50000, fee: 15, label: "10000~50000（含）档 15 元/笔" },
];
const RATE_ABOVE = 0.0003; // > 50000 元按 0.03%
const FEE_CAP_ABOVE = 50; // 最高 50 元/笔
const NETBANK_DISCOUNT = 0.4; // 网银 = 柜台价 4 折
const NETBANK_CAP = 20; // 网银最高 20 元/笔

const CHANNELS: TransferChannel[] = ["counter", "netbank", "mobile", "atm"];

function counterGuidedFee(amount: number): { fee: number; label: string } {
  for (const t of COUNTER_TIERS) {
    if (amount <= t.upTo) return { fee: t.fee, label: t.label };
  }
  const byRate = amount * RATE_ABOVE;
  const fee = Math.min(byRate, FEE_CAP_ABOVE);
  const label =
    byRate > FEE_CAP_ABOVE
      ? `>50000 元按 0.03% = ${byRate.toFixed(2)} 元，封顶 50 元/笔`
      : `>50000 元按 0.03% = ${fee.toFixed(2)} 元（未超 50 元上限）`;
  return { fee, label };
}

function fail(
  code: TransferFeeErrorCode,
  message: string,
  field: TransferFeeField,
): TransferFeeResult {
  return { ok: false, error: { code, message, field } };
}

function parseAmount(s: string): number | TransferFeeResult {
  const trimmed = s.trim();
  if (trimmed === "") return fail("EMPTY", "请填写转账金额", "amount");
  if (!NUMBER_RE.test(trimmed))
    return fail("INVALID_NUMBER", "请输入有效数字", "amount");
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail("INVALID_NUMBER", "请输入有效数字", "amount");
  const dot = trimmed.indexOf(".");
  const decimals = dot === -1 ? 0 : trimmed.length - dot - 1;
  if (decimals > 2)
    return fail("INVALID_NUMBER", "金额最多保留 2 位小数", "amount");
  if (n < 0) return fail("NEGATIVE", "转账金额不能为负数", "amount");
  if (n < AMOUNT_MIN || n > AMOUNT_MAX)
    return fail(
      "OUT_OF_RANGE",
      "转账金额须在 0.01 ~ 10,000,000 元之间",
      "amount",
    );
  return n;
}

function isChannel(s: string): s is TransferChannel {
  return (CHANNELS as string[]).includes(s);
}

export function calculateTransferFee(input: {
  amount: string;
  channel: string;
}): TransferFeeResult {
  const { amount, channel } = input;
  const n = parseAmount(amount);
  if (typeof n !== "number") return n;
  if (!isChannel(channel))
    return fail("OUT_OF_RANGE", "不支持的转账渠道", "channel");

  const guided = counterGuidedFee(n);
  const counterFee = guided.fee;

  let fee: number;
  let noteText: string;
  let channelText: string;
  switch (channel) {
    case "counter":
      fee = counterFee;
      noteText =
        "柜台转账按发改价格〔2014〕268 号政府指导价原价收取，各银行不得上浮。";
      channelText = `柜台按指导价原价收取 → ${fee.toFixed(2)} 元`;
      break;
    case "netbank": {
      fee = Math.min(counterFee * NETBANK_DISCOUNT, NETBANK_CAP);
      noteText =
        "网上银行转账按柜台指导价的 4 折收取、最高 20 元/笔（部分银行口径）；多数银行对 5000 元以下网银转账有免费优惠，以银行公示为准。";
      channelText = `网银 = ${counterFee.toFixed(2)}×40% = ${(counterFee * NETBANK_DISCOUNT).toFixed(2)} 元（最高 20 元）→ ${fee.toFixed(2)} 元`;
      break;
    }
    case "mobile":
      fee = 0;
      noteText =
        "主流银行手机银行转账全免（0 元）；个别银行政策可能调整，以银行公告为准。";
      channelText = "手机银行全免 → 0 元";
      break;
    case "atm":
      fee = 0;
      noteText =
        "跨行 ATM 取现/转账手续费暂免（2021-07-25 起）；注意 ATM 转账单日限额一般为 5 万元，以发卡行规定为准。";
      channelText = "跨行 ATM 暂免 → 0 元";
      break;
  }

  const formulaText = `柜台指导价：${n.toFixed(2)} 元 → ${guided.label} = ${counterFee.toFixed(2)} 元/笔；${channelText}`;

  return { ok: true, fee, counterFee, noteText, formulaText };
}

export const TRANSFER_FEE_DEFAULTS = {
  channel: "mobile" as TransferChannel,
};
