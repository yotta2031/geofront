import { eq, and, desc, count, ilike } from "drizzle-orm";
import { db } from "../../db/index.js";
import { aiTasks } from "../../db/schema.js";

export interface CreateAiTaskInput {
  name: string;
  articleTypeId?: number;
  keywordId?: number;
  imageTypeId?: number;
  imageCount?: number;
  intervalTime?: number;
  maxCount?: number;
  maxErrorCount?: number;
}

export interface UpdateAiTaskInput {
  name?: string;
  articleTypeId?: number;
  keywordId?: number;
  imageTypeId?: number;
  imageCount?: number;
  intervalTime?: number;
  maxCount?: number;
  maxErrorCount?: number;
  status?: string;
  message?: string;
  errorCount?: number;
}

/** 创建 AI 写作任务 */
export async function createAiTask(
  userId: number,
  data: CreateAiTaskInput,
) {
  const [row] = await db
    .insert(aiTasks)
    .values({
      userId,
      name: data.name,
      articleTypeId: data.articleTypeId || null,
      keywordId: data.keywordId || null,
      imageTypeId: data.imageTypeId || null,
      imageCount: data.imageCount || 0,
      intervalTime: data.intervalTime || 0,
      maxCount: data.maxCount || 10,
      maxErrorCount: data.maxErrorCount || 3,
      status: "pending",
    })
    .returning();
  return row;
}

/** 更新 AI 写作任务 */
export async function updateAiTask(
  userId: number,
  id: number,
  data: UpdateAiTaskInput,
) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.articleTypeId !== undefined) updateData.articleTypeId = data.articleTypeId || null;
  if (data.keywordId !== undefined) updateData.keywordId = data.keywordId || null;
  if (data.imageTypeId !== undefined) updateData.imageTypeId = data.imageTypeId || null;
  if (data.imageCount !== undefined) updateData.imageCount = data.imageCount;
  if (data.intervalTime !== undefined) updateData.intervalTime = data.intervalTime;
  if (data.maxCount !== undefined) updateData.maxCount = data.maxCount;
  if (data.maxErrorCount !== undefined) updateData.maxErrorCount = data.maxErrorCount;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.message !== undefined) updateData.message = data.message;
  if (data.errorCount !== undefined) updateData.errorCount = data.errorCount;
  updateData.updatedAt = new Date();

  const [row] = await db
    .update(aiTasks)
    .set(updateData)
    .where(and(eq(aiTasks.id, id), eq(aiTasks.userId, userId)))
    .returning();
  return row;
}

/** 分页查询 AI 写作任务列表 */
export async function listAiTasks(
  userId: number,
  page = 1,
  pageSize = 10,
  search?: string,
) {
  const offset = (page - 1) * pageSize;

  const whereClause = search
    ? and(eq(aiTasks.userId, userId), ilike(aiTasks.name, `%${search}%`))
    : eq(aiTasks.userId, userId);

  const [{ total }] = await db
    .select({ total: count() })
    .from(aiTasks)
    .where(whereClause);

  const list = await db
    .select()
    .from(aiTasks)
    .where(whereClause)
    .orderBy(desc(aiTasks.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { list, total: Number(total) };
}

/** 查询单个 AI 写作任务 */
export async function getAiTask(userId: number, id: number) {
  const [row] = await db
    .select()
    .from(aiTasks)
    .where(and(eq(aiTasks.id, id), eq(aiTasks.userId, userId)));
  return row;
}

/** 删除 AI 写作任务 */
export async function deleteAiTask(userId: number, id: number) {
  const [row] = await db
    .delete(aiTasks)
    .where(and(eq(aiTasks.id, id), eq(aiTasks.userId, userId)))
    .returning();
  return row;
}

/** 执行任务（更新状态为 running） */
export async function runAiTask(userId: number, id: number) {
  const [row] = await db
    .update(aiTasks)
    .set({
      status: "running",
      message: "任务开始执行",
      errorCount: 0,
      updatedAt: new Date(),
    })
    .where(and(eq(aiTasks.id, id), eq(aiTasks.userId, userId)))
    .returning();
  return row;
}