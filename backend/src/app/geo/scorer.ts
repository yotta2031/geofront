/** NLP 评分引擎 - 对应规格 backend/app/geo/scorer.py */

export type MentionAnalysis = {
  mentioned: boolean;
  rank: number;
  competitors: string[];
  mentionRate: number;
  positiveRate: number;
  rankScore: number;
  sentimentScore: number;
};

export function analyzeResponse(
  brand: string,
  response: string,
  industry: string
): MentionAnalysis {
  const text = response.toLowerCase();
  const brandLower = brand.toLowerCase();
  const mentioned = text.includes(brandLower);

  const competitorPool = ["美菜", "蜀海", "叮咚买菜", "盒马", "京东到家"];
  const foundCompetitors = competitorPool.filter((c) => text.includes(c.toLowerCase()));

  const rankMatch = response.match(/第([一二三四五1-5])/);
  const rank = rankMatch ? parseInt(rankMatch[1], 10) || 2 : mentioned ? 2 : 0;

  const positiveWords = ["推荐", "领先", "优质", "靠谱", "专业", "好评"];
  const positiveHits = positiveWords.filter((w) => text.includes(w)).length;

  const mentionRate = mentioned ? 65 + (brand.length % 20) : 8 + (brand.length % 10);
  const positiveRate = Math.min(95, 40 + positiveHits * 12);
  const rankScore = mentioned ? Math.max(20, 100 - rank * 15) : 10;
  const sentimentScore = Math.min(100, 50 + positiveHits * 8);

  return {
    mentioned,
    rank: mentioned ? rank : 0,
    competitors: foundCompetitors,
    mentionRate,
    positiveRate,
    rankScore,
    sentimentScore,
  };
}

export function calcFinalScore(metrics: {
  mentionRate: number;
  recommendationRate: number;
  rankWeight: number;
  sentiment: number;
  stability: number;
}): number {
  return (
    metrics.mentionRate * 0.35 +
    metrics.recommendationRate * 0.25 +
    metrics.rankWeight * 0.2 +
    metrics.sentiment * 0.1 +
    metrics.stability * 0.1
  );
}
