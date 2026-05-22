import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  sitePublishRecords,
  sitePublishTasks,
  siteWebsites,
} from "../../db/schema.js";

const CMS_TYPES = ["WordPress", "帝国CMS", "易优CMS", "织梦CMS", "自定义API", "其他"];

export async function listWebsites(userId: number, params: { page?: number; pageSize?: number }) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;
  const where = eq(siteWebsites.userId, userId);

  const [{ value: total }] = await db.select({ value: count() }).from(siteWebsites).where(where);

  const list = await db
    .select()
    .from(siteWebsites)
    .where(where)
    .orderBy(desc(siteWebsites.id))
    .limit(pageSize)
    .offset(offset);

  return { list, total, page, pageSize, cmsTypes: CMS_TYPES };
}

export async function createWebsite(
  userId: number,
  data: {
    siteName: string;
    siteUrl: string;
    cmsType?: string;
    apiEndpoint?: string;
    apiKey?: string;
    sitemapUrl?: string;
    maxDailyPublish?: number;
    remark?: string;
  }
) {
  if (!CMS_TYPES.includes(data.cmsType || "WordPress")) {
    throw new Error("不支持的 CMS 类型");
  }
  const [row] = await db
    .insert(siteWebsites)
    .values({
      userId,
      siteName: data.siteName,
      siteUrl: data.siteUrl,
      cmsType: data.cmsType || "WordPress",
      apiEndpoint: data.apiEndpoint,
      apiKey: data.apiKey,
      sitemapUrl: data.sitemapUrl,
      maxDailyPublish: data.maxDailyPublish ?? 5,
      remark: data.remark,
      publishEnabled: true,
      connectStatus: "connected",
      seoScore: 0,
    })
    .returning();
  return row;
}

export async function updateWebsite(
  userId: number,
  id: number,
  data: Partial<{
    siteName: string;
    siteUrl: string;
    cmsType: string;
    apiEndpoint: string;
    apiKey: string;
    sitemapUrl: string;
    maxDailyPublish: number;
    publishEnabled: boolean;
    connectStatus: string;
    seoScore: number;
    remark: string;
  }>
) {
  const [row] = await db
    .update(siteWebsites)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(siteWebsites.id, id), eq(siteWebsites.userId, userId)))
    .returning();
  return row;
}

export async function deleteWebsites(userId: number, ids: number[]) {
  if (!ids.length) return;
  await db
    .delete(siteWebsites)
    .where(and(eq(siteWebsites.userId, userId), inArray(siteWebsites.id, ids)));
}

export async function togglePublishEnabled(userId: number, id: number, enabled: boolean) {
  return updateWebsite(userId, id, { publishEnabled: enabled });
}

export async function testConnection(userId: number, id: number) {
  const [site] = await db
    .select()
    .from(siteWebsites)
    .where(and(eq(siteWebsites.id, id), eq(siteWebsites.userId, userId)))
    .limit(1);
  if (!site) throw new Error("站点不存在");
  if (!site.apiEndpoint?.trim()) {
    await updateWebsite(userId, id, { connectStatus: "pending" });
    return { ok: false, msg: "请先配置 API 接口地址" };
  }
  await updateWebsite(userId, id, { connectStatus: "connected" });
  return { ok: true, msg: "连接测试成功" };
}

export async function createPublishTask(
  userId: number,
  data: {
    name: string;
    articleIds: number[];
    siteIds: number[];
    publishType?: string;
    scheduledAt?: string;
  }
) {
  const totalCount = data.articleIds.length * data.siteIds.length;
  const [task] = await db
    .insert(sitePublishTasks)
    .values({
      userId,
      name: data.name,
      articleIds: data.articleIds,
      siteIds: data.siteIds,
      publishType: data.publishType || "immediate",
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      status: "pending",
      totalCount,
    })
    .returning();

  const sites = await db
    .select()
    .from(siteWebsites)
    .where(and(eq(siteWebsites.userId, userId), inArray(siteWebsites.id, data.siteIds)));

  const siteMap = new Map(sites.map((s) => [s.id, s]));
  for (const articleId of data.articleIds) {
    for (const siteId of data.siteIds) {
      const site = siteMap.get(siteId);
      if (!site) continue;
      await db.insert(sitePublishRecords).values({
        userId,
        siteId,
        articleId,
        taskId: task.id,
        title: `文章#${articleId}`,
        siteName: site.siteName,
        siteUrl: site.siteUrl,
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
  const where = eq(sitePublishTasks.userId, userId);

  const [{ value: total }] = await db.select({ value: count() }).from(sitePublishTasks).where(where);

  const list = await db
    .select()
    .from(sitePublishTasks)
    .where(where)
    .orderBy(desc(sitePublishTasks.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { list, total, page, pageSize };
}

export async function listPublishRecords(
  userId: number,
  params: { page?: number; pageSize?: number; status?: string; siteId?: number }
) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const conditions = [eq(sitePublishRecords.userId, userId)];
  if (params.status) conditions.push(eq(sitePublishRecords.status, params.status));
  if (params.siteId) conditions.push(eq(sitePublishRecords.siteId, params.siteId));
  const where = and(...conditions);

  const [{ value: total }] = await db.select({ value: count() }).from(sitePublishRecords).where(where);

  const list = await db
    .select()
    .from(sitePublishRecords)
    .where(where)
    .orderBy(desc(sitePublishRecords.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { list, total, page, pageSize };
}

export async function publishToSite(
  userId: number,
  data: {
    articleIds: number[];
    siteIds: number[];
    publishType?: string;
    scheduledAt?: string;
  }
) {
  const name = `官网SEO发布-${new Date().toISOString().slice(0, 10)}`;
  return createPublishTask(userId, {
    name,
    articleIds: data.articleIds,
    siteIds: data.siteIds,
    publishType: data.publishType,
    scheduledAt: data.scheduledAt,
  });
}
