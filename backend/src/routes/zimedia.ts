import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import {
  createAccount,
  createPublishTask,
  deleteAccounts,
  listAccounts,
  listPublishRecords,
  listPublishTasks,
  publishToZimedia,
  togglePublishEnabled,
  updateAccount,
} from "../app/services/zimediaService.js";

export const zimediaRoutes = new Hono<AppEnv>();

function uid(c: { get: (k: "user") => { userId: number } | undefined }) {
  return c.get("user")!.userId;
}

zimediaRoutes.get("/accounts", async (c) => {
  const q = c.req.query();
  const data = await listAccounts(uid(c), {
    page: q.page ? Number(q.page) : 1,
    pageSize: q.pageSize ? Number(q.pageSize) : 20,
  });
  return c.json({ code: 1, data });
});

zimediaRoutes.post("/accounts", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.accountName?.trim() || !body.platform) {
      return c.json({ code: 0, msg: "大V名称和平台不能为空" });
    }
    const row = await createAccount(uid(c), body);
    return c.json({ code: 1, msg: "添加成功", data: row });
  } catch (e) {
    return c.json({ code: 0, msg: e instanceof Error ? e.message : "添加失败" });
  }
});

zimediaRoutes.put("/accounts/:id", async (c) => {
  const body = await c.req.json();
  const row = await updateAccount(uid(c), Number(c.req.param("id")), body);
  if (!row) return c.json({ code: 0, msg: "大V不存在" }, 404);
  return c.json({ code: 1, msg: "更新成功", data: row });
});

zimediaRoutes.patch("/accounts/:id/publish-enabled", async (c) => {
  const body = await c.req.json<{ enabled: boolean }>();
  const row = await togglePublishEnabled(uid(c), Number(c.req.param("id")), body.enabled);
  if (!row) return c.json({ code: 0, msg: "大V不存在" }, 404);
  return c.json({ code: 1, data: row });
});

zimediaRoutes.delete("/accounts", async (c) => {
  const body = await c.req.json<{ ids: number[] }>();
  await deleteAccounts(uid(c), body.ids || []);
  return c.json({ code: 1, msg: "删除成功" });
});

zimediaRoutes.get("/tasks", async (c) => {
  const q = c.req.query();
  const data = await listPublishTasks(uid(c), {
    page: q.page ? Number(q.page) : 1,
    pageSize: q.pageSize ? Number(q.pageSize) : 20,
  });
  return c.json({ code: 1, data });
});

zimediaRoutes.post("/tasks", async (c) => {
  const body = await c.req.json();
  if (!body.name?.trim() || !body.articleIds?.length || !body.accountIds?.length) {
    return c.json({ code: 0, msg: "任务名称、文章和大V账号不能为空" });
  }
  const row = await createPublishTask(uid(c), body);
  return c.json({ code: 1, msg: "发布任务已创建", data: row });
});

zimediaRoutes.get("/records", async (c) => {
  const q = c.req.query();
  const data = await listPublishRecords(uid(c), {
    page: q.page ? Number(q.page) : 1,
    pageSize: q.pageSize ? Number(q.pageSize) : 20,
    status: q.status,
    platform: q.platform,
  });
  return c.json({ code: 1, data });
});

zimediaRoutes.post("/publish", async (c) => {
  const body = await c.req.json();
  if (!body.articleIds?.length || !body.accountIds?.length) {
    return c.json({ code: 0, msg: "请选择文章和大V账号" });
  }
  const row = await publishToZimedia(uid(c), body);
  return c.json({ code: 1, msg: "发布任务已创建", data: row });
});
