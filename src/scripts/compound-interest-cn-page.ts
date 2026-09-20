import {
  calculateCompound,
  formatCompound,
} from "../lib/calculators/compound-interest-cn";
import {
  bindCopyButton,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const modeSelect = el<HTMLSelectElement>("#mode");
const principalInput = el<HTMLInputElement>("#principal");
const fvInput = el<HTMLInputElement>("#fv");
const rateInput = el<HTMLInputElement>("#rate");
const yearsInput = el<HTMLInputElement>("#years");
const errP = el<HTMLParagraphElement>("#field-error-principal");
const errF = el<HTMLParagraphElement>("#field-error-fv");
const errR = el<HTMLParagraphElement>("#field-error-rate");
const errY = el<HTMLParagraphElement>("#field-error-years");
const resultCaption = el<HTMLParagraphElement>("#result-caption");
const resultMain = el<HTMLParagraphElement>("#result-main");
const resultDetail = el<HTMLParagraphElement>("#result-detail");
const copyBtn = el<HTMLButtonElement>("#copy-btn");
const resetBtn = el<HTMLButtonElement>("#reset-btn");
const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: el("#result-empty"),
  resultContent: el("#result-content"),
  staleHint: el("#result-stale-hint"),
  buttons: [copyBtn],
});
let lastCopy = "";
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  [errP, errF, errR, errY].forEach((e) => {
    e.textContent = "";
    e.hidden = true;
  });
  [principalInput, fvInput, rateInput, yearsInput].forEach((i) =>
    i.removeAttribute("aria-invalid"),
  );
  const mode = modeSelect.value as "fv" | "pv" | "rate";
  const r = calculateCompound({
    mode,
    principal: principalInput.value,
    fv: fvInput.value,
    rate: rateInput.value,
    years: yearsInput.value,
  });
  if (!r.ok) {
    const m = r.error.message;
    if (m.includes("本")) setError(principalInput, errP, m);
    else if (m.includes("终")) setError(fvInput, errF, m);
    else if (m.includes("年利率") || m.includes("0-100"))
      setError(rateInput, errR, m);
    else setError(yearsInput, errY, m);
    setState("empty");
    return;
  }
  const labels = { fv: "复利终值", pv: "复利现值", rate: "反推年化" } as const;
  resultCaption.textContent = labels[mode];
  const unit = mode === "rate" ? "%" : "¥";
  resultMain.textContent = `${unit}${formatCompound(r.value)}`;
  resultDetail.textContent = r.process;
  lastCopy = `${labels[mode]}: ${unit}${formatCompound(r.value)}`;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  principalInput.value = "";
  fvInput.value = "";
  rateInput.value = "";
  yearsInput.value = "";
  setState("empty");
});
[principalInput, fvInput, rateInput, yearsInput].forEach((i) =>
  i.addEventListener("input", () => {
    goStaleIfComputed();
  }),
);
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
