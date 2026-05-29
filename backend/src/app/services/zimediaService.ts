import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  zimediaAccounts,
  zimediaPublishRecords,
  zimediaPublishTasks,
} from "../../db/schema.js";

const PLATFORMS = ["头条号", "搜狐", "小红书", "公众号", "知乎", "抖音", "微博", "百家号", "B站"];
const CATEGORIES = ["教育", "科技", "美妆", "财经", "生活", "母婴", "汽车", "其他"];

export async function listAccounts(userId: number, params: { page?: number; pageSize?: number }) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;
  const where = eq(zimediaAccounts.userId, userId);

  const [{ value: total }] = await db.select({ value: count() }).from(zimediaAccounts).where(where);

  const list = await db
    .select()
    .from(zimediaAccounts)
    .where(where)
    .orderBy(desc(zimediaAccounts.id))
    .limit(pageSize)
    .offset(offset);

  return { list, total, page, pageSize, platforms: PLATFORMS, categories: CATEGORIES };
}

export async function createAccount(
  userId: number,
  data: {
    accountName: string;
    platform: string;
    avatar?: string;
    fansCount?: number;
    category?: string;
    quotePrice?: number;
    maxDailyPublish?: number;
    proxyIpPort?: string;
    proxyAuth?: string;
    remark?: string;
  }
) {
  if (!PLATFORMS.includes(data.platform)) {
    throw new Error("不支持的自媒体平台");
  }
  const [row] = await db
    .insert(zimediaAccounts)
    .values({
      userId,
      accountName: data.accountName,
      platform: data.platform,
      avatar: data.avatar,
      fansCount: data.fansCount ?? 0,
      category: data.category || "其他",
      quotePrice: data.quotePrice ?? 0,
      maxDailyPublish: data.maxDailyPublish ?? 5,
      proxyIpPort: data.proxyIpPort,
      proxyAuth: data.proxyAuth,
      remark: data.remark,
      publishEnabled: true,
      coopStatus: "active",
    })
    .returning();
  return row;
}

export async function updateAccount(
  userId: number,
  id: number,
  data: Partial<{
    accountName: string;
    platform: string;
    avatar: string;
    publishEnabled: boolean;
    fansCount: number;
    category: string;
    quotePrice: number;
    maxDailyPublish: number;
    proxyIpPort: string;
    proxyAuth: string;
    remark: string;
    coopStatus: string;
  }>
) {
  const [row] = await db
    .update(zimediaAccounts)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(zimediaAccounts.id, id), eq(zimediaAccounts.userId, userId)))
    .returning();
  return row;
}

export async function deleteAccounts(userId: number, ids: number[]) {
  if (!ids.length) return;
  await db
    .delete(zimediaAccounts)
    .where(and(eq(zimediaAccounts.userId, userId), inArray(zimediaAccounts.id, ids)));
}

export async function togglePublishEnabled(userId: number, id: number, enabled: boolean) {
  return updateAccount(userId, id, { publishEnabled: enabled });
}

export async function createPublishTask(
  userId: number,
  data: {
    name: string;
    articleIds: number[];
    accountIds: number[];
    publishType?: string;
    scheduledAt?: string;
  }
) {
  const totalCount = data.articleIds.length * data.accountIds.length;
  const [task] = await db
    .insert(zimediaPublishTasks)
    .values({
      userId,
      name: data.name,
      articleIds: data.articleIds,
      accountIds: data.accountIds,
      publishType: data.publishType || "immediate",
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      status: "pending",
      totalCount,
    })
    .returning();

  const accounts = await db
    .select()
    .from(zimediaAccounts)
    .where(and(eq(zimediaAccounts.userId, userId), inArray(zimediaAccounts.id, data.accountIds)));

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  for (const articleId of data.articleIds) {
    for (const accountId of data.accountIds) {
      const acc = accountMap.get(accountId);
      if (!acc) continue;
      await db.insert(zimediaPublishRecords).values({
        userId,
        accountId,
        articleId,
        taskId: task.id,
        title: `文章#${articleId}`,
        platform: acc.platform,
        accountName: acc.accountName,
        status: "pending",
      });
    }
  }

  return task;
}

export async function listPublishTasks(userId: number, params: { page?: number; pageSize?: number }) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;
  const where = eq(zimediaPublishTasks.userId, userId);

  const [{ value: total }] = await db.select({ value: count() }).from(zimediaPublishTasks).where(where);

  const list = await db
    .select()
    .from(zimediaPublishTasks)
    .where(where)
    .orderBy(desc(zimediaPublishTasks.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { list, total, page, pageSize };
}

export async function listPublishRecords(
  userId: number,
  params: { page?: number; pageSize?: number; status?: string; platform?: string }
) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const conditions = [eq(zimediaPublishRecords.userId, userId)];
  if (params.status) conditions.push(eq(zimediaPublishRecords.status, params.status));
  if (params.platform) conditions.push(eq(zimediaPublishRecords.platform, params.platform));
  const where = and(...conditions);

  const [{ value: total }] = await db.select({ value: count() }).from(zimediaPublishRecords).where(where);

  const list = await db
    .select()
    .from(zimediaPublishRecords)
    .where(where)
    .orderBy(desc(zimediaPublishRecords.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { list, total, page, pageSize };
}

export async function publishToZimedia(
  userId: number,
  data: {
    articleIds: number[];
    accountIds: number[];
    publishType?: string;
    scheduledAt?: string;
  }
) {
  const name = `大V发布-${new Date().toISOString().slice(0, 10)}`;
  return createPublishTask(userId, {
    name,
    articleIds: data.articleIds,
    accountIds: data.accountIds,
    publishType: data.publishType,
    scheduledAt: data.scheduledAt,
  });
}
