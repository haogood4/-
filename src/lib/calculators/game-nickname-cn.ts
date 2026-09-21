// src/lib/calculators/game-nickname-cn.ts — 游戏昵称生成（纯函数）
// 词库内置：4 类 × 16 个共 64 个昵称，体量小且需即时随机抽取，无需外置 JSON。

export type NickCategory = "古风雅致" | "炫酷霸气" | "可爱软萌" | "沙雕搞笑";

export const NICK_CATEGORIES: readonly NickCategory[] = [
  "古风雅致",
  "炫酷霸气",
  "可爱软萌",
  "沙雕搞笑",
];

export const NICK_NAMES: Record<NickCategory, readonly string[]> = {
  古风雅致: [
    "月下听松",
    "青衫烟雨",
    "半盏流年",
    "一苇渡江",
    "竹里馆主",
    "墨染青衣",
    "松风煮茗",
    "山月不知",
    "归鹤晚亭",
    "云深不知处",
    "拾阶听雪",
    "灯火阑珊客",
    "枕水而眠",
    "白鹭忘机",
    "疏影横斜",
    "折月煮酒",
  ],
  炫酷霸气: [
    "夜刃无双",
    "暗影行者",
    "孤狼啸月",
    "零度战神",
    "破晓之刃",
    "极夜猎手",
    "雷霆裁决",
    "不灭狂雷",
    "荒野裁决者",
    "深渊凝视者",
    "弑神之锋",
    "冰封王座",
    "疾风之影",
    "湮灭回响",
    "无畏锋芒",
    "永夜君王",
  ],
  可爱软萌: [
    "奶糖小圆",
    "软乎乎莓莓",
    "团子打滚",
    "布丁摇晃中",
    "小熊软糖",
    "糯米团子",
    "咕咕鸡",
    "桃桃乌龙",
    "云朵棉花糖",
    "乖乖兔几",
    "甜筒融化啦",
    "揣手手",
    "呼噜噜",
    "蹭蹭怪",
    "小饼干",
    "软糖猫爪",
  ],
  沙雕搞笑: [
    "键盘侠本侠",
    "起名困难户",
    "一桨拍死你",
    "蹲坑战神",
    "咸鱼翻身失败",
    "别催在写了",
    "隔壁老王家的猫",
    "网抑云用户",
    "早八遇难者",
    "头铁县第一铁头",
    "一顿操作猛如虎",
    "队友殡仪馆",
    "干饭第一名",
    "摆烂锦标赛冠军",
    "拖延症晚期",
    "路痴导航仪",
  ],
};

function poolFor(category: string): readonly string[] | undefined {
  if (category === "随机" || category === "") {
    return Object.values(NICK_NAMES).flat();
  }
  for (const [key, names] of Object.entries(NICK_NAMES)) {
    if (key === category) return names;
  }
  return undefined;
}

/**
 * 随机抽取不重复昵称。
 * @param category 分类名；「随机」或空串混合全部词库
 * @param n        抽取数量；超过词库大小时返回全库（已随机打乱）
 * @param rand     [0,1) 随机源，默认 Math.random；注入便于测试
 * @throws 分类不存在或 n 非正整数时抛错
 */
export function pickNames(
  category: string,
  n: number,
  rand: () => number = Math.random,
): string[] {
  const pool = poolFor(category);
  if (!pool) {
    throw new Error(`未知昵称分类：${category}`);
  }
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("生成数量需为正整数");
  }
  const count = Math.min(n, pool.length);
  // Fisher-Yates 洗牌后取前 count 个，保证不重复
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr.slice(0, count);
}
