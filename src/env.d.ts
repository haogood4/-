/// <reference types="astro/client" />

// 使 .ts 测试文件可 import .astro 组件通过 tsc（P2-11）；
// 真实类型由 astro 语言服务提供，此处为 tsc 兜底声明
declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  const component: AstroComponentFactory;
  export default component;
}
