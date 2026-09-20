// 复利计算器：终值 / 现值 / 年化
import { validateNumber, formatResult } from "./_shared";

export type CompoundMode = "fv" | "pv" | "rate";

export type CompoundInput = {
  mode: CompoundMode;
  principal?: string;
  rate?: string; // 年利率 %
  years?: string;
  fv?: string;
  pv?: string;
};

export type CompoundResult =
  | {
      ok: true;
      value: number;
      process: string;
    }
  | {
      ok: false;
      error: { code: string; message: string };
    };

export function calculateCompound(input: CompoundInput): CompoundResult {
  switch (input.mode) {
    case "fv": {
      const p = validateNumber(input.principal ?? "");
      if (!p.ok) return p;
      const r = validateNumber(input.rate ?? "");
      if (!r.ok) return r;
      const y = validateNumber(input.years ?? "");
      if (!y.ok) return y;
      if (p.value < 0)
        return {
          ok: false,
          error: { code: "OUT_OF_RANGE", message: "本金不能为负" },
        };
      if (y.value < 0 || y.value > 100)
        return {
          ok: false,
          error: { code: "OUT_OF_RANGE", message: "年限须 0-100" },
        };
      const fv = p.value * Math.pow(1 + r.value / 100, y.value);
      return {
        ok: true,
        value: fv,
        process: `${p.value} × (1 + ${r.value}%)^${y.value} = ${fv.toFixed(2)}`,
      };
    }
    case "pv": {
      const fv = validateNumber(input.fv ?? "");
      if (!fv.ok) return fv;
      const r = validateNumber(input.rate ?? "");
      if (!r.ok) return r;
      const y = validateNumber(input.years ?? "");
      if (!y.ok) return y;
      if (fv.value < 0)
        return {
          ok: false,
          error: { code: "OUT_OF_RANGE", message: "终值不能为负" },
        };
      const pv = fv.value / Math.pow(1 + r.value / 100, y.value);
      return {
        ok: true,
        value: pv,
        process: `${fv.value} / (1 + ${r.value}%)^${y.value} = ${pv.toFixed(2)}`,
      };
    }
    case "rate": {
      const p = validateNumber(input.pv ?? "");
      if (!p.ok) return p;
      const fv = validateNumber(input.fv ?? "");
      if (!fv.ok) return fv;
      const y = validateNumber(input.years ?? "");
      if (!y.ok) return y;
      if (p.value <= 0 || fv.value <= 0)
        return {
          ok: false,
          error: { code: "OUT_OF_RANGE", message: "本/终值须大于 0" },
        };
      const rate = (Math.pow(fv.value / p.value, 1 / y.value) - 1) * 100;
      return {
        ok: true,
        value: rate,
        process: `((${fv.value}/${p.value})^(1/${y.value}) - 1) × 100 = ${rate.toFixed(4)}%`,
      };
    }
  }
}

export function formatCompound(value: number): string {
  return formatResult(value);
}
