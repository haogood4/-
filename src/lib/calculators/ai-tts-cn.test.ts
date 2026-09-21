import { describe, expect, it } from "vitest";
import { buildVoiceConfig, TTS_TEXT_LIMIT } from "./ai-tts-cn";

describe("buildVoiceConfig", () => {
  it("默认参数生成 zh-CN 标准配置", () => {
    const r = buildVoiceConfig("你好，世界");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.plan.config).toEqual({
      text: "你好，世界",
      rate: 1,
      pitch: 1,
      lang: "zh-CN",
    });
    expect(r.plan.charCount).toBe(5);
  });

  it("自定义语速/音调/语言生效", () => {
    const r = buildVoiceConfig(" Hello ", {
      rate: 1.5,
      pitch: 0.5,
      lang: "en-US",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.plan.config.text).toBe("Hello");
    expect(r.plan.config.rate).toBe(1.5);
    expect(r.plan.config.pitch).toBe(0.5);
    expect(r.plan.config.lang).toBe("en-US");
  });

  it("文本先去首尾空白再计数", () => {
    const r = buildVoiceConfig("  你好  ");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.plan.config.text).toBe("你好");
    expect(r.plan.charCount).toBe(2);
  });

  it("空文本与纯空白文本报错", () => {
    expect(buildVoiceConfig("").ok).toBe(false);
    const r = buildVoiceConfig("   \n\t ");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toContain("请输入");
  });

  it("超出 3000 字上限报错", () => {
    const r = buildVoiceConfig("好".repeat(TTS_TEXT_LIMIT + 1));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toContain("3000");
  });

  it("恰好 3000 字可以通过", () => {
    const r = buildVoiceConfig("好".repeat(TTS_TEXT_LIMIT));
    expect(r.ok).toBe(true);
  });

  it("语速越界 / 非有限数报错", () => {
    expect(buildVoiceConfig("hi", { rate: 0 }).ok).toBe(false);
    expect(buildVoiceConfig("hi", { rate: 10.1 }).ok).toBe(false);
    expect(buildVoiceConfig("hi", { rate: Number.NaN }).ok).toBe(false);
    expect(buildVoiceConfig("hi", { rate: 0.1 }).ok).toBe(true);
    expect(buildVoiceConfig("hi", { rate: 10 }).ok).toBe(true);
  });

  it("音调越界报错", () => {
    expect(buildVoiceConfig("hi", { pitch: -0.1 }).ok).toBe(false);
    expect(buildVoiceConfig("hi", { pitch: 2.1 }).ok).toBe(false);
    expect(buildVoiceConfig("hi", { pitch: 0 }).ok).toBe(true);
    expect(buildVoiceConfig("hi", { pitch: 2 }).ok).toBe(true);
  });

  it("语言代码格式非法报错", () => {
    expect(buildVoiceConfig("hi", { lang: "zh_CN" }).ok).toBe(false);
    expect(buildVoiceConfig("hi", { lang: "english" }).ok).toBe(false);
    expect(buildVoiceConfig("hi", { lang: "" }).ok).toBe(false);
    expect(buildVoiceConfig("hi", { lang: "ja-JP" }).ok).toBe(true);
  });

  it("预计时长按每秒 4 字 × 语速向上取整", () => {
    const normal = buildVoiceConfig("好".repeat(40));
    expect(normal.ok).toBe(true);
    if (normal.ok) expect(normal.plan.estSeconds).toBe(10);

    const fast = buildVoiceConfig("好".repeat(40), { rate: 2 });
    expect(fast.ok).toBe(true);
    if (fast.ok) expect(fast.plan.estSeconds).toBe(5);

    const tiny = buildVoiceConfig("好");
    expect(tiny.ok).toBe(true);
    if (tiny.ok) expect(tiny.plan.estSeconds).toBe(1);
  });
});
