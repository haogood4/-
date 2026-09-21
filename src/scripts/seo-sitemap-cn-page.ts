// Sitemap 生成器页面交互：解析与 XML 生成走 seo-sitemap-cn 引擎
import {
  generateSitemap,
  parseSitemapInput,
} from "../lib/calculators/seo-sitemap-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const urlsInput = requireEl<HTMLTextAreaElement>("#sitemap-urls");
const urlsError = requireEl<HTMLParagraphElement>("#field-error-urls");
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

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(urlsInput, urlsError);
  const parsed = parseSitemapInput(urlsInput.value);
  if (!parsed.ok) {
    setFieldError(urlsInput, urlsError, parsed.error);
    urlsInput.focus();
    goStaleIfComputed();
    return;
  }
  const xml = generateSitemap(parsed.entries);
  if (!xml.ok) {
    setFieldError(urlsInput, urlsError, xml.error);
    goStaleIfComputed();
    return;
  }
  lastText = xml.xml;
  resultCaption.textContent = `sitemap.xml 已生成（${parsed.entries.length} 条 URL）`;
  resultMain.textContent = xml.xml;
  resultProcess.textContent =
    "保存为 sitemap.xml 上传到网站根目录，并在 robots.txt 中声明 Sitemap 地址";
  setState("computed");
}

function handleReset(): void {
  urlsInput.value = "";
  clearFieldError(urlsInput, urlsError);
  lastText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!urlsError.hidden && urlsInput.value !== "") {
    clearFieldError(urlsInput, urlsError);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
urlsInput.addEventListener("input", onFieldInput);

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
