import { describe, expect, it } from "vitest";
import { calculateCompound } from "./compound-interest-cn";

describe("compound-interest-cn", () => {
  it("FV: 10000 7% 10年", () => {
    const r = calculateCompound({
      mode: "fv",
      principal: "10000",
      rate: "7",
      years: "10",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(19672, 0);
  });
  it("PV: 现值倒推", () => {
    const r = calculateCompound({
      mode: "pv",
      fv: "19672",
      rate: "7",
      years: "10",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(10000, 0);
  });
  it("RATE: 反推年化", () => {
    const r = calculateCompound({
      mode: "rate",
      pv: "10000",
      fv: "19672",
      years: "10",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(7.0003, 3);
  });
  it("空输入拒绝", () => {
    const r = calculateCompound({
      mode: "fv",
      principal: "",
      rate: "7",
      years: "10",
    });
    expect(r.ok).toBe(false);
  });
});
