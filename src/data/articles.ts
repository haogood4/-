/**
 * src/data/articles.ts — 知识库文章同步数据源（hub 模式）
 *
 * 原因：Astro 7 Content Collections + async getStaticPaths + 同目录 [slug].astro
 * 会被静默忽略，故放弃 collection 路由，改用同步 TS 数据 + 构建期加载 markdown。
 * Content Collections 仍保留 schema 校验（在 content.config.ts），通过 getCollection
 * 在 frontmatter 验证失败时构建报错。
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  /**
   * 业务类目（如 finance/health/renovation/investment/efficiency/daily）
   */
  category:
    "finance" | "health" | "renovation" | "investment" | "efficiency" | "daily";
  /**
   * 内容类型：
   * - article：知识库长文（A 方向）
   * - blog：政策资讯博客（D 方向）
   */
  type: "article" | "blog";
  tools: string[];
  publishedAt: Date;
  updatedAt: Date;
  /** 资讯类专用：过期时间（180 天后自动降级） */
  expiresAt?: Date;
  /** 资讯类专用：资讯来源列表（官方公告） */
  sources?: { label: string; href: string }[];
  /** 资讯类专用：相关知识库文章 slug（跨类型内链） */
  relatedArticles?: string[];
  author: string;
  keywords: string[];
  faq: { q: string; a: string }[];
  readingTime: number;
}

/** 判断文章是否已过期（>180 天） */
export function isArticleExpired(
  article: ArticleData,
  now: Date = new Date(),
): boolean {
  if (!article.expiresAt) return false;
  return now.getTime() > article.expiresAt.getTime();
}

