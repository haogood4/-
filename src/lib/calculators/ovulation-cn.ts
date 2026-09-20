export type OvulationInput = { lastPeriod: string; cycle: string };
export type OvulationResult = {
  ovulationDate: string;
  fertileWindow: [string, string];
};
export type OvulationCalcResult =
  | { ok: true; value: OvulationResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateOvulation(input: OvulationInput): OvulationCalcResult {
  const t = input.lastPeriod.trim();
  const cycStr = input.cycle.trim();
  const cyc = Number(cycStr);
  if (!t)
    return {
      ok: false,
      error: { code: "EMPTY", message: "请输入末次月经日期" },
    };
  if (!cycStr || !Number.isInteger(cyc) || cyc < 20 || cyc > 45) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "周期须为 20-45 的整数" },
    };
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m)
    return {
      ok: false,
      error: { code: "INVALID_FORMAT", message: "日期格式：YYYY-MM-DD" },
    };
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  date.setDate(date.getDate() + (cyc - 14));
  const fmt = (d: Date) =>
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0");
  const ovulationDate = fmt(date);
  const start = new Date(date);
  start.setDate(start.getDate() - 5);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);
  return {
    ok: true,
    value: { ovulationDate, fertileWindow: [fmt(start), fmt(end)] },
  };
}
export function formatOvulation(value: OvulationResult) {
  return {
    ovulationDate: value.ovulationDate,
    fertileWindow: value.fertileWindow[0] + " ~ " + value.fertileWindow[1],
  };
}
