/** 报告生成 - Jinja2 风格 HTML 模板（TS 实现） */

export function generateReportHtml(data: {
  brand: string;
  industry: string;
  score: number;
  providers: Array<{
    name: string;
    mentionRate: number;
    positiveRate: number;
    rankScore: number;
  }>;
  competitors: Array<{ name: string; score: number }>;
  suggestions: string[];
}): string {
  const providerRows = data.providers
    .map(
      (p) =>
        `<tr><td>${p.name}</td><td>${p.mentionRate.toFixed(1)}%</td><td>${p.positiveRate.toFixed(1)}%</td><td>${p.rankScore.toFixed(1)}</td></tr>`
    )
    .join("");

  const competitorBars = data.competitors
    .map(
      (c) =>
        `<div class="bar"><span>${c.name}</span><div style="width:${c.score}%"></div></div>`
    )
    .join("");

  const suggestionCards = data.suggestions
    .map((s) => `<div class="card">${s}</div>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>${data.brand} GEO 诊断报告</title>
  <style>
    body{font-family:system-ui,sans-serif;padding:24px;background:#f6f6f6;color:#333}
    .section{background:#fff;border-radius:12px;padding:20px;margin-bottom:16px}
    h1{color:#4b17d3} table{width:100%;border-collapse:collapse}
    td,th{border:1px solid #eee;padding:8px} .score{font-size:48px;color:#4b17d3}
    .card{background:#f0f2ff;padding:12px;border-radius:8px;margin:8px 0}
    .bar{display:flex;align-items:center;gap:8px;margin:6px 0}
    .bar div{height:8px;background:linear-gradient(90deg,#4b17d3,#8b5fff);border-radius:4px}
  </style>
</head>
<body>
  <h1>${data.brand} · GEO 智能诊断报告</h1>
  <div class="section">
    <h2>概览</h2>
    <p>行业：${data.industry}</p>
    <p class="score">综合评分 ${data.score.toFixed(1)}</p>
  </div>
  <div class="section"><h2>各模型表现</h2><table><tr><th>平台</th><th>提及率</th><th>正面率</th><th>排名分</th></tr>${providerRows}</table></div>
  <div class="section"><h2>竞品对比</h2>${competitorBars}</div>
  <div class="section"><h2>优化建议</h2>${suggestionCards}</div>
</body>
</html>`;
}
