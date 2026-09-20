// HEX↔RGB 颜色转换页面交互
import { hexToRgb, rgbToHex } from "../lib/calculators/color-converter";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const hexInput = requireEl<HTMLInputElement>("#hex-input");
const rgbInput = requireEl<HTMLInputElement>("#rgb-input");
const err_hex = requireEl<HTMLParagraphElement>("#field-error-hex");
const err_rgb = requireEl<HTMLParagraphElement>("#field-error-rgb");
const colorBlock = requireEl<HTMLSpanElement>("#color-block");
const colorText = requireEl<HTMLSpanElement>("#color-text");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

function showPreview(hex: string, rgb: string) {
  colorBlock.style.background = hex;
  colorText.textContent = `HEX: ${hex} ｜ RGB: ${rgb}`;
  resultDetail.textContent = `HEX ${hex} ≡ rgb(${rgb})`;
}

function clearPreview() {
  colorBlock.style.background = "transparent";
  colorText.textContent = "—";
}

function commit(hex: string, r: number, g: number, b: number) {
  showPreview(hex, `${r}, ${g}, ${b}`);
  lastCopy = hex;
  setState("computed");
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(hexInput, err_hex);
  clearFieldError(rgbInput, err_rgb);
  const hexRaw = hexInput.value;
  if (hexRaw.trim()) {
    const r = hexToRgb({ hex: hexRaw });
    if (!r.ok) {
      setFieldError(hexInput, err_hex, r.error.message);
      clearPreview();
      setState("empty");
      return;
    }
    rgbInput.value = `${r.value.r}, ${r.value.g}, ${r.value.b}`;
    commit(r.value.hex, r.value.r, r.value.g, r.value.b);
    return;
  }
  const rgbRaw = rgbInput.value.trim();
  if (rgbRaw) {
    const parts = rgbRaw.split(/[,\s]+/).map((s) => parseInt(s, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
      setFieldError(rgbInput, err_rgb, "RGB 必须是 3 个 0~255 整数（逗号或空格分隔）");
      clearPreview();
      setState("empty");
      return;
    }
    const r = rgbToHex({ r: parts[0], g: parts[1], b: parts[2] });
    if (!r.ok) {
      setFieldError(rgbInput, err_rgb, r.error.message);
      clearPreview();
      setState("empty");
      return;
    }
    hexInput.value = r.value.hex;
    commit(r.value.hex, r.value.r, r.value.g, r.value.b);
    return;
  }
  setFieldError(hexInput, err_hex, "请输入 HEX 或 RGB 中的至少一项");
  setState("empty");
});

resetBtn.addEventListener("click", () => {
  hexInput.value = "";
  rgbInput.value = "";
  clearFieldError(hexInput, err_hex);
  clearFieldError(rgbInput, err_rgb);
  clearPreview();
  setState("empty");
});

[hexInput, rgbInput].forEach((el) => el.addEventListener("input", goStaleIfComputed));
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");