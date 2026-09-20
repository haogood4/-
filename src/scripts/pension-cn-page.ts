import { calculatePension, formatPension } from "../lib/calculators/pension-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const currentAgeInput = el<HTMLInputElement>("#currentAge");
const retireAgeInput = el<HTMLInputElement>("#retireAge");
const monthlySalaryInput = el<HTMLInputElement>("#monthlySalary");
const cityAvgSalaryInput = el<HTMLInputElement>("#cityAvgSalary");

const err_currentAge = el<HTMLParagraphElement>("#field-error-currentAge");
const err_retireAge = el<HTMLParagraphElement>("#field-error-retireAge");
const err_monthlySalary = el<HTMLParagraphElement>(
  "#field-error-monthlySalary",
);
const err_cityAvgSalary = el<HTMLParagraphElement>(
  "#field-error-cityAvgSalary",
);
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
function getInputByError(
  errId: string,
): HTMLInputElement | HTMLSelectElement | null {
  const m = errId.match(/field-error-(.+)/);
  if (!m) return null;
  const id = m[1];
  return document.querySelector(`#${id}`);
}
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearError(currentAgeInput, err_currentAge);
  clearError(retireAgeInput, err_retireAge);
  clearError(monthlySalaryInput, err_monthlySalary);
  clearError(cityAvgSalaryInput, err_cityAvgSalary);
  const r = calculatePension({
    currentAge: currentAgeInput.value,
    retireAge: retireAgeInput.value,
    monthlySalary: monthlySalaryInput.value,
    cityAvgSalary: cityAvgSalaryInput.value,
  });
  if (!r.ok) {
    setError(
      getInputByError("field-error-principal") ||
        getInputByError("field-error-bonus") ||
        getInputByError("field-error-amount") ||
        currentAgeInput,
      err_currentAge,
      r.error.message,
    );
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatPension(v);
  resultCaption.textContent = `养老金估算`;
  resultMain.textContent = String(f.monthlyPension ?? "");
  resultDetail.textContent = `个人账户累计 ${v.accountTotal}`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  currentAgeInput.value = "";
  retireAgeInput.value = "";
  monthlySalaryInput.value = "";
  cityAvgSalaryInput.value = "";

  clearError(currentAgeInput, err_currentAge);
  clearError(retireAgeInput, err_retireAge);
  clearError(monthlySalaryInput, err_monthlySalary);
  clearError(cityAvgSalaryInput, err_cityAvgSalary);
  setState("empty");
});
currentAgeInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
retireAgeInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
monthlySalaryInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
cityAvgSalaryInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
