import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import {
  createFavoriteGroup,
  createPublishTask,
  createSubmission,
  deleteFavoriteGroup,
  getWebMediaById,
  listFavoriteGroups,
  listPublishTasks,
  listSubmissions,
  listWebMedia,
  publishToWebmedia,
  toggleFavorite,
} from "../app/services/webmediaService.js";

export const webmediaRoutes = new Hono<AppEnv>();

function getUserId(c: { get: (k: "user") => { userId: number } | undefined }) {
  return c.get("user")!.userId;
}

// 媒体列表（筛选）
webmediaRoutes.get("/media", async (c) => {
  const q = c.req.query();
  const userId = getUserId(c);
  const data = await listWebMedia({
    userId,
    keyword: q.keyword,
    industry: q.industry,
    portal: q.portal,
    region: q.region,
    entryLevel: q.entryLevel,
    indexWeb: q.indexWeb,
    indexNews: q.indexNews,
    linkType: q.linkType,
    publishSpeed: q.publishSpeed,
    specialIndustry: q.specialIndustry,
    weekendPublish: q.weekendPublish === "1",
    holidayPublish: q.holidayPublish === "1",
    nightPublish: q.nightPublish === "1",
    hasTextLink: q.hasTextLink === "1",
    whitelistSource: q.whitelistSource === "1",
    hasVideo: q.hasVideo === "1",
    mobileMedia: q.mobileMedia === "1",
    longValidity: q.longValidity === "1",
    geoRankable: q.geoRankable === "1",
    priceSort: q.priceSort as "asc" | "desc" | undefined,
    groupId: q.groupId ? Number(q.groupId) : undefined,
    page: q.page ? Number(q.page) : 1,
    pageSize: q.pageSize ? Number(q.pageSize) : 20,
  });
  return c.json({ code: 1, data });
});

webmediaRoutes.get("/media/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const row = await getWebMediaById(id, getUserId(c));
  if (!row) return c.json({ code: 0, msg: "媒体不存在" }, 404);
  return c.json({ code: 1, data: row });
});

// 收藏
webmediaRoutes.post("/favorites/toggle", async (c) => {
  const body = await c.req.json<{ mediaId: number; groupId?: number }>();
  const result = await toggleFavorite(getUserId(c), body.mediaId, body.groupId);
  return c.json({ code: 1, msg: result.favorited ? "已收藏" : "已取消收藏", data: result });
});

webmediaRoutes.get("/favorite-groups", async (c) => {
  const list = await listFavoriteGroups(getUserId(c));
  return c.json({ code: 1, data: { list } });
});

webmediaRoutes.post("/favorite-groups", async (c) => {
  const body = await c.req.json<{ name: string }>();
  if (!body.name?.trim()) return c.json({ code: 0, msg: "分组名称不能为空" });
  const row = await createFavoriteGroup(getUserId(c), body.name.trim());
  return c.json({ code: 1, msg: "创建成功", data: row });
});

webmediaRoutes.delete("/favorite-groups/:id", async (c) => {
  await deleteFavoriteGroup(getUserId(c), Number(c.req.param("id")));
  return c.json({ code: 1, msg: "删除成功" });
});

// 单条投稿
webmediaRoutes.post("/submit", async (c) => {
  try {
    const body = await c.req.json<{
      mediaId: number;
      articleId?: number;
      title: string;
      content?: string;
    }>();
    if (!body.mediaId || !body.title?.trim()) {
      return c.json({ code: 0, msg: "媒体和标题不能为空" });
    }
    const row = await createSubmission(getUserId(c), body);
    return c.json({ code: 1, msg: "投稿已提交", data: row });
  } catch (e) {
    return c.json({ code: 0, msg: e instanceof Error ? e.message : "投稿失败" });
  }
});

// 投稿记录
webmediaRoutes.get("/submissions", async (c) => {
  const q = c.req.query();
  const data = await listSubmissions(getUserId(c), {
    page: q.page ? Number(q.page) : 1,
    pageSize: q.pageSize ? Number(q.pageSize) : 20,
    status: q.status,
  });
  return c.json({ code: 1, data });
});

// AI 智能发布任务
webmediaRoutes.get("/tasks", async (c) => {
  const q = c.req.query();
  const data = await listPublishTasks(getUserId(c), {
    page: q.page ? Number(q.page) : 1,
    pageSize: q.pageSize ? Number(q.pageSize) : 20,
  });
  return c.json({ code: 1, data });
});

webmediaRoutes.post("/tasks", async (c) => {
  const body = await c.req.json<{
    name: string;
    articleIds: number[];
    mediaIds: number[];
    publishType?: string;
    scheduledAt?: string;
  }>();
  if (!body.name?.trim() || !body.articleIds?.length || !body.mediaIds?.length) {
    return c.json({ code: 0, msg: "任务名称、文章和媒体不能为空" });
  }
  const row = await createPublishTask(getUserId(c), body);
  return c.json({ code: 1, msg: "发布任务已创建", data: row });
});

// 批量发布（兼容旧接口）
webmediaRoutes.post("/publish", async (c) => {
  const body = await c.req.json<{
    articleIds: number[];
    mediaIds?: number[];
    publishType?: string;
    scheduledAt?: string;
  }>();
  const mediaIds = body.mediaIds || [];
  if (!body.articleIds?.length || !mediaIds.length) {
    return c.json({ code: 0, msg: "请选择文章和媒体" });
  }
  const row = await publishToWebmedia(getUserId(c), {
    articleIds: body.articleIds,
    mediaIds,
    publishType: body.publishType,
    scheduledAt: body.scheduledAt,
  });
  return c.json({ code: 1, msg: "发布任务已创建", data: row });
});
