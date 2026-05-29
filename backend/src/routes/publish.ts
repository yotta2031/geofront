import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { publishToWebmedia } from "../app/services/webmediaService.js";
import { publishToWeixin } from "../app/services/weixinService.js";
import { publishToSite } from "../app/services/siteService.js";

export const publishRoutes = new Hono<AppEnv>();

// 网站媒体发布（兼容旧路径）
publishRoutes.post("/webmedia", async (c) => {
  const body = await c.req.json<{
    articleIds: number[];
    mediaIds?: number[];
    publishType?: string;
    scheduledAt?: string;
  }>();
  const userId = c.get("user")!.userId;
  const mediaIds = body.mediaIds || [];
  if (!body.articleIds?.length || !mediaIds.length) {
    return c.json({ code: 0, msg: "请选择文章和媒体" });
  }
  const row = await publishToWebmedia(userId, {
    articleIds: body.articleIds,
    mediaIds,
    publishType: body.publishType,
    scheduledAt: body.scheduledAt,
  });
  return c.json({ code: 1, msg: "发布任务已创建", data: row });
});

// 自媒体大V发布
publishRoutes.post("/zimedia", async (c) => {
  const body = await c.req.json();
  return c.json({ code: 1, msg: "发布任务已创建", data: null });
});

// 个人自媒体发布（兼容旧路径）
publishRoutes.post("/weixin", async (c) => {
  const body = await c.req.json<{
    articleIds: number[];
    accountIds: number[];
    publishType?: string;
    scheduledAt?: string;
  }>();
  const userId = c.get("user")!.userId;
  if (!body.articleIds?.length || !body.accountIds?.length) {
    return c.json({ code: 0, msg: "请选择文章和自媒体账号" });
  }
  const row = await publishToWeixin(userId, body);
  return c.json({ code: 1, msg: "发布任务已创建", data: row });
});

// 官网SEO发布（兼容旧路径）
publishRoutes.post("/site", async (c) => {
  const body = await c.req.json<{
    articleIds: number[];
    siteIds: number[];
    publishType?: string;
    scheduledAt?: string;
  }>();
  const userId = c.get("user")!.userId;
  if (!body.articleIds?.length || !body.siteIds?.length) {
    return c.json({ code: 0, msg: "请选择文章和官网站点" });
  }
  const row = await publishToSite(userId, body);
  return c.json({ code: 1, msg: "发布任务已创建", data: row });
});

// 发布记录
publishRoutes.get("/records", async (c) => {
  return c.json({ code: 1, data: { list: [], total: 0 } });
});
