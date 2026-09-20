export type BaseInput = { value: string; fromBase: string; toBase: string };
export type BaseResult = { result: string };
export type BaseCalcResult =
  | { ok: true; value: BaseResult }
  | { ok: false; error: { code: string; message: string } };
export function convertBase(input: BaseInput): BaseCalcResult {
  const v = input.value.trim();
  const from = Number(input.fromBase);
  const to = Number(input.toBase);
  if (!v) return { ok: false, error: { code: "EMPTY", message: "请输入数值" } };
  if (![2, 8, 10, 16].includes(from) || ![2, 8, 10, 16].includes(to))
    return {
      ok: false,
      error: { code: "INVALID_FORMAT", message: "进制须为 2/8/10/16" },
    };
  const n = parseInt(v, from);
  if (isNaN(n))
    return {
      ok: false,
      error: { code: "INVALID_FORMAT", message: "无效数值" },
    };
  return { ok: true, value: { result: n.toString(to) } };
}
export function formatBase(value: BaseResult) {
  return { result: value.result };
}
