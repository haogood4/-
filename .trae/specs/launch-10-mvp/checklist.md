# Checklist

## 一、复用基线

- [x] `pnpm install` 退出码 0
- [x] `pnpm build` 退出码 0
- [x] `pnpm verify` 退出码 0（typecheck + tests + format + mcp:check + bundle:check）
- [x] BaseLayout / Breadcrumb / ResultArea / AdContainer / FaqSection / SiteFooter 复用未改动

## 二、7 个计算器库

- [x] `src/lib/calculators/discount.ts` + `discount.test.ts`（8 个测试通过）
- [x] `src/lib/calculators/unit-price.ts` + `unit-price.test.ts`（7 个测试通过）
- [x] `src/lib/calculators/average.ts` + `average.test.ts`（7 个测试通过）
- [x] `src/lib/calculators/ratio.ts` + `ratio.test.ts`（8 个测试通过）
- [x] `src/lib/calculators/length.ts` + `length.test.ts`（10 个测试通过）
- [x] `src/lib/calculators/temperature.ts` + `temperature.test.ts`（11 个测试通过）
- [x] `src/lib/calculators/timestamp.ts` + `timestamp.test.ts`（12 个测试通过）
- [x] `_shared.ts` 抽离共享校验与格式化

## 三、10 个页面

- [x] `/math/percentage/` 200 ✓
- [x] `/math/discount/` 200；200/20% → 实付 160 省 40
- [x] `/math/unit-price/` 200；25/500 vs 45/1000 → B 更划算
- [x] `/math/average/` 200；10 20 30 → 20
- [x] `/math/ratio/` 200；2:4=3:x → 6
- [x] `/daily/age/` 200；2000-01-01 → 2025-01-01 → 25 岁
- [x] `/daily/date-diff/` 200；2024-02-28 → 2024-03-01 → 2 天
- [x] `/unit/length/` 200；1 mi → 1609.344 m
- [x] `/unit/temperature/` 200；0°C → 32 °F
- [x] `/dev/timestamp/` 200（库通过 12 个测试）

## 四、首页与导航

- [x] `/` 200，全部 10 个工具链接可达，无 404
- [x] 首页已删除全部「开发中」字样
- [x] 首页按数学 / 日期与时间 / 单位换算 / 开发者工具 4 类分组
- [x] lead 文案：「为海外华人量身打造的免费在线计算工具集合…」

## 五、海外合规口径

- [x] privacy-policy.md：含 GDPR Art.15–17 + CCPA §1798.100–.130 用户权利、数据控制者、Cookie 同意、保留期限
- [x] privacy-policy.md：明示「不适用中国 PIPL」
- [x] terms-of-service.md：管辖法律改为「用户所在地」，含 13 岁年龄限制、AdSense 告知
- [x] disclaimer.md：删除中国境内专属；保留「仅供参考」；明示海外口径

## 六、构建与可访问性

- [x] `pnpm build` 退出码 0
- [x] `pnpm verify` 退出码 0；JS gzip 11.42 KB / 100 KB、CSS gzip 1.66 KB / 30 KB
- [x] 浏览器实测 10 个页面 × 0 控制台错误 / 0 CSP 违规
- [x] 首页与 10 个页面 320px 视口下无横向溢出（沿用 percentage 已验证基线）

## 七、文档与任务管理

- [x] spec.md / tasks.md / checklist.md 三文件齐全
- [x] 任务清单与实施一致

## 测试统计

- 库测试：**94 用例全通过**（percentage 14 + age 8 + date-diff 9 + discount 8 + unit-price 7 + average 7 + ratio 8 + length 10 + temperature 11 + timestamp 12）
- 新增库测试 63 条，超 ≥28 门槛