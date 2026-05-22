import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  webMedia,
  webMediaFavorites,
  webMediaFavoriteGroups,
  webMediaPublishTasks,
  webMediaSubmissions,
  users,
} from "../../db/schema.js";

export type MediaListQuery = {
  keyword?: string;
  industry?: string;
  portal?: string;
  region?: string;
  entryLevel?: string;
  indexWeb?: string;
  indexNews?: string;
  linkType?: string;
  publishSpeed?: string;
  specialIndustry?: string;
  weekendPublish?: boolean;
  holidayPublish?: boolean;
  nightPublish?: boolean;
  hasTextLink?: boolean;
  whitelistSource?: boolean;
  hasVideo?: boolean;
  mobileMedia?: boolean;
  longValidity?: boolean;
  geoRankable?: boolean;
  priceSort?: "asc" | "desc";
  groupId?: number;
  page?: number;
  pageSize?: number;
  userId: number;
};

function skipAll(val?: string) {
  return !val || val === "不限";
}

export async function listWebMedia(query: MediaListQuery) {
  const page = Math.max(1, query.page || 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const conditions = [eq(webMedia.status, 1)];

  if (query.keyword?.trim()) {
    conditions.push(ilike(webMedia.name, `%${query.keyword.trim()}%`));
  }
  if (!skipAll(query.industry)) {
    conditions.push(eq(webMedia.industry, query.industry!));
  }
  if (!skipAll(query.portal)) {
    conditions.push(eq(webMedia.portal, query.portal!));
  }
  if (!skipAll(query.region)) {
    conditions.push(eq(webMedia.region, query.region!));
  }
  if (!skipAll(query.entryLevel)) {
    conditions.push(eq(webMedia.entryLevel, query.entryLevel!));
  }
  if (!skipAll(query.indexWeb)) {
    conditions.push(eq(webMedia.indexWeb, query.indexWeb!));
  }
  if (!skipAll(query.indexNews)) {
    conditions.push(eq(webMedia.indexNews, query.indexNews!));
  }
  if (!skipAll(query.linkType)) {
    conditions.push(eq(webMedia.linkType, query.linkType!));
  }
  if (!skipAll(query.publishSpeed)) {
    conditions.push(eq(webMedia.publishSpeed, query.publishSpeed!));
  }
  if (!skipAll(query.specialIndustry)) {
    conditions.push(eq(webMedia.specialIndustry, query.specialIndustry!));
  }
  if (query.weekendPublish) conditions.push(eq(webMedia.weekendPublish, true));
  if (query.holidayPublish) conditions.push(eq(webMedia.holidayPublish, true));
  if (query.nightPublish) conditions.push(eq(webMedia.nightPublish, true));
  if (query.hasTextLink) conditions.push(eq(webMedia.hasTextLink, true));
  if (query.whitelistSource) conditions.push(eq(webMedia.whitelistSource, true));
  if (query.hasVideo) conditions.push(eq(webMedia.hasVideo, true));
  if (query.mobileMedia) conditions.push(eq(webMedia.mobileMedia, true));
  if (query.longValidity) conditions.push(eq(webMedia.longValidity, true));
  if (query.geoRankable) conditions.push(eq(webMedia.geoRankable, true));

  if (query.groupId) {
    const favs = await db
      .select({ mediaId: webMediaFavorites.mediaId })
      .from(webMediaFavorites)
      .where(
        and(
          eq(webMediaFavorites.userId, query.userId),
          eq(webMediaFavorites.groupId, query.groupId)
        )
      );
    const ids = favs.map((f) => f.mediaId);
    if (ids.length === 0) {
      return { list: [], total: 0, page, pageSize };
    }
    conditions.push(inArray(webMedia.id, ids));
  }

  const where = and(...conditions);
  const orderBy =
    query.priceSort === "asc"
      ? asc(webMedia.price)
      : query.priceSort === "desc"
        ? desc(webMedia.price)
        : desc(webMedia.sortOrder);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(webMedia)
    .where(where);

  const rows = await db
    .select()
    .from(webMedia)
    .where(where)
    .orderBy(orderBy, desc(webMedia.id))
    .limit(pageSize)
    .offset(offset);

  const favRows = await db
    .select({ mediaId: webMediaFavorites.mediaId })
    .from(webMediaFavorites)
    .where(eq(webMediaFavorites.userId, query.userId));
  const favSet = new Set(favRows.map((f) => f.mediaId));

  const list = rows.map((row) => ({
    ...row,
    isFavorite: favSet.has(row.id),
    publishTimeText: formatPublishTime(row.publishTimeMinutes),
  }));

  return { list, total, page, pageSize };
}

function formatPublishTime(minutes: number | null) {
  if (!minutes) return "-";
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
}

export async function getWebMediaById(id: number, userId: number) {
  const [row] = await db.select().from(webMedia).where(eq(webMedia.id, id)).limit(1);
  if (!row) return null;
  const [fav] = await db
    .select()
    .from(webMediaFavorites)
    .where(and(eq(webMediaFavorites.mediaId, id), eq(webMediaFavorites.userId, userId)))
    .limit(1);
  return {
    ...row,
    isFavorite: !!fav,
    publishTimeText: formatPublishTime(row.publishTimeMinutes),
  };
}

export async function toggleFavorite(
  userId: number,
  mediaId: number,
  groupId?: number
) {
  const [existing] = await db
    .select()
    .from(webMediaFavorites)
    .where(
      and(eq(webMediaFavorites.userId, userId), eq(webMediaFavorites.mediaId, mediaId))
    )
    .limit(1);

  if (existing) {
    await db.delete(webMediaFavorites).where(eq(webMediaFavorites.id, existing.id));
    return { favorited: false };
  }

  await db.insert(webMediaFavorites).values({
    userId,
    mediaId,
    groupId: groupId || null,
  });
  return { favorited: true };
}

export async function listFavoriteGroups(userId: number) {
  const groups = await db
    .select()
    .from(webMediaFavoriteGroups)
    .where(eq(webMediaFavoriteGroups.userId, userId))
    .orderBy(desc(webMediaFavoriteGroups.id));

  const counts = await db
    .select({
      groupId: webMediaFavorites.groupId,
      cnt: count(),
    })
    .from(webMediaFavorites)
    .where(eq(webMediaFavorites.userId, userId))
    .groupBy(webMediaFavorites.groupId);

  const countMap = new Map(counts.map((c) => [c.groupId, Number(c.cnt)]));

  return groups.map((g) => ({
    ...g,
    mediaCount: countMap.get(g.id) || 0,
  }));
}

export async function createFavoriteGroup(userId: number, name: string) {
  const [row] = await db
    .insert(webMediaFavoriteGroups)
    .values({ userId, name })
    .returning();
  return row;
}

export async function deleteFavoriteGroup(userId: number, groupId: number) {
  await db
    .delete(webMediaFavorites)
    .where(
      and(eq(webMediaFavorites.userId, userId), eq(webMediaFavorites.groupId, groupId))
    );
  await db
    .delete(webMediaFavoriteGroups)
    .where(
      and(
        eq(webMediaFavoriteGroups.id, groupId),
        eq(webMediaFavoriteGroups.userId, userId)
      )
    );
}

export async function createSubmission(
  userId: number,
  data: {
    mediaId: number;
    articleId?: number;
    title: string;
    content?: string;
  }
) {
  const media = await getWebMediaById(data.mediaId, userId);
  if (!media) throw new Error("媒体不存在");

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const price = media.price;
  if ((user?.score ?? 0) < price) {
    throw new Error(`点数不足，需要 ${price} 点`);
  }

  const [submission] = await db
    .insert(webMediaSubmissions)
    .values({
      userId,
      mediaId: data.mediaId,
      articleId: data.articleId,
      title: data.title,
      content: data.content,
      price,
      status: "pending",
    })
    .returning();

  await db
    .update(users)
    .set({ score: sql`${users.score} - ${Math.ceil(price)}` })
    .where(eq(users.id, userId));

  return submission;
}

export async function listSubmissions(
  userId: number,
  params: { page?: number; pageSize?: number; status?: string }
) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const conditions = [eq(webMediaSubmissions.userId, userId)];
  if (params.status) {
    conditions.push(eq(webMediaSubmissions.status, params.status));
  }
  const where = and(...conditions);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(webMediaSubmissions)
    .where(where);

  const rows = await db
    .select({
      submission: webMediaSubmissions,
      mediaName: webMedia.name,
      mediaPortal: webMedia.portal,
    })
    .from(webMediaSubmissions)
    .innerJoin(webMedia, eq(webMediaSubmissions.mediaId, webMedia.id))
    .where(where)
    .orderBy(desc(webMediaSubmissions.submittedAt))
    .limit(pageSize)
    .offset(offset);

  const list = rows.map((r) => ({
    ...r.submission,
    mediaName: r.mediaName,
    mediaPortal: r.mediaPortal,
  }));

  return { list, total, page, pageSize };
}

