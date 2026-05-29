import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { getProvider } from "../app/llm/providers.js";
import { manualExpand } from "../app/services/keywordService.js";
import { manualExpandSchema } from "../app/schemas/keyword.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const toolRoutes = new Hono<AppEnv>();

/**
 * 关键词指数查询
 * 返回模拟指数（可根据关键词长度、是否有数据等综合计算）
 */
toolRoutes.get("/zhishu", async (c) => {
  const keyword = c.req.query("keyword");
  if (!keyword) {
    return c.json(errorResponse("关键词不能为空"), 400);
  }

  // 简单模拟：基于关键词长度 + 随机因子生成指数 (0~100)
  const baseScore = Math.min(100, keyword.length * 8);
  const randomFactor = Math.floor(Math.random() * 20);
  const index = Math.min(100, baseScore + randomFactor);

  return c.json(successResponse({ keyword, index }));
});

/**
 * AI 拓词 — 使用 LLM 进行关键词扩展
 * 有 LiteLLM 网关时走真实 AI，否则降级为规则匹配
 */
toolRoutes.get("/tuoci", async (c) => {
  const keyword = c.req.query("keyword");
  if (!keyword) {
    return c.json(errorResponse("关键词不能为空"), 400);
  }

  try {
    const provider = getProvider("deepseek");
    const prompt = `请为关键词「${keyword}」进行语义拓词，生成 10 个相关搜索词。
要求：
1. 每个词一行，不要编号
2. 词与关键词语义相关，包括同义词、长尾词、相关问题词
3. 只输出词本身，不要额外说明`;

    const result = await provider.complete(prompt);
    const words = result.text
      .split("\n")
      .map((w) => w.replace(/^[\d\.\-\s]+/, "").trim())
      .filter((w) => w.length > 0 && w.length < 50)
      .slice(0, 10);

    // 如果 AI 返回为空，降级使用数据库已有数据
    if (words.length === 0) {
      const userId = c.get("user").userId;
      const expanded = await manualExpand(userId, keyword, "combine");
      return c.json(successResponse({
        keyword,
        words: expanded.slice(0, 10).map((w) => w.word),
        source: "database",
      }));
    }

    return c.json(successResponse({ keyword, words, source: "ai" }));
  } catch {
    // AI 调用失败，降级处理
    try {
      const userId = c.get("user").userId;
      const expanded = await manualExpand(userId, keyword, "combine");
      return c.json(successResponse({
        keyword,
        words: expanded.slice(0, 10).map((w) => w.word),
        source: "database",
      }));
    } catch (dbErr: any) {
      return c.json(errorResponse(dbErr.message || "拓词失败"), 500);
    }
  }
});

/**
 * 手动拓词 — 基于规则（前缀/后缀/组合）从数据库中匹配
 */
toolRoutes.post("/tuoci/manual", async (c) => {
  const userId = c.get("user").userId;
  const body = await c.req.json();

  const parsed = manualExpandSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse(parsed.error.errors[0]?.message || "参数校验失败"), 400);
  }

  try {
    const { keyword, rule } = parsed.data;
    const words = await manualExpand(userId, keyword, rule);
    return c.json(successResponse({ keyword, rule, words }));
  } catch (err: any) {
    return c.json(errorResponse(err.message || "拓词失败"), 500);
  }
});
