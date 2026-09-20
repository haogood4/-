export type DueDateInput = { lastPeriod: string };
export type DueDateResult = { dueDate: string; weeks: number };
export type DueDateCalcResult =
  | { ok: true; value: DueDateResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateDueDate(input: DueDateInput): DueDateCalcResult {
  const t = input.lastPeriod.trim();
  if (!t)
    return {
      ok: false,
      error: { code: "EMPTY", message: "请输入末次月经日期" },
    };
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m)
    return {
      ok: false,
      error: { code: "INVALID_FORMAT", message: "日期格式：YYYY-MM-DD" },
    };
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (isNaN(date.getTime()))
    return {
      ok: false,
      error: { code: "INVALID_FORMAT", message: "无效日期" },
    };
  date.setDate(date.getDate() + 280);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const dueDate = yyyy + "-" + mm + "-" + dd;
  const weeks = 40;
  return { ok: true, value: { dueDate, weeks } };
}
export function formatDueDate(value: DueDateResult) {
  return { dueDate: value.dueDate, weeks: value.weeks + " 周" };
}
