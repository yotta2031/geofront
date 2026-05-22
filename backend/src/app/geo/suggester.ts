/** 建议生成器 - 对应规格 backend/app/geo/suggester.py */

export function generateSuggestions(metrics: {
  mentionRate: number;
  competitorRate: number;
  selfRate: number;
  brand: string;
}): string[] {
  const tips: string[] = [];

  if (metrics.mentionRate < 20) {
    tips.push("增加权威媒体曝光，提升品牌在 AI 回答中的提及率");
  }
  if (metrics.competitorRate > metrics.selfRate) {
    tips.push("强化差异化品牌叙事，突出相对竞品的核心优势");
  }
  if (metrics.mentionRate < 50) {
    tips.push(`围绕「${metrics.brand}」布局更多行业问答型内容`);
  }
  if (tips.length === 0) {
    tips.push("保持现有内容策略，持续监测各模型平台表现");
  }

  return tips;
}
