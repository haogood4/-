// User-Agent 解析引擎 —— 内置正则表（Edge/Opera 需在 Chrome 之前判定，
// 因为二者 UA 均含 Chrome/ 标记）。纯函数、无 DOM 依赖。
export type DeviceKind = "手机" | "平板" | "桌面" | "未知";

export interface UAResult {
  browser: string;
  browserVersion: string;
  os: string;
  device: DeviceKind;
}

export function parseUA(ua: string): UAResult {
  const browser = parseBrowser(ua);
  return {
    browser: browser.name,
    browserVersion: browser.version,
    os: parseOS(ua),
    device: parseDevice(ua),
  };
}

function parseBrowser(ua: string): { name: string; version: string } {
  // 顺序敏感：Edge / Opera / Samsung 的 UA 同时包含 Chrome/，必须先判
  const rules: readonly (readonly [string, RegExp])[] = [
    ["Microsoft Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
    ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
    ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
    ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
    ["Internet Explorer", /(?:MSIE ([\d.]+)|Trident\/.*rv:([\d.]+))/],
    ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
    ["Safari", /Version\/([\d.]+).*Safari/],
    ["QQ 浏览器", /QQBrowser\/([\d.]+)/],
    ["UC 浏览器", /UCBrowser\/([\d.]+)/],
  ];
  for (const [name, re] of rules) {
    const m = ua.match(re);
    if (m) {
      const version = (m[1] ?? m[2] ?? "").trim();
      return { name, version };
    }
  }
  return { name: "未知浏览器", version: "" };
}

function parseOS(ua: string): string {
  if (/Windows NT ([\d.]+)/.test(ua)) {
    const nt = ua.match(/Windows NT ([\d.]+)/)?.[1] ?? "";
    if (nt === "10.0") return "Windows 10/11";
    if (nt === "6.1") return "Windows 7";
    if (nt === "6.3") return "Windows 8.1";
    if (nt === "6.2") return "Windows 8";
    return "Windows";
  }
  if (/Android ([\d.]+)/.test(ua))
    return `Android ${ua.match(/Android ([\d.]+)/)?.[1] ?? ""}`.trim();
  if (/iPhone|iPad|iPod/.test(ua)) {
    const v = ua.match(/OS (\d+[_\d]*)/)?.[1]?.replace(/_/g, ".") ?? "";
    return v === "" ? "iOS" : `iOS ${v}`;
  }
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Mac OS X ([\d_.]+)/.test(ua)) {
    const v = ua.match(/Mac OS X ([\d_.]+)/)?.[1]?.replace(/_/g, ".") ?? "";
    return v === "" ? "macOS" : `macOS ${v}`;
  }
  if (/Macintosh|Mac OS/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "未知系统";
}

function parseDevice(ua: string): DeviceKind {
  if (/iPhone|iPod/.test(ua)) return "手机";
  if (/iPad/.test(ua)) return "平板";
  if (/Android/.test(ua)) {
    return /Mobile/.test(ua) ? "手机" : "平板";
  }
  if (/Windows|Macintosh|Linux|CrOS/.test(ua)) return "桌面";
  if (/Mobile/.test(ua)) return "手机";
  return "未知";
}
