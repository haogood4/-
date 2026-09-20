// eslint.config.js — ESLint flat config（P1-5：typescript-eslint + astro 插件，规则从严）
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", ".astro/**", "public/**", "coverage/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],

  // 全站默认：浏览器环境（src/scripts 页面脚本、.astro 模板）
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      // P1-6 已清零存量 as any（2026-09-20），按文档 3.3 升级为 error 防回归
      "@typescript-eslint/no-explicit-any": "error",
      // 未使用变量：允许 _ 前缀占位
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      // 禁止与项目铁律冲突的写法
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-script-url": "error",
      eqeqeq: ["error", "smart"],
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // .astro 文件：astro parser 已由 flat/recommended 内置，此处让 frontmatter/表达式走 TS 解析器
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".astro"],
      },
    },
  },

  // 测试文件：安全清洗测试的 payload 字符串（javascript: 等）属测试数据本身，非真实脚本 URL
  {
    files: ["**/*.test.ts"],
    rules: {
      "no-script-url": "off",
    },
  },

  // Node 脚本：构建期工具链
  {
    files: ["scripts/**/*.mjs", "astro.config.mjs"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
