/**
 * src/data/nav.ts — 首页六大分类工具导航唯一数据源（P2-9 起）
 * 首页分类卡片与站内搜索索引均从此读取，禁止在页面内重复维护工具清单。
 */
export interface NavTool {
  label: string;
  href: string;
}

export interface NavCategory {
  key: string;
  name: string;
  tools: NavTool[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    key: "finance",
    name: "金融理财",
    tools: [
      { label: "房贷计算器", href: "/finance/mortgage-cn/" },
      { label: "贷款计算器", href: "/finance/loan-cn/" },
      { label: "复利计算器", href: "/finance/compound-interest-cn/" },
      { label: "基金定投计算器", href: "/finance/fund-dca-cn/" },
      { label: "个税计算器", href: "/finance/income-tax-cn/" },
      { label: "五险一金计算器", href: "/finance/social-insurance-cn/" },
      { label: "汇率换算", href: "/finance/currency-exchange-cn/" },
      { label: "提前还款计算器", href: "/finance/prepayment-cn/" },
      { label: "等额本息计算器", href: "/finance/equal-installment-cn/" },
      { label: "车贷计算器", href: "/finance/auto-loan-cn/" },
      { label: "存款利息计算器", href: "/finance/deposit-interest-cn/" },
      { label: "年化收益率", href: "/finance/annualized-return-cn/" },
      { label: "IRR 计算器", href: "/finance/irr-cn/" },
      { label: "养老金计算器", href: "/finance/pension-cn/" },
      { label: "年终奖个税", href: "/finance/bonus-tax-cn/" },
      { label: "信用卡分期", href: "/finance/credit-installment-cn/" },
    ],
  },
  {
    key: "health",
    name: "健康生活",
    tools: [
      { label: "BMI 计算器", href: "/health/bmi-cn/" },
      { label: "卡路里消耗", href: "/health/calorie-burn-cn/" },
      { label: "节拍计算器", href: "/health/pace-cn/" },
      { label: "预产期计算器", href: "/health/due-date-cn/" },
      { label: "排卵期计算器", href: "/health/ovulation-cn/" },
    ],
  },
  {
    key: "renovation",
    name: "装修家居",
    tools: [
      { label: "装修预算", href: "/renovation/renovation-budget-cn/" },
      { label: "瓷砖数量", href: "/renovation/tile-quantity-cn/" },
      { label: "乳胶漆用量", href: "/renovation/paint-quantity-cn/" },
      { label: "房屋面积", href: "/renovation/floor-area-cn/" },
      { label: "油耗计算器", href: "/daily/fuel-consumption-cn/" },
    ],
  },
  {
    key: "investment",
    name: "投资专业",
    tools: [
      { label: "海龟交易法仓位", href: "/investment/turtle-position-cn/" },
      { label: "加密货币仓位", href: "/investment/crypto-position-cn/" },
      { label: "期货保证金", href: "/investment/futures-margin-cn/" },
      { label: "期权定价", href: "/investment/option-pricing-cn/" },
      { label: "跨境电商利润", href: "/investment/cross-border-profit-cn/" },
      { label: "Amazon FBA 费用", href: "/investment/amazon-fba-cn/" },
      { label: "毛利率", href: "/investment/gross-margin-cn/" },
      { label: "盈亏平衡点", href: "/investment/break-even-cn/" },
      { label: "ROAS 计算器", href: "/investment/roas-cn/" },
      { label: "转化率", href: "/investment/conversion-rate-cn/" },
    ],
  },
  {
    key: "efficiency",
    name: "效率工具",
    tools: [
      { label: "四则运算计算器", href: "/daily/basic/" },
      { label: "百分比计算器", href: "/math/percentage/" },
      { label: "折扣计算器", href: "/math/discount/" },
      { label: "长度换算", href: "/unit/length/" },
      { label: "温度换算", href: "/unit/temperature/" },
      { label: "平均数", href: "/math/average/" },
      { label: "比例计算器", href: "/math/ratio/" },
      { label: "单价比较", href: "/math/unit-price/" },
      { label: "在线科学计算器", href: "/efficiency/scientific-cn/" },
      { label: "进制转换", href: "/efficiency/base-converter-cn/" },
      { label: "时间戳转换", href: "/dev/timestamp/" },
      { label: "IP 子网计算", href: "/efficiency/ip-subnet-cn/" },
      { label: "字数统计", href: "/efficiency/word-count-cn/" },
      { label: "随机密码生成器", href: "/efficiency/password-generator-cn/" },
      { label: "HEX RGB 颜色转换", href: "/efficiency/color-converter-cn/" },
      { label: "文本处理工具", href: "/efficiency/text-transform-cn/" },
      { label: "二维码生成器", href: "/efficiency/qr-code-cn/" },
      { label: "JSON 格式化", href: "/dev/json-formatter/" },
      { label: "Base64 编码解码", href: "/dev/base64/" },
      { label: "URL 编码解码", href: "/dev/url-encode/" },
      { label: "汉字转拼音", href: "/efficiency/pinyin-cn/" },
    ],
  },
  {
    key: "daily",
    name: "日常工具",
    tools: [
      { label: "年龄计算器", href: "/daily/age/" },
      { label: "日期差计算器", href: "/daily/date-diff/" },
      { label: "手机号归属地查询", href: "/efficiency/phone-region-cn/" },
    ],
  },
];
