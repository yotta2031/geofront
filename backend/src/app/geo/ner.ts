/** NER 识别 - 对应规格 bge-m3 能力的轻量实现 */

export function extractEntities(text: string, brand: string) {
  const competitors = ["美菜", "蜀海", "叮咚", "盒马", "京东到家"].filter((c) =>
    text.includes(c)
  );
  return {
    brand,
    competitors,
    industryTerms: text.match(/B2B|供应链|生鲜|零售|配送/g) || [],
    sceneTerms: text.match(/推荐|对比|选型|口碑/g) || [],
  };
}
