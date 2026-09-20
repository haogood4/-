import {
  calculateSocialInsurance,
  formatSocialInsurance,
  type City,
} from "../lib/calculators/social-insurance-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const salaryInput = el<HTMLInputElement>("#monthlySalary");
const citySelect = el<HTMLSelectElement>("#city");
const errS = el<HTMLParagraphElement>("#field-error-monthlySalary");
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
  clearError(salaryInput, errS);
  const r = calculateSocialInsurance({
    monthlySalary: salaryInput.value,
    city: citySelect.value as City,
  });
  if (!r.ok) {
    setError(salaryInput, errS, r.error.message);
    setState("empty");
    return;
  }
  const f = formatSocialInsurance(r.value);
  resultCaption.textContent = `${r.value.cityName} · 缴费基数 ${salaryInput.value}`;
  resultMain.textContent = `个人合计 ${f.total}`;
  resultDetail.textContent = `养老 ${f.pension} · 医疗 ${f.medical} · 失业 ${f.unemployment} · 公积金 ${f.housingFund}\n公司部分约 ${f.company}`;
  lastCopy = `个人合计 ${f.total}，公司 ${f.company}`;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  salaryInput.value = "";
  citySelect.value = "beijing";
  clearError(salaryInput, errS);
  setState("empty");
});
[salaryInput].forEach((i) =>
  i.addEventListener("input", () => {
    goStaleIfComputed();
  }),
);
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
