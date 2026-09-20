# Checklist — 内容方向评估交付验收

## 文档完整性
- [x] `knowledge-base/04-seo-content/content-direction-eval.md` 存在
- [x] 含 5 维度加权评分定义 + 0-5 分档 + 决策树
- [x] 头部明示数据来源 + 缺失项诚实声明
- [x] `docs/content-direction-strategy.md` 存在，行数 ≥250
- [x] 含 5 个候选方向（A 知识库 / B 场景 Hub / C UGC 问答 / D 资讯博客 / E 嵌入式 SDK）完整章节
- [x] 评分矩阵实际填分（非 TBD）
- [x] 含 P0/P1/deferred/rejected 决策段
- [x] 含 M1-M2 / M3-M6 / M7-M12 三阶段实施计划（仅 P0/P1 展开）
- [x] 含监测机制段（核心指标 + 90 天校正窗口）

## 内容质量
- [x] 每个方向有「合规风险分级（低/中/高）」+ 应对措施
- [x] 每个方向有「资源需求」含 PM/编辑/前端/法务/DevOps 工时估算
- [x] 每个方向有「短期 KPI（3 个月内可观测）」与「长期 KPI（12 个月）」
- [x] 诚实声明：所有 KPI 为同类站点代理估算，标注非基于本站真实历史

## 与既有体系一致
- [x] 与 6 分类关键词库（v2）一致
- [x] 引用既有 PIPL 合规、广告法标识、医疗免责声明约束
- [x] 不与现有 6 工具页 + SEO 元数据冲突

## 交叉引用
- [x] `content-calendar.md` 文末追加 6 个月排期段
- [x] `content-direction-strategy.md` 在 2+ 处被引用（README + acceptance-plan）

## 治理与可执行
- [x] 文档明示「P0 方向需另起 change-id 进入实施，本 spec 仅做评估」
- [x] 决策表含理由列
- [x] 已知限制段含缺失 GA / 缺失调研 / 依赖人工判断

## 验收命令
- [x] `wc -l docs/content-direction-strategy.md` ≥ 250
- [x] `grep -c "方向 [A-E]\|## 方向" docs/content-direction-strategy.md` ≥ 5
- [x] `grep -c "P0\|P1\|P2\|deferred\|rejected" docs/content-direction-strategy.md` ≥ 6
