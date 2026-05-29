import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  weixinAccounts,
  weixinDeviceAuth,
  weixinPublishRecords,
  weixinPublishTasks,
} from "../../db/schema.js";

const PLATFORMS = ["头条号", "搜狐", "小红书", "公众号", "知乎", "抖音", "微博", "百家号"];

function randomAuthCode() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export async function getDeviceAuthCode(userId: number) {
  const [row] = await db
    .select()
    .from(weixinDeviceAuth)
    .where(eq(weixinDeviceAuth.userId, userId))
    .limit(1);
  if (row) return row.authCode;
  const code = randomAuthCode();
  await db.insert(weixinDeviceAuth).values({ userId, authCode: code });
  return code;
}

export async function refreshDeviceAuthCode(userId: number) {
  const code = randomAuthCode();
  const [existing] = await db
    .select()
    .from(weixinDeviceAuth)
    .where(eq(weixinDeviceAuth.userId, userId))
    .limit(1);
  if (existing) {
    await db
      .update(weixinDeviceAuth)
      .set({ authCode: code, updatedAt: new Date() })
      .where(eq(weixinDeviceAuth.userId, userId));
  } else {
    await db.insert(weixinDeviceAuth).values({ userId, authCode: code });
  }
  return code;
}

export async function listAccounts(userId: number, params: { page?: number; pageSize?: number }) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;
  const where = eq(weixinAccounts.userId, userId);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(weixinAccounts)
    .where(where);

  const list = await db
    .select()
    .from(weixinAccounts)
    .where(where)
    .orderBy(desc(weixinAccounts.id))
    .limit(pageSize)
    .offset(offset);

  return { list, total, page, pageSize, platforms: PLATFORMS };
}

export async function createAccount(
  userId: number,
  data: {
    accountName: string;
    platform: string;
    avatar?: string;
    platformUid?: string;
    fansCount?: number;
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
    .insert(weixinAccounts)
    .values({
      userId,
      accountName: data.accountName,
      platform: data.platform,
      avatar: data.avatar,
      platformUid: data.platformUid,
      fansCount: data.fansCount ?? 0,
      maxDailyPublish: data.maxDailyPublish ?? 5,
      proxyIpPort: data.proxyIpPort,
      proxyAuth: data.proxyAuth,
      remark: data.remark,
      publishEnabled: true,
      authStatus: "authorized",
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
    maxDailyPublish: number;
    proxyIpPort: string;
    proxyAuth: string;
    remark: string;
  }>
) {
  const [row] = await db
    .update(weixinAccounts)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(weixinAccounts.id, id), eq(weixinAccounts.userId, userId)))
    .returning();
  return row;
}

export async function deleteAccounts(userId: number, ids: number[]) {
  if (!ids.length) return;
  await db
    .delete(weixinAccounts)
    .where(and(eq(weixinAccounts.userId, userId), inArray(weixinAccounts.id, ids)));
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
    .insert(weixinPublishTasks)
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
    .from(weixinAccounts)
    .where(
      and(eq(weixinAccounts.userId, userId), inArray(weixinAccounts.id, data.accountIds))
    );

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  for (const articleId of data.articleIds) {
    for (const accountId of data.accountIds) {
      const acc = accountMap.get(accountId);
      if (!acc) continue;
      await db.insert(weixinPublishRecords).values({
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

export async function listPublishTasks(
  userId: number,
  params: { page?: number; pageSize?: number }
) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;
  const where = eq(weixinPublishTasks.userId, userId);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(weixinPublishTasks)
    .where(where);

  const list = await db
    .select()
    .from(weixinPublishTasks)
    .where(where)
    .orderBy(desc(weixinPublishTasks.createdAt))
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

  const conditions = [eq(weixinPublishRecords.userId, userId)];
  if (params.status) conditions.push(eq(weixinPublishRecords.status, params.status));
  if (params.platform) conditions.push(eq(weixinPublishRecords.platform, params.platform));
  const where = and(...conditions);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(weixinPublishRecords)
    .where(where);

  const list = await db
    .select()
    .from(weixinPublishRecords)
    .where(where)
    .orderBy(desc(weixinPublishRecords.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { list, total, page, pageSize };
}

export async function publishToWeixin(
  userId: number,
  data: {
    articleIds: number[];
    accountIds: number[];
    publishType?: string;
    scheduledAt?: string;
  }
) {
  const name = `自媒体发布-${new Date().toISOString().slice(0, 10)}`;
  return createPublishTask(userId, {
    name,
    articleIds: data.articleIds,
    accountIds: data.accountIds,
    publishType: data.publishType,
    scheduledAt: data.scheduledAt,
  });
}
