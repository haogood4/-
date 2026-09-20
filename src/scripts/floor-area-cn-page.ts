import {
  calculateFloorArea,
  formatArea,
} from "../lib/calculators/floor-area-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const roomsInput = el<HTMLInputElement>("#rooms");

const err_rooms = el<HTMLParagraphElement>("#field-error-rooms");
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
  clearError(roomsInput || roomsInput, err_rooms);
  const r = calculateFloorArea({ rooms: roomsInput.value });
  if (!r.ok) {
    setError(
      getInputByError("field-error-principal") ||
        getInputByError("field-error-bonus") ||
        getInputByError("field-error-amount") ||
        roomsInput,
      err_rooms,
      r.error.message,
    );
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatArea(v);
  resultCaption.textContent = `房屋面积`;
  resultMain.textContent = String(f.total ?? "");
  resultDetail.textContent = `共 ${v.count} 个房间`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  roomsInput.value = "";

  clearError(roomsInput, err_rooms);
  setState("empty");
});
roomsInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
