# 计算器大全 — 全部工具清单（83 个）

按 6 大分类整理，每行复制即用（站点路径相对于部署根域名）。

## 金融理财（17）
- 房贷计算器 — /finance/mortgage-cn/
- 贷款计算器 — /finance/loan-cn/
- 复利计算器 — /finance/compound-interest-cn/
- 基金定投计算器 — /finance/fund-dca-cn/
- 个税计算器 — /finance/income-tax-cn/
- 五险一金计算器 — /finance/social-insurance-cn/
- 汇率换算 — /finance/currency-exchange-cn/
- 提前还款计算器 — /finance/prepayment-cn/
- 等额本息计算器 — /finance/equal-installment-cn/
- 车贷计算器 — /finance/auto-loan-cn/
- 存款利息计算器 — /finance/deposit-interest-cn/
- 年化收益率 — /finance/annualized-return-cn/
- IRR 计算器 — /finance/irr-cn/
- 养老金计算器 — /finance/pension-cn/
- 年终奖个税 — /finance/bonus-tax-cn/
- 信用卡分期 — /finance/credit-installment-cn/
- 人民币大写转换 — /finance/rmb-uppercase-cn/

## 健康生活（5）
- BMI 计算器 — /health/bmi-cn/
- 卡路里消耗 — /health/calorie-burn-cn/
- 节拍计算器 — /health/pace-cn/
- 预产期计算器 — /health/due-date-cn/
- 排卵期计算器 — /health/ovulation-cn/

## 装修家居（5）
- 装修预算 — /renovation/renovation-budget-cn/
- 瓷砖数量 — /renovation/tile-quantity-cn/
- 乳胶漆用量 — /renovation/paint-quantity-cn/
- 房屋面积 — /renovation/floor-area-cn/
- 油耗计算器 — /daily/fuel-consumption-cn/

## 投资专业（10）
- 海龟交易法仓位 — /investment/turtle-position-cn/
- 加密货币仓位 — /investment/crypto-position-cn/
- 期货保证金 — /investment/futures-margin-cn/
- 期权定价 — /investment/option-pricing-cn/
- 跨境电商利润 — /investment/cross-border-profit-cn/
- Amazon FBA 费用 — /investment/amazon-fba-cn/
- 毛利率 — /investment/gross-margin-cn/
- 盈亏平衡点 — /investment/break-even-cn/
- ROAS 计算器 — /investment/roas-cn/
- 转化率 — /investment/conversion-rate-cn/

## 效率工具（42）
- 四则运算计算器 — /daily/basic/
- 百分比计算器 — /math/percentage/
- 折扣计算器 — /math/discount/
- 长度换算 — /unit/length/
- 温度换算 — /unit/temperature/
- 平均数 — /math/average/
- 比例计算器 — /math/ratio/
- 单价比较 — /math/unit-price/
- 在线科学计算器 — /efficiency/scientific-cn/
- 进制转换 — /efficiency/base-converter-cn/
- 时间戳转换 — /dev/timestamp/
- IP 子网计算 — /efficiency/ip-subnet-cn/
- 字数统计 — /efficiency/word-count-cn/
- 随机密码生成器 — /efficiency/password-generator-cn/
- HEX RGB 颜色转换 — /efficiency/color-converter-cn/
- 文本处理工具 — /efficiency/text-transform-cn/
- 二维码生成器 — /efficiency/qr-code-cn/
- JSON 格式化 — /dev/json-formatter/
- Base64 编码解码 — /dev/base64/
- URL 编码解码 — /dev/url-encode/
- 汉字转拼音 — /efficiency/pinyin-cn/
- 代码对比 — /dev/code-diff/
- 正则表达式测试 — /dev/regex-tester/
- 敏感词检测 — /efficiency/sensitive-word-cn/
- 关键词密度分析 — /efficiency/keyword-density-cn/
- 标题字数检测 — /efficiency/title-length-cn/
- 图片压缩工具 — /efficiency/image-compress-cn/
- 繁体简体转换 — /efficiency/chinese-convert-cn/
- 图片格式转换 — /efficiency/image-convert-cn/
- 重量换算 — /unit/weight/
- 面积换算 — /unit/area/
- 体积换算 — /unit/volume/
- 速度换算 — /unit/speed/
- 时间换算 — /unit/time/
- 存储容量换算 — /unit/data-storage/
- CSV 转 JSON — /dev/csv-to-json/
- 文本行去重 — /efficiency/line-dedup-cn/
- UUID 生成器 — /dev/uuid/
- 字符编码查询 — /dev/ascii-table/
- Markdown 表格生成 — /efficiency/md-table-cn/
- 文本相似度 — /efficiency/text-similarity-cn/
- 日期格式转换 — /dev/date-format/

## 日常工具（4）
- 年龄计算器 — /daily/age/
- 日期差计算器 — /daily/date-diff/
- 手机号归属地查询 — /efficiency/phone-region-cn/
- 服装尺码对照表 — /daily/clothing-size-cn/

## 信息页（4）
- 知识库 — /articles/
- 文章列表 — /articles-list/
- 场景指南索引 — /hub/
- 站内搜索 — /search/
- 隐私政策 — /legal/privacy/
- 用户协议 — /legal/terms/
- 免责声明 — /legal/disclaimer/

合计 83 个计算工具 + 7 个信息页。

## 打包复制格式（如需 JSON）

```json
{
  "total": 83,
  "categories": [
    {"key": "finance", "name": "金融理财", "count": 17, "tools": [{"label": "房贷计算器", "href": "/finance/mortgage-cn/"}, ...]},
    {"key": "health", "name": "健康生活", "count": 5, "tools": [...]},
    {"key": "renovation", "name": "装修家居", "count": 5, "tools": [...]},
    {"key": "investment", "name": "投资专业", "count": 10, "tools": [...]},
    {"key": "efficiency", "name": "效率工具", "count": 42, "tools": [...]},
    {"key": "daily", "name": "日常工具", "count": 4, "tools": [...]}
  ]
}
```

源数据：`src/data/nav.ts`（构建期唯一真源，首页分类卡片 + 搜索索引 + 站点地图共用）
