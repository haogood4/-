// robots.txt 生成器页面交互：规则生成走 seo-robots-cn 引擎
import { generateRobots } from "../lib/calculators/seo-robots-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const policySelect = requireEl<HTMLSelectElement>("#robots-policy");
const uaInput = requireEl<HTMLTextAreaElement>("#robots-ua");
const disallowInput = requireEl<HTMLTextAreaElement>("#robots-disallow");
const crawlDelayInput = requireEl<HTMLInputElement>("#robots-crawl-delay");
const sitemapInput = requireEl<HTMLInputElement>("#robots-sitemap");
const sitemapError = requireEl<HTMLParagraphElement>("#field-error-sitemap");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

let lastText = "";

function toPolicy(value: string): "allow-all" | "disallow-all" | "custom" {
  if (value === "disallow-all" || value === "custom") return value;
  return "allow-all";
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(sitemapInput, sitemapError);
  const crawlDelayRaw = crawlDelayInput.value.trim();
  const crawlDelay = crawlDelayRaw === "" ? undefined : Number(crawlDelayRaw);
  const r = generateRobots({
    policy: toPolicy(policySelect.value),
    userAgents: uaInput.value.split(/\r?\n/),
    disallows: disallowInput.value.split(/\r?\n/),
    sitemap: sitemapInput.value,
    crawlDelay,
  });
  if (!r.ok) {
    setFieldError(sitemapInput, sitemapError, r.error);
    goStaleIfComputed();
    return;
  }
  lastText = r.text;
  resultCaption.textContent = "robots.txt 已生成";
  resultMain.textContent = r.text;
  resultProcess.textContent =
    "保存为 robots.txt 上传到网站根目录（https://你的域名/robots.txt）";
  setState("computed");
}

function handleReset(): void {
  policySelect.value = "allow-all";
  uaInput.value = "";
  disallowInput.value = "";
  crawlDelayInput.value = "";
  sitemapInput.value = "";
  clearFieldError(sitemapInput, sitemapError);
  lastText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!sitemapError.hidden && sitemapInput.value !== "") {
    clearFieldError(sitemapInput, sitemapError);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
for (const el of [uaInput, disallowInput, crawlDelayInput, sitemapInput]) {
  el.addEventListener("input", onFieldInput);
}
policySelect.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
