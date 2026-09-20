// IP 子网计算器页面交互（样板见 _page-kit.ts）
import { calculateSubnet, formatSubnet } from "../lib/calculators/ip-subnet-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const ipInput = requireEl<HTMLInputElement>("#ip");
const cidrInput = requireEl<HTMLInputElement>("#cidr");
const err_ip = requireEl<HTMLParagraphElement>("#field-error-ip");
const err_cidr = requireEl<HTMLParagraphElement>("#field-error-cidr");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
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

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(ipInput, err_ip);
  clearFieldError(cidrInput, err_cidr);
  const r = calculateSubnet({ ip: ipInput.value, cidr: cidrInput.value });
  if (!r.ok) {
    setFieldError(ipInput, err_ip, r.error.message);
    setState("empty");
    return;
  }
  const f = formatSubnet(r.value);
  resultCaption.textContent = "IP 子网计算器";
  resultMain.textContent = String(f.network ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent ?? "";
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  ipInput.value = "";
  cidrInput.value = "";
  clearFieldError(ipInput, err_ip);
  clearFieldError(cidrInput, err_cidr);
  setState("empty");
});
ipInput.addEventListener("input", goStaleIfComputed);
cidrInput.addEventListener("input", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
