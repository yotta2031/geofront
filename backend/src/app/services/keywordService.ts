import { eq, and, desc, count, ilike } from "drizzle-orm";
import { db } from "../../db/index.js";
import { keywords } from "../../db/schema.js";
import type { CreateKeywordInput, UpdateKeywordInput } from "../schemas/keyword.js";

/** 创建关键词 */
export async function createKeyword(
  userId: number,
  data: CreateKeywordInput,
) {
  const [row] = await db
    .insert(keywords)
    .values({
      userId,
      keyword: data.keyword,
      hitWord: data.hitWord || null,
      preKeywords: data.preKeywords || null,
      nextKeywords: data.nextKeywords || null,
      type: data.type,
      status: 1,
    })
    .returning();
  return row;
}

/** 更新关键词 */
export async function updateKeyword(
  userId: number,
  id: number,
  data: Omit<UpdateKeywordInput, "id">,
) {
  const [row] = await db
    .update(keywords)
    .set({
      keyword: data.keyword,
      hitWord: data.hitWord || null,
      preKeywords: data.preKeywords || null,
      nextKeywords: data.nextKeywords || null,
      type: data.type,
    })
    .where(and(eq(keywords.id, id), eq(keywords.userId, userId)))
    .returning();
  return row;
}

/** 分页查询关键词列表 */
export async function listKeywords(
  userId: number,
  page = 1,
  pageSize = 10,
  search?: string,
) {
  const offset = (page - 1) * pageSize;

  const whereClause = search
    ? and(eq(keywords.userId, userId), ilike(keywords.keyword, `%${search}%`))
    : eq(keywords.userId, userId);

  const [{ total }] = await db
    .select({ total: count() })
    .from(keywords)
    .where(whereClause);

  const list = await db
    .select()
    .from(keywords)
    .where(whereClause)
    .orderBy(desc(keywords.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { list, total: Number(total) };
}

/** 查询单个关键词 */
export async function getKeyword(userId: number, id: number) {
  const [row] = await db
    .select()
    .from(keywords)
    .where(and(eq(keywords.id, id), eq(keywords.userId, userId)));
  return row;
}

/** 删除关键词 */
export async function deleteKeyword(userId: number, id: number) {
  const [row] = await db
    .delete(keywords)
    .where(and(eq(keywords.id, id), eq(keywords.userId, userId)))
    .returning();
  return row;
}

/**
 * 手动拓词 — 根据规则对关键词进行前缀/后缀/组合匹配
 * 从数据库已有关键词中根据规则匹配相关词
 */
export async function manualExpand(
  userId: number,
  keyword: string,
  rule: "prefix" | "suffix" | "combine",
) {
  // 先从已有关键词中根据规则搜索匹配的词
  let pattern = "";
  switch (rule) {
    case "prefix":
      // 以 keyword 开头的其他关键词
      pattern = `${keyword}%`;
      break;
    case "suffix":
      // 以 keyword 结尾的关键词
      pattern = `%${keyword}`;
      break;
    case "combine":
      // 包含 keyword 的关键词
      pattern = `%${keyword}%`;
      break;
  }

  const rows = await db
    .select()
    .from(keywords)
    .where(
      and(
        eq(keywords.userId, userId),
        ilike(keywords.keyword, pattern),
      ),
    )
    .limit(50);

  // 计算每个词的相关度（简单算法：匹配长度比例）
  const words = rows
    .filter((r) => r.keyword !== keyword) // 排除自身
    .map((r) => ({
      word: r.keyword,
      relevance: Math.min(
        100,
        Math.round((keyword.length / r.keyword.length) * 100),
      ),
    }))
    .sort((a, b) => b.relevance - a.relevance);

  return words;
}
