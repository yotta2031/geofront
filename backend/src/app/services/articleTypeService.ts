import { eq, and, desc, count, ilike } from "drizzle-orm";
import { db } from "../../db/index.js";
import { articleTypes } from "../../db/schema.js";

export interface CreateArticleTypeInput {
  name: string;
  description?: string;
}

export interface UpdateArticleTypeInput {
  id: number;
  name?: string;
  description?: string;
  status?: number;
}

/** 创建文章分类 */
export async function createArticleType(
  userId: number,
  data: CreateArticleTypeInput,
) {
  const [row] = await db
    .insert(articleTypes)
    .values({
      userId,
      name: data.name,
      description: data.description || null,
      status: 1,
    })
    .returning();
  return row;
}

/** 更新文章分类 */
export async function updateArticleType(
  userId: number,
  id: number,
  data: Omit<UpdateArticleTypeInput, "id">,
) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.status !== undefined) updateData.status = data.status;

  const [row] = await db
    .update(articleTypes)
    .set(updateData)
    .where(and(eq(articleTypes.id, id), eq(articleTypes.userId, userId)))
    .returning();
  return row;
}

/** 分页查询文章分类列表 */
export async function listArticleTypes(
  userId: number,
  page = 1,
  pageSize = 10,
  search?: string,
) {
  const offset = (page - 1) * pageSize;

  const whereClause = search
    ? and(eq(articleTypes.userId, userId), ilike(articleTypes.name, `%${search}%`))
    : eq(articleTypes.userId, userId);

  const [{ total }] = await db
    .select({ total: count() })
    .from(articleTypes)
    .where(whereClause);

  const list = await db
    .select()
    .from(articleTypes)
    .where(whereClause)
    .orderBy(desc(articleTypes.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { list, total: Number(total) };
}

/** 查询单个文章分类 */
export async function getArticleType(userId: number, id: number) {
  const [row] = await db
    .select()
    .from(articleTypes)
    .where(and(eq(articleTypes.id, id), eq(articleTypes.userId, userId)));
  return row;
}

/** 删除文章分类 */
export async function deleteArticleType(userId: number, id: number) {
  const [row] = await db
    .delete(articleTypes)
    .where(and(eq(articleTypes.id, id), eq(articleTypes.userId, userId)))
    .returning();
  return row;
}