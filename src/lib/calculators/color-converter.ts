// HEX 与 RGB 颜色互转引擎

export type HexInput = { hex: string };
export type RgbInput = { r: number; g: number; b: number };

export type ColorResult =
  | { ok: true; value: { hex: string; r: number; g: number; b: number } }
  | { ok: false; error: { code: string; message: string } };

const HEX6 = /^[0-9a-fA-F]{6}$/;
const HEX3 = /^[0-9a-fA-F]{3}$/;

function normalizeHex(hex: string): string {
  let h = hex.trim().replace(/^#/, "");
  if (HEX3.test(h)) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  return h.toLowerCase();
}

export function hexToRgb(input: HexInput): ColorResult {
  const raw = input.hex.trim();
  if (!raw) {
    return {
      ok: false,
      error: { code: "EMPTY", message: "请输入 HEX 值（如 #2563eb）" },
    };
  }
  const stripped = raw.replace(/^#/, "");
  if (!HEX6.test(stripped) && !HEX3.test(stripped)) {
    return {
      ok: false,
      error: {
        code: "INVALID_HEX",
        message: "HEX 必须是 3 或 6 位十六进制字符",
      },
    };
  }
  const h = normalizeHex(stripped);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { ok: true, value: { hex: "#" + h, r, g, b } };
}

export function rgbToHex(input: RgbInput): ColorResult {
  const { r, g, b } = input;
  for (const [name, val] of [
    ["R", r],
    ["G", g],
    ["B", b],
  ] as const) {
    if (!Number.isInteger(val) || val < 0 || val > 255) {
      return {
        ok: false,
        error: {
          code: "INVALID_RGB",
          message: `${name} 值需在 0~255 整数之间`,
        },
      };
    }
  }
  const hex =
    "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
  return { ok: true, value: { hex, r, g, b } };
}
