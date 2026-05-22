/** Query Generator - 对应规格 backend/app/geo/query_generator.py */

const INTENT_TEMPLATES: Record<string, string[]> = {
  recommendation: [
    "{industry}平台推荐",
    "{industry}服务商哪家好",
    "靠谱的{industry}供应商推荐",
    "{industry}头部品牌有哪些",
    "华东{industry}企业推荐",
  ],
  comparison: [
    "{brand}和竞品哪个好",
    "{industry}平台对比",
    "{brand}优势是什么",
    "选择{industry}平台要看什么",
    "{brand}行业排名",
  ],
  authority: [
    "{industry}行业标准是什么",
    "{brand}行业口碑如何",
    "权威{industry}榜单",
    "{industry}领军企业",
    "{brand}市场地位",
  ],
  solution: [
    "{industry}解决方案推荐",
    "{brand}能解决什么问题",
    "{industry}数字化方案",
    "如何选型{industry}平台",
    "{brand}服务覆盖范围",
  ],
  trust: [
    "{brand}是否靠谱",
    "{brand}客户评价",
    "{industry}口碑好的品牌",
    "{brand}资质与案例",
    "{industry}值得信赖的平台",
  ],
};

export function generateQueries(input: {
  brand: string;
  industry?: string;
  keywords?: string[];
}): string[] {
  const industry = input.industry || input.keywords?.[0] || "行业";
  const brand = input.brand;
  const queries: string[] = [];

  for (const templates of Object.values(INTENT_TEMPLATES)) {
    for (const tpl of templates) {
      for (let i = 0; i < 4; i++) {
        queries.push(
          tpl.replace(/\{brand\}/g, brand).replace(/\{industry\}/g, industry)
        );
      }
    }
  }

  return [...new Set(queries)].slice(0, 100);
}
