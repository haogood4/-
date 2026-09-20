// 一次性 codemod：SEO 文案去同质化（32 页 title/desc 差异化）+ 相关工具内链补足 ≥3（33 页）
// 用法：node scripts/fix-seo-links.mjs [--dry]
import { readFileSync, writeFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");

/** page -> { t: 新 title, d: 新 description, links: [href, label][]（最终完整清单，≥3） } */
const MAP = {
  "daily/age": {
    t: "年龄计算器 — 在线测算周岁、虚岁与距下次生日天数",
    d: "免费在线年龄计算器：输入出生日期与目标日期，精确计算周岁、虚岁、已存活天数与距下次生日倒计时，支持闰年与月末边界，适合证件填报、保险投保与生日提醒。",
    links: [
      ["/daily/date-diff/", "日期天数计算器"],
      ["/daily/basic/", "四则运算计算器"],
      ["/dev/timestamp/", "Unix 时间戳转换"],
    ],
  },
  "daily/date-diff": {
    t: "日期计算器 — 在线计算两个日期相差天数与间隔",
    d: "免费在线日期天数计算器：计算任意两个日期之间相差的天数、周数与月数，支持倒计时、纪念日与工作日统计场景，自动处理闰年与月末日期。",
    links: [
      ["/daily/age/", "年龄计算器"],
      ["/dev/timestamp/", "Unix 时间戳转换"],
      ["/daily/basic/", "四则运算计算器"],
    ],
  },
  "daily/fuel-consumption-cn": {
    t: "油耗计算器 — 在线计算百公里油耗与每公里油费",
    d: "免费在线油耗计算器：输入加油升数与行驶里程，一键计算百公里油耗、每公里油费与每升可跑公里数，帮助跟踪实际油耗、对比工信部数据并优化驾驶习惯。",
    links: [
      ["/daily/basic/", "四则运算计算器"],
      ["/math/percentage/", "百分比计算器"],
      ["/math/average/", "平均值计算器"],
    ],
  },
  "dev/timestamp": {
    t: "时间戳转换器 — 在线 Unix 时间戳与日期互转",
    d: "免费在线 Unix 时间戳转换工具：秒/毫秒时间戳与年月日时分秒双向转换，支持本地时区与 UTC 对照、当前时间戳实时显示，适合开发调试与日志排查。",
    links: [
      ["/daily/date-diff/", "日期天数计算器"],
      ["/daily/age/", "年龄计算器"],
      ["/efficiency/base-converter-cn/", "进制转换计算器"],
    ],
  },
  "efficiency/base-converter-cn": {
    t: "进制转换计算器 — 在线二进制八进制十进制十六进制互转",
    d: "免费在线进制转换工具：支持二进制、八进制、十进制、十六进制任意互转，结果同时展示四种进制形式，适合编程学习、颜色代码换算与内存地址计算。",
    links: [
      ["/efficiency/ip-subnet-cn/", "IP 子网计算器"],
      ["/efficiency/scientific-cn/", "科学计算器"],
      ["/dev/timestamp/", "Unix 时间戳转换"],
    ],
  },
  "efficiency/ip-subnet-cn": {
    t: "IP 子网计算器 — 在线子网掩码 CIDR 可用主机数查询",
    d: "免费在线 IP 子网划分计算器：输入 IP 地址与 CIDR 前缀长度，即时得出网络地址、广播地址、子网掩码、可用主机数与地址范围，网络工程师与计算机网络学习必备。",
    links: [
      ["/efficiency/base-converter-cn/", "进制转换计算器"],
      ["/efficiency/scientific-cn/", "科学计算器"],
      ["/dev/timestamp/", "Unix 时间戳转换"],
    ],
  },
  "efficiency/scientific-cn": {
    t: "科学计算器 — 在线三角函数对数幂运算计算",
    d: "免费在线科学计算器：支持三角函数（弧度制）、常用对数、自然对数、指数、平方根、绝对值与 π/e 常量，表达式按标准运算优先级求值，学生与工程人员随身工具。",
    links: [
      ["/daily/basic/", "四则运算计算器"],
      ["/efficiency/base-converter-cn/", "进制转换计算器"],
      ["/math/average/", "平均值计算器"],
    ],
  },
  "efficiency/word-count-cn": {
    t: "字数统计工具 — 在线统计中文字数英文单词与行数",
    d: "免费在线字数统计：粘贴文本即时统计总字符数（含/不含空格）、中文字数、英文单词数、段落数与行数，适合作文限字、文案字数核对与字幕排版检查。",
    links: [
      ["/daily/basic/", "四则运算计算器"],
      ["/efficiency/scientific-cn/", "科学计算器"],
      ["/dev/timestamp/", "Unix 时间戳转换"],
    ],
  },
  "finance/annualized-return-cn": {
    t: "年化收益率计算器 — 在线持有收益换算年化",
    d: "免费在线年化收益率计算器：输入持有期总收益率与持有天数，一键换算年化收益率，帮助对比银行理财、基金、定期存款等不同期限产品的真实收益水平。",
    links: [
      ["/finance/compound-interest-cn/", "复利计算器"],
      ["/finance/irr-cn/", "IRR 计算器"],
      ["/finance/fund-dca-cn/", "基金定投计算器"],
    ],
  },
  "finance/auto-loan-cn": {
    t: "车贷计算器 — 在线汽车贷款月供与总利息试算",
    d: "免费在线车贷计算器：输入贷款本金、贷款年限与年利率，即时计算月供、总利息与还款总额，支持首付比例方案对比与尾款贷（气球贷）试算，购车贷款心中有数。",
    links: [
      ["/finance/loan-cn/", "贷款计算器"],
      ["/finance/equal-installment-cn/", "等额本息计算器"],
      ["/finance/irr-cn/", "IRR 计算器"],
    ],
  },
  "finance/bonus-tax-cn": {
    t: "年终奖个税计算器 — 在线单独计税到手与临界点查询",
    d: "免费在线年终奖个税计算器：按全年一次性奖金单独计税方法自动计算税额与到手金额，支持单独计税与并入综合所得两种方案对比，提示年终奖跳档临界区间。",
    links: [
      ["/finance/income-tax-cn/", "个税计算器"],
      ["/finance/social-insurance-cn/", "五险一金计算器"],
      ["/finance/deposit-interest-cn/", "存款利息计算器"],
    ],
  },
  "finance/compound-interest-cn": {
    t: "复利计算器 — 在线复利本利增长与终值试算",
    d: "免费在线复利计算器：设置本金、年利率、复利频次与年限，即时查看本利增长明细与终值，直观感受复利效应，支持按年/月/季/日计息对比，储蓄规划基础工具。",
    links: [
      ["/finance/deposit-interest-cn/", "存款利息计算器"],
      ["/finance/annualized-return-cn/", "年化收益率计算器"],
      ["/finance/fund-dca-cn/", "基金定投计算器"],
    ],
  },
  "finance/credit-installment-cn": {
    t: "信用卡分期计算器 — 在线分期月供与实际年化利率换算",
    d: "免费在线信用卡分期计算器：输入分期本金、月手续费率与期数，即时得出月供与总手续费，并按 IRR 口径折算实际年化利率，帮你看清低月费背后的真实资金成本。",
    links: [
      ["/finance/loan-cn/", "贷款计算器"],
      ["/finance/auto-loan-cn/", "车贷计算器"],
      ["/finance/irr-cn/", "IRR 计算器"],
    ],
  },
  "finance/currency-exchange-cn": {
    t: "汇率换算计算器 — 人民币美元欧元等 8 种货币双向换算",
    d: "免费在线汇率换算工具：支持人民币、美元、港币、欧元、日元、英镑、澳元、韩元 8 种货币双向换算，自定义输入参考汇率，适合跨境购物、旅行预算与外贸报价。",
    links: [
      ["/investment/cross-border-profit-cn/", "跨境电商利润计算器"],
      ["/investment/amazon-fba-cn/", "Amazon FBA 费用计算器"],
      ["/finance/compound-interest-cn/", "复利计算器"],
    ],
  },
  "finance/income-tax-cn": {
    t: "个税计算器 — 2026 个人所得税工资薪金在线试算",
    d: "免费在线个人所得税计算器：按累计预扣法计算工资薪金个税、税后到手与适用税率，支持专项附加扣除输入，同步五险一金个人缴纳部分，发薪测算一步到位。",
    links: [
      ["/finance/bonus-tax-cn/", "年终奖个税计算器"],
      ["/finance/social-insurance-cn/", "五险一金计算器"],
      ["/finance/pension-cn/", "养老金计算器"],
    ],
  },
  "finance/irr-cn": {
    t: "IRR 计算器 — 在线内部收益率现金流试算",
    d: "免费在线 IRR（内部收益率）计算器：输入多期现金流序列，Newton-Raphson 数值法求解 IRR，适用于增额终身寿与年金险收益评估、项目投资决策与基金实际回报测算。",
    links: [
      ["/finance/annualized-return-cn/", "年化收益率计算器"],
      ["/finance/fund-dca-cn/", "基金定投计算器"],
      ["/finance/compound-interest-cn/", "复利计算器"],
    ],
  },
  "finance/pension-cn": {
    t: "养老金计算器 — 在线退休工资估算与缴费规划",
    d: "免费在线养老金计算器：输入当前年龄、退休年龄、月薪与当地社平工资，按基础养老金加个人账户公式估算退休后月领金额，辅助规划社保缴费基数与年限。",
    links: [
      ["/finance/income-tax-cn/", "个税计算器"],
      ["/finance/social-insurance-cn/", "五险一金计算器"],
      ["/finance/compound-interest-cn/", "复利计算器"],
    ],
  },
  "finance/social-insurance-cn": {
    t: "五险一金计算器 — 在线社保公积金个人公司缴纳明细",
    d: "免费在线五险一金计算器：按缴费基数计算养老、医疗、失业、工伤、生育保险与住房公积金的个人及单位缴纳金额，得出税后实发工资，参保调基一目了然。",
    links: [
      ["/finance/income-tax-cn/", "个税计算器"],
      ["/finance/pension-cn/", "养老金计算器"],
      ["/finance/bonus-tax-cn/", "年终奖个税计算器"],
    ],
  },
  "health/calorie-burn-cn": {
    t: "卡路里消耗计算器 — 在线 MET 运动热量消耗估算",
    d: "免费在线运动卡路里消耗计算器：按体重、运动时长与 MET 强度值估算跑步、游泳、骑行等运动的热量消耗，辅助减脂饮食计划制定与运动强度管理。",
    links: [
      ["/health/bmi-cn/", "BMI 计算器"],
      ["/health/pace-cn/", "跑步配速计算器"],
      ["/daily/basic/", "四则运算计算器"],
    ],
  },
  "health/due-date-cn": {
    t: "预产期计算器 — 在线末次月经推算预产期与孕周",
    d: "免费在线预产期计算器：按末次月经首日以奈格尔法则推算预产期、当前孕周与关键产检时间点，帮助准妈妈规划孕期检查，结果仅供参考请以 B 超核对为准。",
    links: [
      ["/health/ovulation-cn/", "排卵期计算器"],
      ["/daily/date-diff/", "日期天数计算器"],
      ["/daily/age/", "年龄计算器"],
    ],
  },
  "health/ovulation-cn": {
    t: "排卵期计算器 — 在线排卵日与易孕期窗口推算",
    d: "免费在线排卵期计算器：根据末次月经首日与月经周期长度推算下次排卵日与易孕期窗口，辅助备孕计划与生理期管理，不适合作为避孕或医疗依据。",
    links: [
      ["/health/due-date-cn/", "预产期计算器"],
      ["/daily/date-diff/", "日期天数计算器"],
      ["/health/bmi-cn/", "BMI 计算器"],
    ],
  },
  "health/pace-cn": {
    t: "跑步配速计算器 — 在线配速时速与完赛时间换算",
    d: "免费在线跑步配速计算器：输入距离与完赛时间，即时换算配速（分钟/公里）、时速（公里/小时）与分段用时，帮助跑者设定 5K/10K/半马目标配速并匀速完赛。",
    links: [
      ["/health/calorie-burn-cn/", "卡路里消耗计算器"],
      ["/health/bmi-cn/", "BMI 计算器"],
      ["/daily/basic/", "四则运算计算器"],
    ],
  },
  "investment/amazon-fba-cn": {
    t: "Amazon FBA 费用计算器 — 在线亚马逊配送费与利润估算",
    d: "免费在线 Amazon FBA 费用计算器：按售价、采购成本与商品尺寸估算配送费、仓储费与单件净利，辅助跨境卖家选品评估与定价决策，费用口径以亚马逊官方费率表为准。",
    links: [
      ["/investment/cross-border-profit-cn/", "跨境电商利润计算器"],
      ["/investment/gross-margin-cn/", "毛利率计算器"],
      ["/investment/break-even-cn/", "盈亏平衡计算器"],
    ],
  },
  "investment/break-even-cn": {
    t: "盈亏平衡点计算器 — 在线保本销量与销售额试算",
    d: "免费在线盈亏平衡计算器：输入固定成本、单价与单位变动成本，即时算出保本销量、保本销售额与安全边际，开店预算、新品立项与定价决策的必备测算工具。",
    links: [
      ["/investment/gross-margin-cn/", "毛利率计算器"],
      ["/investment/conversion-rate-cn/", "转化率计算器"],
      ["/investment/roas-cn/", "ROAS 计算器"],
    ],
  },
  "investment/conversion-rate-cn": {
    t: "转化率计算器 — 在线 CVR 转化率与转化数换算",
    d: "免费在线转化率计算器：输入访客数与转化数即时计算转化率（CVR），并可反推目标转化所需流量，适用于电商详情页、广告投放与增长漏斗的转化效率分析。",
    links: [
      ["/investment/roas-cn/", "ROAS 计算器"],
      ["/investment/gross-margin-cn/", "毛利率计算器"],
      ["/math/percentage/", "百分比计算器"],
    ],
  },
  "investment/cross-border-profit-cn": {
    t: "跨境电商利润计算器 — 在线单件净利与净利率估算",
    d: "免费在线跨境电商利润计算器：输入售价、采购成本、运费、平台费率与汇率，即时估算单件毛利与净利率，覆盖美元售价人民币成本的主流核算场景，助力选品定价。",
    links: [
      ["/investment/amazon-fba-cn/", "Amazon FBA 费用计算器"],
      ["/investment/gross-margin-cn/", "毛利率计算器"],
      ["/finance/currency-exchange-cn/", "汇率换算计算器"],
    ],
  },
  "investment/crypto-position-cn": {
    t: "加密货币仓位计算器 — 在线仓位大小与爆仓价估算",
    d: "免费在线加密货币仓位计算器：输入账户权益、杠杆倍数与入场价，估算可开仓位、名义价值与多空爆仓价，辅助永续合约风险控制，结果仅供参考不构成投资建议。",
    links: [
      ["/investment/futures-margin-cn/", "期货保证金计算器"],
      ["/investment/turtle-position-cn/", "海龟仓位计算器"],
      ["/finance/irr-cn/", "IRR 计算器"],
    ],
  },
  "investment/futures-margin-cn": {
    t: "期货保证金计算器 — 在线所需保证金与合约价值试算",
    d: "免费在线期货保证金计算器：输入合约价格、手数、合约乘数与保证金率，即时计算所需保证金与持仓名义价值，商品期货与股指期货开仓前的风险管理工具。",
    links: [
      ["/investment/crypto-position-cn/", "加密货币仓位计算器"],
      ["/investment/option-pricing-cn/", "期权定价计算器"],
      ["/investment/turtle-position-cn/", "海龟仓位计算器"],
    ],
  },
  "investment/gross-margin-cn": {
    t: "毛利率计算器 — 在线毛利润与毛利率快速核算",
    d: "免费在线毛利率计算器：输入营业收入与营业成本，即时算出毛利润与毛利率，支持定价方案快速试算与产品毛利横向对比，财务分析与经营决策的基础工具。",
    links: [
      ["/investment/break-even-cn/", "盈亏平衡计算器"],
      ["/math/discount/", "折扣计算器"],
      ["/math/percentage/", "百分比计算器"],
    ],
  },
  "investment/option-pricing-cn": {
    t: "期权定价计算器 — 在线 Black-Scholes 模型试算",
    d: "免费在线 Black-Scholes 期权定价计算器：输入标的价格、行权价、无风险利率、波动率与到期时间，估算看涨/看跌期权理论价格与希腊字母，为期权交易提供参考。",
    links: [
      ["/investment/futures-margin-cn/", "期货保证金计算器"],
      ["/finance/irr-cn/", "IRR 计算器"],
      ["/finance/annualized-return-cn/", "年化收益率计算器"],
    ],
  },
  "investment/roas-cn": {
    t: "ROAS 计算器 — 在线广告支出回报率与盈亏线估算",
    d: "免费在线广告 ROAS 计算器：输入广告花费与广告销售额，即时得出 ROAS 与 ROI，结合毛利率可测算盈亏平衡 ROAS 线，电商投放与品牌广告效果评估常用工具。",
    links: [
      ["/investment/conversion-rate-cn/", "转化率计算器"],
      ["/investment/gross-margin-cn/", "毛利率计算器"],
      ["/investment/break-even-cn/", "盈亏平衡计算器"],
    ],
  },
  "investment/turtle-position-cn": {
    t: "海龟交易法仓位计算器 — 在线 ATR 头寸与风险敞口测算",
    d: "免费在线海龟交易法仓位计算器：按账户权益、ATR 波动值与单笔风险比例计算单位头寸、建议加仓数与最大风险敞口，帮助趋势交易者执行系统化仓位管理。",
    links: [
      ["/investment/crypto-position-cn/", "加密货币仓位计算器"],
      ["/investment/futures-margin-cn/", "期货保证金计算器"],
      ["/math/average/", "平均值计算器"],
    ],
  },
  "renovation/floor-area-cn": {
    t: "房屋面积计算器 — 在线房间面积求和套内面积估算",
    d: "免费在线房屋面积计算器：逐间输入面积自动求和得出套内面积，支持套内与建筑面积换算及公摊率估算，装修报价核对与房产面积验算的实用工具。",
    links: [
      ["/renovation/renovation-budget-cn/", "装修预算计算器"],
      ["/renovation/tile-quantity-cn/", "瓷砖数量计算器"],
      ["/renovation/paint-quantity-cn/", "乳胶漆用量计算器"],
    ],
  },
  "renovation/paint-quantity-cn": {
    t: "乳胶漆用量计算器 — 在线墙面漆升数与桶数估算",
    d: "免费在线乳胶漆用量计算器：输入墙面面积、涂刷遍数与每升涂刷面积，估算所需油漆总升数与购买桶数，避免开工缺料或多买浪费，附常见 5L 装涂刷参考。",
    links: [
      ["/renovation/renovation-budget-cn/", "装修预算计算器"],
      ["/renovation/tile-quantity-cn/", "瓷砖数量计算器"],
      ["/renovation/floor-area-cn/", "房屋面积计算器"],
    ],
  },
  "renovation/renovation-budget-cn": {
    t: "装修预算计算器 — 在线硬装软装费用分配估算",
    d: "免费在线装修预算计算器：按建筑面积与装修单价估算总预算，给出硬装 60% 软装 40% 的分配建议与各阶段费用参考，帮助业主控制预算、对比装修公司报价。",
    links: [
      ["/renovation/floor-area-cn/", "房屋面积计算器"],
      ["/renovation/tile-quantity-cn/", "瓷砖数量计算器"],
      ["/renovation/paint-quantity-cn/", "乳胶漆用量计算器"],
    ],
  },
  "renovation/tile-quantity-cn": {
    t: "瓷砖数量计算器 — 在线用砖量与损耗率估算",
    d: "免费在线瓷砖数量计算器：输入铺设面积、瓷砖长宽与损耗率，即时算出所需片数与总面积，附直铺与斜铺损耗参考值，同批买足避免补货色差。",
    links: [
      ["/renovation/renovation-budget-cn/", "装修预算计算器"],
      ["/renovation/floor-area-cn/", "房屋面积计算器"],
      ["/renovation/paint-quantity-cn/", "乳胶漆用量计算器"],
    ],
  },
  "finance/deposit-interest-cn": {
    t: "存款利息计算器 — 在线定期存款整存整取利息试算",
    d: "免费在线存款利息计算器：输入本金、年利率与存期，即时计算利息与到期本息，支持单利/复利两种计息方式与大额存单对比，储蓄与存钱规划一目了然。",
    links: [
      ["/finance/compound-interest-cn/", "复利计算器"],
      ["/finance/annualized-return-cn/", "年化收益率"],
      ["/finance/loan-cn/", "贷款计算器"],
    ],
  },
  "finance/equal-installment-cn": {
    t: "等额本息计算器 — 在线房贷月供与总利息试算",
    d: "免费在线等额本息贷款计算器：输入贷款本金、年限与年利率，即时计算月供、总利息与还款总额，支持等额本息与等额本金两种还款方式对比，房贷还款方式选择参考。",
    links: [
      ["/finance/mortgage-cn/", "房贷计算器"],
      ["/finance/loan-cn/", "贷款计算器"],
      ["/finance/prepayment-cn/", "提前还款计算器"],
    ],
  },
  "unit/length": {
    t: "长度单位换算器 — 在线米厘米英尺英寸互转",
    d: "免费在线长度单位换算器：米、厘米、毫米、公里、英寸、英尺、码等常用单位一键互转，覆盖公制与英制，适合身高换算、海淘尺寸核对与工程图纸读量。",
    links: [
      ["/unit/temperature/", "温度单位换算器"],
      ["/math/ratio/", "比例计算器"],
      ["/daily/basic/", "四则运算计算器"],
    ],
  },
  "unit/temperature": {
    t: "温度单位换算器 — 在线摄氏度华氏度开尔文互转",
    d: "免费在线温度单位换算器：摄氏度、华氏度、开尔文三种单位一键互转，附常见温度对照参考，适合海淘电器参数核对、菜谱烘焙与气象数据阅读。",
    links: [
      ["/unit/length/", "长度单位换算器"],
      ["/daily/basic/", "四则运算计算器"],
      ["/math/ratio/", "比例计算器"],
    ],
  },
};

let titlePatched = 0;
let linkPatched = 0;
const errors = [];

for (const [page, cfg] of Object.entries(MAP)) {
  const path = `src/pages/${page}.astro`;
  let s;
  try {
    s = readFileSync(path, "utf8");
  } catch {
    errors.push(`${page}: 文件不存在`);
    continue;
  }
  const own = `/${page}/`;
  if (cfg.links.some(([h]) => h === own)) errors.push(`${page}: 链接含自身`);
  if (cfg.links.length < 3) errors.push(`${page}: 链接不足 3`);

  // title/desc：BaseLayout 行 + CalcJsonLd 行
  const oldT = (s.match(/title="([^"]+)"/) || [])[1];
  const oldD = (s.match(/\ndescription="([^"]+)"/) ||
    s.match(/ description="([^"]+)"/) ||
    [])[1];
  if (!oldT || !oldD) {
    errors.push(`${page}: 未找到 title/description`);
    continue;
  }
  if (cfg.t) {
    s = s.split(`title="${oldT}"`).join(`title="${cfg.t}"`);
    titlePatched++;
  }
  if (cfg.d) {
    s = s.split(`description="${oldD}"`).join(`description="${cfg.d}"`);
  }

  // 相关工具 section 整体替换
  // 兼容两种方言：紧凑版与带 aria-labelledby 的手写版
  const sec = s.match(
    /<section class="section"[^>]*>\s*<h2[^>]*>相关工具<\/h2>\s*<ul class="tool-list">[\s\S]*?<\/ul>\s*<\/section>/,
  );
  if (!sec) {
    errors.push(`${page}: 未找到相关工具 section`);
    continue;
  }
  const items = cfg.links
    .map(([h, l]) => `  <li><a href="${h}">${l}</a></li>`)
    .join("\n");
  s = s.replace(
    sec[0],
    `<section class="section"><h2>相关工具</h2><ul class="tool-list">\n${items}\n      </ul></section>`,
  );
  linkPatched++;

  if (!DRY) writeFileSync(path, s);
}

console.log(
  `title/desc 更新 ${titlePatched} 页；相关工具重写 ${linkPatched} 页（共 ${Object.keys(MAP).length}）`,
);
if (errors.length) console.log("问题：\n" + errors.join("\n"));