export async function createPublishTask(
  userId: number,
  data: {
    name: string;
    articleIds: number[];
    mediaIds: number[];
    publishType?: string;
    scheduledAt?: string;
  }
) {
  const totalCount = data.articleIds.length * data.mediaIds.length;
  const [task] = await db
    .insert(webMediaPublishTasks)
    .values({
      userId,
      name: data.name,
      articleIds: data.articleIds,
      mediaIds: data.mediaIds,
      publishType: data.publishType || "immediate",
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      status: "pending",
      totalCount,
    })
    .returning();

  return task;
}

export async function listPublishTasks(
  userId: number,
  params: { page?: number; pageSize?: number }
) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;
  const where = eq(webMediaPublishTasks.userId, userId);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(webMediaPublishTasks)
    .where(where);

  const list = await db
    .select()
    .from(webMediaPublishTasks)
    .where(where)
    .orderBy(desc(webMediaPublishTasks.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { list, total, page, pageSize };
}

export async function publishToWebmedia(
  userId: number,
  data: { articleIds: number[]; mediaIds: number[]; publishType?: string; scheduledAt?: string }
) {
  const name = `批量发布-${new Date().toISOString().slice(0, 10)}`;
  return createPublishTask(userId, {
    name,
    articleIds: data.articleIds,
    mediaIds: data.mediaIds,
    publishType: data.publishType,
    scheduledAt: data.scheduledAt,
  });
}