/** 同步数据：articles 列表（来自 Content Collections 的 frontmatter） */
export const ARTICLES: ArticleData[] = [
  {
    slug: "equal-installment-vs-equal-principal",
    title: "等额本息 vs 等额本金：哪种还款方式更划算（完整对比）",
    description:
      "详解等额本息与等额本金两种房贷还款方式的月供、总利息、前期压力差异；含 LPR 浮动与提前还款场景的影响。",
    category: "finance",
    type: "article",
    tools: [
      "/finance/mortgage-cn/",
      "/finance/equal-installment-cn/",
      "/finance/prepayment-cn/",
    ],
    publishedAt: new Date("2026-09-19"),
    updatedAt: new Date("2026-09-19"),
    author: "计算器大全编辑团队",
    keywords: [
      "等额本息",
      "等额本金",
      "房贷还款方式",
      "月供计算",
      "总利息对比",
    ],
    faq: [
      {
        q: "等额本息总利息一定比等额本金多吗？",
        a: "在相同贷款本金、相同年限、相同利率下，等额本息总利息一定更多（因前期还款中本金占比小、利息占比大）。差异大小取决于年限。",
      },
      {
        q: "前期还款压力大，可以中途从等额本金换成等额本息吗？",
        a: "可以，但需向贷款机构申请重新签订合同（部分银行不支持）。",
      },
      {
        q: "LPR 浮动利率对两种还款方式影响相同吗？",
        a: "影响机制相同，但等额本息前期剩余本金减少慢，因此利率上行时等额本息前期月供上涨更敏感。",
      },
      {
        q: "本计算器结果与实际还款有差异怎么办？",
        a: "计算基于等额本息/等额本金标准公式；实际还款受利率调整方式、罚息、组合贷款等因素影响。",
      },
    ],
    readingTime: 8,
  },
  {
    slug: "personal-income-tax-deductions-2026",
    title: "个税专项附加扣除 2026 全解析（7 项扣除标准与申报指南）",
    description:
      "详解 2026 年个人所得税 7 项专项附加扣除的扣除标准、申报方式与常见误区，附案例测算。",
    category: "finance",
    type: "article",
    tools: [
      "/finance/income-tax-cn/",
      "/finance/social-insurance-cn/",
      "/finance/annualized-return-cn/",
    ],
    publishedAt: new Date("2026-09-19"),
    updatedAt: new Date("2026-09-19"),
    author: "计算器大全编辑团队",
    keywords: [
      "个税专项附加扣除",
      "2026 个税",
      "子女教育扣除",
      "住房贷款利息扣除",
      "赡养老人扣除",
    ],
    faq: [
      {
        q: "专项附加扣除每年都要重新申报吗？",
        a: "大部分项目一次申报长期有效，但子女毕业、老人去世、房贷结清等情况需更新。",
      },
      {
        q: "住房贷款利息扣除和住房租金扣除能同时享受吗？",
        a: "不能。纳税人只能享受其中一项。",
      },
      {
        q: "大病医疗扣除超过限额的部分可以结转吗？",
        a: "可以。大病医疗是 7 项中唯一可结转的：当年未扣完的可结转至以后年度，最长不超过 3 年。",
      },
      { q: "夫妻双方可以分摊扣除额度吗？", a: "可以，但合计不超过规定标准。" },
    ],
    readingTime: 9,
  },
  {
    slug: "social-insurance-explained",
    title: "五险一金缴费基数与比例详解：到手工资怎么算",
    description:
      "详解五险一金的缴费基数上下限、各险种单位与个人缴费比例，附月薪 1 万到 5 万到手工资测算。",
    category: "finance",
    type: "article",
    tools: [
      "/finance/social-insurance-cn/",
      "/finance/income-tax-cn/",
      "/finance/annualized-return-cn/",
    ],
    publishedAt: new Date("2026-09-19"),
    updatedAt: new Date("2026-09-19"),
    author: "计算器大全编辑团队",
    keywords: [
      "五险一金缴费比例",
      "缴费基数",
      "到手工资计算",
      "公积金",
      "社保",
    ],
    faq: [
      {
        q: "缴费基数是按实际工资还是按当地社平工资？",
        a: "按上一年度月平均工资核定，但有上下限：下限为当地社平工资的 60%，上限为 300%。",
      },
      {
        q: "试用期员工也要交五险一金吗？",
        a: "必须交。根据《社会保险法》第 58 条，用人单位应在用工之日起 30 日内办理社保登记。",
      },
      {
        q: "换城市工作后社保怎么处理？",
        a: "养老保险可转移（小程序「掌上 12333」办理）；医疗保险多数省份已实现跨省直接结算。",
      },
      {
        q: "灵活就业人员怎么交社保？",
        a: "可单独参加养老和医疗（按当地社平 60%-300% 自选基数）。",
      },
    ],
    readingTime: 7,
  },
  {
    slug: "bmi-standards-cn-vs-who",
    title: "BMI 标准双对照：中国标准 vs WHO 标准（附儿童与老人说明）",
    description:
      "详解中国（WS/T 428-2013）与 WHO 两套 BMI 标准差异、儿童青少年性别年龄百分位。",
    category: "health",
    type: "article",
    tools: ["/health/bmi-cn/", "/health/calorie-burn-cn/", "/health/pace-cn/"],
    publishedAt: new Date("2026-09-19"),
    updatedAt: new Date("2026-09-19"),
    author: "计算器大全编辑团队",
    keywords: ["BMI 标准", "中国 BMI", "WHO BMI", "儿童 BMI", "肥胖判定"],
    faq: [
      {
        q: "BMI 一样但体型差异大，正常吗？",
        a: "正常。BMI 仅反映体重/身高比，不区分脂肪与肌肉。",
      },
      {
        q: "BMI 28 一定是肥胖吗？",
        a: "按中国标准 BMI ≥ 28 为肥胖；WHO 标准 ≥ 30 为肥胖。同一人可能中国「肥胖」但 WHO「超重」。",
      },
      {
        q: "儿童 BMI 怎么算？",
        a: "儿童青少年（3-18 岁）BMI 标准与成人不同，需按性别+年龄查百分位表。",
      },
      {
        q: "孕期 BMI 怎么算？",
        a: "孕期不建议单纯用 BMI 评估，应使用孕前 BMI 配合孕期增重推荐。",
      },
    ],
    readingTime: 6,
  },
  {
    slug: "tile-quantity-calculation",
    title: "装修瓷砖用量怎么算（含损耗与边角处理）",
    description:
      "详解瓷砖用量计算公式、损耗率选择（5%-10%）、不同铺贴方式（正铺/斜铺）的损耗差异。",
    category: "renovation",
    type: "article",
    tools: [
      "/renovation/tile-quantity-cn/",
      "/renovation/floor-area-cn/",
      "/renovation/renovation-budget-cn/",
    ],
    publishedAt: new Date("2026-09-19"),
    updatedAt: new Date("2026-09-19"),
    author: "计算器大全编辑团队",
    keywords: ["瓷砖用量计算", "瓷砖损耗", "铺贴损耗", "装修预算"],
    faq: [
      {
        q: "瓷砖损耗率选 5% 还是 10%？",
        a: "普通正铺：5%；斜铺：8-10%；小尺寸瓷砖（300×300 以下）：8-10%；复杂户型：10-12%。",
      },
      {
        q: "厨卫四面墙都要贴瓷砖吗？",
        a: "不一定。厨房油烟区建议贴瓷砖（灶台周边 3 面墙 1.8-2.4m 高）；卫生间建议全墙贴（湿区）；阳台根据预算选半墙或全墙。",
      },
      {
        q: "瓷砖到货后发现批次色差怎么办？",
        a: "立即停止铺贴并联系商家。同一空间必须使用同一批次（包装上的色号与生产日期）。",
      },
      {
        q: "瓷砖胶和水泥砂浆哪个更好？",
        a: "瓷砖胶（薄贴法）：粘结力强、用量少、适合大板瓷砖；水泥砂浆（厚贴法）：传统工艺、价格低、施工容错大。",
      },
    ],
    readingTime: 7,
  },
  // ===== 政策资讯博客（D 方向 P1）首批 6 篇 =====
  {
    slug: "lpr-2026-september",
    title: "最新 LPR 报价维持 3.0% 与 3.5% 不变：你的房贷利率会动吗",
    description:
      "中国人民银行授权公布：2026 年 8 月 20 日 LPR 为 1 年期 3.0%、5 年期以上 3.5%，连续 15 个月不变；9 月报价将于 9 月 20 日公布。本文解读对存量房贷与新增房贷的影响。",
    category: "finance",
    type: "blog",
    tools: [
      "/finance/mortgage-cn/",
      "/finance/equal-installment-cn/",
      "/finance/prepayment-cn/",
    ],
    publishedAt: new Date("2026-09-19"),
    updatedAt: new Date("2026-09-19"),
    expiresAt: new Date("2027-03-18"),
    sources: [
      {
        label: "新华网：新一期 LPR 未作调整（2026-08-20）",
        href: "http://www.xinhuanet.com/20260820/5387d4b25db947cbb501814851c7ac30/c.html",
      },
      { label: "中国人民银行", href: "http://www.pbc.gov.cn/" },
    ],
    relatedArticles: ["equal-installment-vs-equal-principal"],
    author: "计算器大全编辑团队",
    keywords: ["LPR 2026", "LPR 最新", "房贷利率", "5 年期 LPR"],
    faq: [
      {
        q: "最新一期 LPR 维持不变，对我的存量房贷有什么影响？",
        a: "2026 年 8 月 20 日公布的 LPR（1 年期 3.0%、5 年期以上 3.5%）已连续 15 个月不变；重定价日按最新报价执行，月供与之前相同，下一周期按届时最新 LPR 浮动。",
      },
      {
        q: "新增房贷现在申请，利率是多少？",
        a: "新增首套房贷利率 = 5 年期 LPR + 银行加点（多数城市加点已取消或负值）。",
      },
      {
        q: "LPR 下调能省多少月供？",
        a: "以 100 万 30 年等额本息为例，5 年期以上 LPR 从 3.5% 下调 10BP 至 3.4%，月供由约 4,490 元降至约 4,435 元，每月省约 56 元，30 年累计节省约 2.0 万元。",
      },
    ],
    readingTime: 5,
  },
  {
    slug: "individual-income-tax-annual-filing-2027",
    title: "个税年度汇算清缴手册：7 项专项附加扣除填报详解",
    description:
      "依据国家税务总局通告 2026 年第 1 号，以 2025 年度汇算（2026 年 3 月 1 日至 6 月 30 日办理）为例，拆解 7 项专项附加扣除的填报顺序、常见错误与补救方法。",
    category: "finance",
    type: "blog",
    tools: ["/finance/income-tax-cn/", "/finance/bonus-tax-cn/"],
    publishedAt: new Date("2026-09-18"),
    updatedAt: new Date("2026-09-19"),
    expiresAt: new Date("2027-06-30"),
    sources: [
      {
        label: "国家税务总局：2026 年度汇算通告（2026 年第 1 号）",
        href: "https://fgk.chinatax.gov.cn/zcfgk/c102424/c5247612/content.html",
      },
    ],
    relatedArticles: ["personal-income-tax-deductions-2026"],
    author: "计算器大全编辑团队",
    keywords: ["个税年度汇算", "专项附加扣除", "个税申报", "汇算清缴 2027"],
    faq: [
      {
        q: "预约办税是当年新推行的吗？汇算时间窗口是？",
        a: "不是。预约办税自 2022 年度汇算起即可通过「个人所得税」APP 使用，并非当年新推行。汇算窗口为每年 3 月 1 日至 6 月 30 日，逾期未申报可能影响信用记录并产生滞纳金。",
      },
      {
        q: "7 项专项附加扣除的填报顺序有要求吗？",
        a: "无强制顺序，但建议按金额从大到小先填（住房贷款利息/租金、子女教育、赡养老人），可最快降低应税所得。",
      },
      {
        q: "漏报了一项专项附加扣除怎么办？",
        a: "可在汇算清缴期内补充申报；超过 6 月 30 日只能通过「个人所得税」APP 发起更正。",
      },
      {
        q: "退税多久到账？",
        a: "审核通过后 10 个工作日内到账，遇节假日顺延（办理时限与到账进度以当地税务机关为准）。",
      },
    ],
    readingTime: 7,
  },
  {
    slug: "medical-insurance-personal-account-2026",
    title: "医保个人账户改革落地：2026 年起这 5 类变化与你相关",
    description:
      "国家医保局《关于建立健全职工基本医疗保险门诊共济保障机制的指导意见》多数统筹区已落地。2026 年起，职工医保个人账户资金计入方式、配偶父母共享、门诊报销限额等 5 项关键变化解读。",
    category: "finance",
    type: "blog",
    tools: ["/finance/social-insurance-cn/", "/finance/income-tax-cn/"],
    publishedAt: new Date("2026-09-17"),
    updatedAt: new Date("2026-09-19"),
    expiresAt: new Date("2027-06-30"),
    sources: [
      {
        label: "国办发〔2021〕14 号：门诊共济保障机制指导意见",
        href: "https://www.gov.cn/zhengce/content/2021-04/22/content_5601280.htm",
      },
    ],
    relatedArticles: ["social-insurance-explained"],
    author: "计算器大全编辑团队",
    keywords: ["医保改革 2026", "医保个人账户", "门诊共济", "医保家庭共享"],
    faq: [
      {
        q: "个人账户每月划入金额变少，是不是亏了？",
        a: "短期看个人账户划入减少（在职职工仅个人缴费约 2% 计入），但普通门诊费用纳入统筹报销。各地门诊报销限额差异大，整体保障水平提高与否取决于个人门诊使用情况。",
      },
      {
        q: "个人账户能给家人用吗？",
        a: "可以。已办理家庭共济备案的配偶、父母、子女可在定点医药机构使用。",
      },
      {
        q: "异地就医能用个人账户吗？",
        a: "已实现跨省直接结算的地区可直接使用；未实现的地区需办理异地就医备案。",
      },
    ],
    readingTime: 6,
  },
  {
    slug: "existing-mortgage-rate-batch-adjustment",
    title: "存量房贷利率调整 10 问（央行公告〔2024〕第 11 号）",
    description:
      "基于 2024 年存量房贷利率批量调整政策与央行公告〔2024〕第 11 号确立的常态化调整机制，解答「我是否符合条件」「能降多少」「何时生效」等 10 个常见疑问。",
    category: "finance",
    type: "blog",
    tools: ["/finance/mortgage-cn/", "/finance/prepayment-cn/"],
    publishedAt: new Date("2026-09-15"),
    updatedAt: new Date("2026-09-19"),
    expiresAt: new Date("2027-09-15"),
    sources: [
      {
        label: "央行公告〔2024〕第 11 号：完善房贷利率定价机制",
        href: "https://www.gov.cn/yaowen/liebiao/202410/content_6982871.htm",
      },
      { label: "中国人民银行", href: "http://www.pbc.gov.cn/" },
    ],
    relatedArticles: ["equal-installment-vs-equal-principal"],
    author: "计算器大全编辑团队",
    keywords: ["存量房贷", "房贷利率调整", "转按揭", "加点调整"],
    faq: [
      {
        q: "我的房贷是 2020 年办的，能调整吗？",
        a: "只要当时 LPR 加点 > 0（多数地区为 0），均可申请调整；固定利率需先转为 LPR 浮动。",
      },
      {
        q: "调整后能省多少？",
        a: "加点高于全国新发放房贷平均加点 +30BP 时可申请下调（2024 年 11 月 1 日起常态化机制），具体节省幅度取决于原加点与下调后加点之差。",
      },
      {
        q: "调整生效时间？",
        a: "2024 年 10 月 25 日已完成首轮批量调整，此后按常态化机制随时向贷款银行申请调整。",
      },
      {
        q: "调整后还能不能提前还款？",
        a: "可以，且更划算（利息降低后提前还款回收期延长）。",
      },
    ],
    readingTime: 6,
  },
  {
    slug: "personal-pension-fully-implemented",
    title: "个人养老金账户全面落地：开户、缴费、抵税、领取全流程",
    description:
      "人社部等五部门联合通知：个人养老金制度在全国全面实施。本文详解开户流程、缴费上限（12000 元/年）、税收抵扣计算与领取规则。",
    category: "finance",
    type: "blog",
    tools: ["/finance/pension-cn/", "/finance/income-tax-cn/"],
    publishedAt: new Date("2026-09-12"),
    updatedAt: new Date("2026-09-19"),
    expiresAt: new Date("2027-06-30"),
    sources: [
      {
        label:
          "人社部等五部门：全面实施个人养老金制度通知（人社部发〔2024〕87 号）",
        href: "https://www.gov.cn/zhengce/zhengceku/202412/content_6992279.htm",
      },
    ],
    relatedArticles: [
      "social-insurance-explained",
      "personal-income-tax-deductions-2026",
    ],
    author: "计算器大全编辑团队",
    keywords: ["个人养老金 2026", "个人养老金税收优惠", "个人养老金开户"],
    faq: [
      {
        q: "个人养老金账户能在哪家银行开？",
        a: "23 家商业银行均可；建议优先选择免年费、基金产品丰富的银行。基金销售机构已扩容至 50 余家（含券商、独立销售机构）。",
      },
      {
        q: "缴费 12000 元能抵多少税？",
        a: "在综合所得或经营所得中据实扣除；按 20% 税率计算可省 2400 元/年。",
      },
      {
        q: "什么时候可以领取？",
        a: "达到领取条件（退休、出国定居、完全丧失劳动能力等）即可；提前领取有税收惩罚。",
      },
      {
        q: "领取时如何计税？",
        a: "单独计税，税率 3%（不并入综合所得）。",
      },
    ],
    readingTime: 7,
  },
  {
    slug: "cross-border-ecommerce-export-tax-2026",
    title: "跨境电商出口免税政策实务（2026）：小规模免税与综试区无票免税",
    description:
      "基于现行增值税法与财政部 税务总局公告 2026 年第 10 号：小规模纳税人月 10 万/季 30 万以下免税；132 个综试区无票免税政策。",
    category: "investment",
    type: "blog",
    tools: [
      "/investment/cross-border-profit-cn/",
      "/investment/amazon-fba-cn/",
    ],
    publishedAt: new Date("2026-09-10"),
    updatedAt: new Date("2026-09-19"),
    expiresAt: new Date("2027-06-30"),
    sources: [
      {
        label: "财政部 税务总局公告 2026 年第 10 号（增值税优惠政策衔接）",
        href: "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5247434/content.html",
      },
      {
        label: "财税〔2018〕103 号：综试区无票免税",
        href: "https://www.mof.gov.cn/gkml/caizhengwengao/wg2018/wg201811/201903/t20190301_3180503.htm",
      },
    ],
    relatedArticles: [],
    author: "计算器大全编辑团队",
    keywords: [
      "跨境电商免税",
      "小规模纳税人免税额度",
      "综试区无票免税",
      "9610 9710 9810",
    ],
    faq: [
      {
        q: "小规模纳税人出口免税额度怎么算？",
        a: "月销售额 10 万元（季度 30 万元）及以下免征增值税；超过则需全额计税（属起征点概念，非超额部分免征）。",
      },
      {
        q: "什么是综试区「无票免税」？",
        a: "在跨境电商综合试验区内，符合条件的出口企业无法取得进项发票的货物，可实行核定征收企业所得税并免征增值税（无需进项发票即可免税出口），依据财税〔2018〕103 号。",
      },
      {
        q: "9610、9710、9810 是什么意思？",
        a: "均为跨境电商海关监管代码：9610 为 B2C 直接出口（清单核放、汇总申报）；9710 为 B2B 直接出口；9810 为出口海外仓。",
      },
    ],
    readingTime: 6,
  },
] as ArticleData[];

/** 同步读取文章 Markdown body（用于路由 Content 渲染替代） */
export function loadArticleBody(slug: string): string {
  try {
    return readFileSync(
      join(process.cwd(), "src/content/articles", `${slug}.md`),
      "utf-8",
    );
  } catch {
    return "";
  }
}
