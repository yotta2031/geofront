import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import {
  createPublishTask,
  createWebsite,
  deleteWebsites,
  listPublishRecords,
  listPublishTasks,
  listWebsites,
  publishToSite,
  testConnection,
  togglePublishEnabled,
  updateWebsite,
} from "../app/services/siteService.js";

export const siteRoutes = new Hono<AppEnv>();

function uid(c: { get: (k: "user") => { userId: number } | undefined }) {
  return c.get("user")!.userId;
}

siteRoutes.get("/websites", async (c) => {
  const q = c.req.query();
  const data = await listWebsites(uid(c), {
    page: q.page ? Number(q.page) : 1,
    pageSize: q.pageSize ? Number(q.pageSize) : 20,
  });
  return c.json({ code: 1, data });
});

siteRoutes.post("/websites", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.siteName?.trim() || !body.siteUrl?.trim()) {
      return c.json({ code: 0, msg: "站点名称和官网地址不能为空" });
    }
    const row = await createWebsite(uid(c), body);
    return c.json({ code: 1, msg: "添加成功", data: row });
  } catch (e) {
    return c.json({ code: 0, msg: e instanceof Error ? e.message : "添加失败" });
  }
});

siteRoutes.put("/websites/:id", async (c) => {
  const body = await c.req.json();
  const row = await updateWebsite(uid(c), Number(c.req.param("id")), body);
  if (!row) return c.json({ code: 0, msg: "站点不存在" }, 404);
  return c.json({ code: 1, msg: "更新成功", data: row });
});

siteRoutes.patch("/websites/:id/publish-enabled", async (c) => {
  const body = await c.req.json<{ enabled: boolean }>();
  const row = await togglePublishEnabled(uid(c), Number(c.req.param("id")), body.enabled);
  if (!row) return c.json({ code: 0, msg: "站点不存在" }, 404);
  return c.json({ code: 1, data: row });
});

siteRoutes.post("/websites/:id/test-connection", async (c) => {
  try {
    const result = await testConnection(uid(c), Number(c.req.param("id")));
    return c.json({ code: result.ok ? 1 : 0, msg: result.msg, data: result });
  } catch (e) {
    return c.json({ code: 0, msg: e instanceof Error ? e.message : "测试失败" });
  }
});

siteRoutes.delete("/websites", async (c) => {
  const body = await c.req.json<{ ids: number[] }>();
  await deleteWebsites(uid(c), body.ids || []);
  return c.json({ code: 1, msg: "删除成功" });
});

siteRoutes.get("/tasks", async (c) => {
  const q = c.req.query();
  const data = await listPublishTasks(uid(c), {
    page: q.page ? Number(q.page) : 1,
    pageSize: q.pageSize ? Number(q.pageSize) : 20,
  });
  return c.json({ code: 1, data });
});

siteRoutes.post("/tasks", async (c) => {
  const body = await c.req.json();
  if (!body.name?.trim() || !body.articleIds?.length || !body.siteIds?.length) {
    return c.json({ code: 0, msg: "任务名称、文章和站点不能为空" });
  }
  const row = await createPublishTask(uid(c), body);
  return c.json({ code: 1, msg: "发布任务已创建", data: row });
});

siteRoutes.get("/records", async (c) => {
  const q = c.req.query();
  const data = await listPublishRecords(uid(c), {
    page: q.page ? Number(q.page) : 1,
    pageSize: q.pageSize ? Number(q.pageSize) : 20,
    status: q.status,
    siteId: q.siteId ? Number(q.siteId) : undefined,
  });
  return c.json({ code: 1, data });
});

siteRoutes.post("/publish", async (c) => {
  const body = await c.req.json();
  if (!body.articleIds?.length || !body.siteIds?.length) {
    return c.json({ code: 0, msg: "请选择文章和官网站点" });
  }
  const row = await publishToSite(uid(c), body);
  return c.json({ code: 1, msg: "发布任务已创建", data: row });
});
