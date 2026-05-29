import { eq, and, desc, count, ilike } from "drizzle-orm";
import { db } from "../../db/index.js";
import { articles } from "../../db/schema.js";

export interface CreateArticleInput {
  title: string;
  content?: string;
  summary?: string;
  images?: string;
  taskId?: number;
  status?: string;
  publishPlatforms?: string;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  summary?: string;
  images?: string;
  status?: string;
  publishPlatforms?: string;
}

/** 创建文章 */
export async function createArticle(
  userId: number,
  data: CreateArticleInput,
) {
  const [row] = await db
    .insert(articles)
    .values({
      userId,
      title: data.title,
      content: data.content || null,
      summary: data.summary || null,
      images: data.images || null,
      taskId: data.taskId || null,
      status: data.status || "draft",
      publishPlatforms: data.publishPlatforms || null,
    })
    .returning();
  return row;
}

/** 更新文章 */
export async function updateArticle(
  userId: number,
  id: number,
  data: UpdateArticleInput,
) {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content || null;
  if (data.summary !== undefined) updateData.summary = data.summary || null;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.publishPlatforms !== undefined) updateData.publishPlatforms = data.publishPlatforms;
  updateData.updatedAt = new Date();

  const [row] = await db
    .update(articles)
    .set(updateData)
    .where(and(eq(articles.id, id), eq(articles.userId, userId)))
    .returning();
  return row;
}

/** 分页查询文章列表 */
export async function listArticles(
  userId: number,
  page = 1,
  pageSize = 10,
  keyword?: string,
) {
  const offset = (page - 1) * pageSize;

  const whereClause = keyword
    ? and(eq(articles.userId, userId), ilike(articles.title, `%${keyword}%`))
    : eq(articles.userId, userId);

  const [{ total }] = await db
    .select({ total: count() })
    .from(articles)
    .where(whereClause);

  const list = await db
    .select()
    .from(articles)
    .where(whereClause)
    .orderBy(desc(articles.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { list, total: Number(total) };
}

/** 查询单个文章 */
export async function getArticle(userId: number, id: number) {
  const [row] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, id), eq(articles.userId, userId)));
  return row;
}

/** 删除文章 */
export async function deleteArticle(userId: number, id: number) {
  const [row] = await db
    .delete(articles)
    .where(and(eq(articles.id, id), eq(articles.userId, userId)))
    .returning();
  return row;
}