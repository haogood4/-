// P2-11：经 getViteConfig 挂载 astro vite 插件，使 .astro 组件可被 vitest 编译导入
import { getViteConfig } from "astro/config";

export default getViteConfig(
  {},
  {
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  },
);
