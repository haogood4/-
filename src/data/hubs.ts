/**
 * src/data/hubs.ts — 场景 Hub 数据配置
 * 5 个场景（first-home-buying/renovation-100k/retirement-30/tax-annual-filing/fitness-fat-loss）
 */
export interface HubStepTool {
  name: string;
  href: string;
  reason: string; // 为何需要这一步
}

export interface HubStep {
  title: string;
  description: string;
  tools: HubStepTool[];
  note?: string;
}

export interface Hub {
  slug: string;
  title: string;
  scenario: string; // 一句话场景
  estimatedTime: string;
  difficulty: "简单" | "中等" | "进阶";
  category: "finance" | "health" | "renovation";
  steps: HubStep[];
  faq: { q: string; a: string }[];
}

export const HUBS: Hub[] = [
  {
    slug: "first-home-buying",
    title: "首次买房决策：从月供测算到提前还款",
    scenario: "计划首次购房，需要测算月供压力、选择还款方式、规划提前还款",
    estimatedTime: "30 分钟",
    difficulty: "中等",
    category: "finance",
    steps: [
      {
        title: "Step 1：评估可承担月供",
        description: "先明确自己每月可承受的还款金额（建议 ≤ 月收入的 50%）。",
        tools: [
          {
            name: "房贷计算器",
            href: "/finance/mortgage-cn/",
            reason: "输入总价与首付，反算月供",
          },
        ],
        note: "月供压力包含本金 + 利息 + 物业费 + 维修基金，建议预留缓冲。",
      },
      {
        title: "Step 2：选择还款方式",
        description: "等额本息月供固定，等额本金总利息少但前期压力大。",
        tools: [
          {
            name: "等额本息 vs 等额本金",
            href: "/finance/equal-installment-cn/",
            reason: "对比两种方式的总利息差异",
          },
          {
            name: "提前还款计算器",
            href: "/finance/prepayment-cn/",
            reason: "模拟未来提前还款场景",
          },
        ],
        note: "若计划 5-10 年内提前还款，优先选等额本息（前期利息占比高，提前还时节省更多）。",
      },
      {
        title: "Step 3：准备首付与税费",
        description: "除首付外，还需准备契税、印花税、维修基金等 1-3% 杂费。",
        tools: [
          {
            name: "五险一金计算器",
            href: "/finance/social-insurance-cn/",
            reason: "估算税前收入与税后到手",
          },
        ],
      },
    ],
    faq: [
      {
        q: "应该选等额本息还是等额本金？",
        a: "见「Step 2 备注」：5-10 年内提前还款选等额本息；长期持有选等额本金。",
      },
      {
        q: "LPR 浮动还是固定利率？",
        a: "对未来利率趋势不确定时优先固定；预期利率下行时选 LPR 浮动。",
      },
      {
        q: "工具使用顺序：先算月供还是先选还款方式？",
        a: "建议 Step 1→2→3 顺序：先确定可承担月供（粗筛房价区间）→ 再对比还款方式（细选方案）→ 最后准备首付与税费。",
      },
    ],
  },
  {
    slug: "renovation-100k",
    title: "10 万装修预算：瓷砖/乳胶漆/面积全测算",
    scenario: "10 万元装修预算，需要合理分配到各空间与材料",
    estimatedTime: "20 分钟",
    difficulty: "简单",
    category: "renovation",
    steps: [
      {
        title: "Step 1：量房与面积计算",
        description: "准确测量每个房间的墙面与地面面积（含门窗扣除）。",
        tools: [
          {
            name: "房屋面积计算器",
            href: "/renovation/floor-area-cn/",
            reason: "快速计算墙面地面总面积",
          },
        ],
      },
      {
        title: "Step 2：瓷砖用量",
        description: "厨卫地面+墙面瓷砖，含 5%-10% 损耗。",
        tools: [
          {
            name: "瓷砖用量计算器",
            href: "/renovation/tile-quantity-cn/",
            reason: "按面积与瓷砖规格算块数",
          },
        ],
        note: "厨卫四面墙是否全贴？建议：厨房灶台区 1.8-2.4m 高；卫生间全墙贴。",
      },
      {
        title: "Step 3：乳胶漆用量",
        description: "墙面乳胶漆用量 = 墙面面积 × 涂刷遍数 ÷ 涂料遮盖力。",
        tools: [
          {
            name: "乳胶漆用量计算器",
            href: "/renovation/paint-quantity-cn/",
            reason: "按面积与涂刷遍数算桶数",
          },
        ],
      },
      {
        title: "Step 4：总预算分配",
        description:
          "硬装（瓷砖/漆/水电）通常占 40-60%，软装 + 家电 30-40%，预留 10% 应急。",
        tools: [
          {
            name: "装修预算计算器",
            href: "/renovation/renovation-budget-cn/",
            reason: "按空间分配总预算",
          },
        ],
      },
    ],
    faq: [
      {
        q: "10 万够装修 80 m² 吗？",
        a: "中档装修：80 m² 半包约 5-7 万 + 主材 4-6 万 = 10 万足够；全包略紧。建议预留 10% 应急金。",
      },
      {
        q: "瓷砖一定要同一批次吗？",
        a: "是的。同一空间必须同一批次（色号+生产日期一致），否则可能色差。",
      },
      {
        q: "工具使用顺序是什么？",
        a: "面积 → 瓷砖 → 乳胶漆 → 总预算。前三步为最后总预算提供分项数据。",
      },
    ],
  },
  {
    slug: "retirement-30",
    title: "30 岁养老金规划：复利 + 定投 + IRR 全工具组合",
    scenario: "30 岁开始规划养老，需要估算退休时资产规模与投资回报",
    estimatedTime: "40 分钟",
    difficulty: "进阶",
    category: "finance",
    steps: [
      {
        title: "Step 1：理解复利威力",
        description: "用复利计算器看 30 年资产翻倍效应。",
        tools: [
          {
            name: "复利计算器",
            href: "/finance/compound-interest-cn/",
            reason: "理解本金随时间指数增长",
          },
        ],
      },
      {
        title: "Step 2：基金定投测算",
        description: "每月定投 + 年化收益率，估算退休时资产。",
        tools: [
          {
            name: "基金定投计算器",
            href: "/finance/fund-dca-cn/",
            reason: "月定投 + 长期收益率测算",
          },
        ],
      },
      {
        title: "Step 3：年化收益率对比",
        description: "对比不同投资品（指数基金/股票/债券）的历史年化收益。",
        tools: [
          {
            name: "年化收益率计算器",
            href: "/finance/annualized-return-cn/",
            reason: "对比多笔投资收益",
          },
        ],
      },
      {
        title: "Step 4：IRR 评估项目",
        description: "若有副业/项目投资，用 IRR 评估真实回报率。",
        tools: [
          {
            name: "IRR 计算器",
            href: "/finance/irr-cn/",
            reason: "不规则现金流的真实回报",
          },
        ],
      },
    ],
    faq: [
      {
        q: "30 岁开始晚吗？",
        a: "不晚。复利威力随时间指数增长，30 年定投比 20 年起步晚，但 40 年仍有可观收益。",
      },
      {
        q: "月定投多少合适？",
        a: "建议税后收入的 10-20%（如月入 1 万 → 定投 1000-2000）。",
      },
      {
        q: "工具使用顺序？",
        a: "复利（理解原理）→ 定投（日常操作）→ 年化收益（评估）→ IRR（复杂项目）。",
      },
    ],
  },
  {
    slug: "tax-annual-filing",
    title: "个税年度申报：专项附加扣除 + 五险一金全攻略",
    scenario: "每年 3-6 月个税年度汇算，需要核对专项附加扣除与五险一金",
    estimatedTime: "25 分钟",
    difficulty: "中等",
    category: "finance",
    steps: [
      {
        title: "Step 1：核对五险一金缴费",
        description: "确认上年五险一金缴费基数与金额（影响个税扣除）。",
        tools: [
          {
            name: "五险一金计算器",
            href: "/finance/social-insurance-cn/",
            reason: "核算上年实际缴费",
          },
        ],
      },
      {
        title: "Step 2：核对专项附加扣除",
        description: "确认子女教育、住房贷款利息、赡养老人等 7 项扣除已申报。",
        tools: [
          {
            name: "个税计算器",
            href: "/finance/income-tax-cn/",
            reason: "输入扣除项，得出应纳税额",
          },
        ],
      },
      {
        title: "Step 3：年度汇算",
        description: "如预扣税额 > 实际应纳税额，可申请退税；反之补税。",
        tools: [
          {
            name: "年化收益率计算器",
            href: "/finance/annualized-return-cn/",
            reason: "若有退税可看作「无风险年化」",
          },
        ],
      },
    ],
    faq: [
      {
        q: "专项附加扣除什么时候申报？",
        a: "建议每年 12 月确认下一年度；如有变化（如子女毕业）需及时在个税 APP 更新。",
      },
      {
        q: "退税什么时候到账？",
        a: "提交后 10 个工作日内审核；通过后 1-3 个工作日到账银行卡。",
      },
      {
        q: "工具使用顺序？",
        a: "先算五险一金（影响扣除基数）→ 再算个税（含专项附加扣除）→ 最后判断是否退税。",
      },
    ],
  },
  {
    slug: "fitness-fat-loss",
    title: "健身减脂：BMI 自检 + 卡路里消耗全流程",
    scenario: "开始健身减脂，需要先评估 BMI 现状再规划运动",
    estimatedTime: "15 分钟",
    difficulty: "简单",
    category: "health",
    steps: [
      {
        title: "Step 1：BMI 现状自检",
        description: "评估当前 BMI（中国 + WHO 双标准）。",
        tools: [
          {
            name: "BMI 计算器",
            href: "/health/bmi-cn/",
            reason: "输入身高体重得出双标准分类",
          },
        ],
        note: "BMI 仅作参考；运动员肌肉量大可能 BMI 超重但体脂正常。",
      },
      {
        title: "Step 2：估算卡路里消耗",
        description: "根据体重与运动类型估算单次卡路里消耗。",
        tools: [
          {
            name: "卡路里消耗计算器",
            href: "/health/calorie-burn-cn/",
            reason: "跑步/游泳/骑行等消耗估算",
          },
          {
            name: "步频计算器",
            href: "/health/pace-cn/",
            reason: "慢跑/快走配速估算",
          },
        ],
      },
      {
        title: "Step 3：设定减重目标",
        description: "健康减重速度：每月 2-4 kg（每周 0.5-1 kg）。",
        tools: [],
      },
    ],
    faq: [
      {
        q: "BMI 28 必须减重吗？",
        a: "按中国标准已属肥胖，建议结合腰围与体脂率综合判断；具体方案请咨询医生或营养师。",
      },
      {
        q: "每天跑步 30 分钟能减多少？",
        a: "约消耗 300-400 卡路里（70 kg 体重）。每周减 0.5 kg 需每天 30 分钟慢跑 + 饮食控制 500 卡。",
      },
      {
        q: "工具使用顺序？",
        a: "BMI（评估现状）→ 卡路里（量化运动）→ 步频（控制强度）。循序渐进，不建议一开始就高强度。",
      },
    ],
  },
];
