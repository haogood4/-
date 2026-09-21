import { describe, expect, it } from "vitest";
import { beautifyJs, minifyJs, tokenizeJs } from "./js-minify-cn";

describe("minifyJs / 注释与空白", () => {
  it("移除单行与块注释", () => {
    expect(minifyJs("let a = 1; // 注释\nlet b = 2; /* 块 */ let c = 3;")).toBe(
      "let a=1;let b=2;let c=3;",
    );
  });

  it("字符串内的 // 不是注释", () => {
    expect(minifyJs('const s = "http://x.com/a"; // real comment')).toBe(
      'const s="http://x.com/a";',
    );
  });

  it("词字符粘连处补空格防语义改变", () => {
    expect(minifyJs("let abc = 1;")).toBe("let abc=1;");
    expect(minifyJs("return a+ +b;")).toBe("return a+ +b;");
  });
});

describe("minifyJs / 字符串与模板", () => {
  it("模板字符串整体保留（含 ${} 与内部空格）", () => {
    expect(minifyJs("let t = `x ${ a + b } y`;")).toBe(
      "let t=`x ${ a + b } y`;",
    );
  });

  it("模板字符串内的 // 不当注释", () => {
    expect(minifyJs("const t = `http://a`;")).toBe("const t=`http://a`;");
  });

  it("转义引号字符串保留", () => {
    expect(minifyJs("const s = 'a\\'b';")).toBe("const s='a\\'b';");
  });
});

describe("minifyJs / 正则与除号", () => {
  it("= 后的 / 识别为正则字面量并保留", () => {
    expect(minifyJs("const re = /a\\/b/g;")).toBe("const re=/a\\/b/g;");
  });

  it("标识符后的 / 是除号不误判", () => {
    expect(minifyJs("const x = a / 2 / b;")).toBe("const x=a/2/b;");
  });

  it("return 后的正则正确保留", () => {
    expect(minifyJs("function f(){ return /x+/g.test(s); }")).toBe(
      "function f(){return/x+/g.test(s);}",
    );
  });
});

describe("beautifyJs", () => {
  it("花括号换行与缩进", () => {
    expect(beautifyJs("function f(){return 1;}")).toBe(
      "function f() {\n  return 1;\n}",
    );
  });

  it("嵌套缩进逐层递增", () => {
    const out = beautifyJs("function f(){if(a){b();}}");
    expect(out).toBe("function f() {\n  if(a) {\n    b();\n  }\n}");
  });

  it("for(;;) 头部分号不换行", () => {
    const out = beautifyJs("for(let i=0;i<2;i++){x();}");
    expect(out.split("\n")).toHaveLength(3);
    expect(out.split("\n")[0]).toContain(";");
  });

  it("字符串内容不参与布局", () => {
    const out = beautifyJs('const s = "a;b{c}";');
    expect(out).toBe('const s="a;b{c}";');
  });
});

describe("tokenizeJs", () => {
  it("输出 token 种类正确", () => {
    const toks = tokenizeJs('a = /re/; "s"');
    expect(toks.map((t) => t.kind)).toEqual([
      "code",
      "code",
      "regex",
      "code",
      "str",
    ]);
  });
});
