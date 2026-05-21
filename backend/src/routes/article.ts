import { Hono } from "hono";

export const articleRoutes = new Hono();

// 关键词管理
articleRoutes.get("/keywords", async (c) => {
  return c.json({ code: 1, data: { list: [], total: 0 } });
});

articleRoutes.post("/keywords", async (c) => {
  const body = await c.req.json();
  return c.json({ code: 1, msg: "添加成功", data: null });
});

// 写作标题
articleRoutes.get("/questions", async (c) => {
  return c.json({ code: 1, data: { list: [], total: 0 } });
});

// 文章分类
articleRoutes.get("/types", async (c) => {
  return c.json({ code: 1, data: { list: [], total: 0 } });
});

articleRoutes.post("/types", async (c) => {
  const body = await c.req.json();
  return c.json({ code: 1, msg: "创建成功", data: null });
});

// AI写作任务
articleRoutes.get("/tasks", async (c) => {
  return c.json({ code: 1, data: { list: [], total: 0 } });
});

articleRoutes.post("/tasks", async (c) => {
  const body = await c.req.json();
  return c.json({ code: 1, msg: "任务创建成功", data: { taskId: "mock-task-id" } });
});

// 文章列表
articleRoutes.get("/", async (c) => {
  return c.json({ code: 1, data: { list: [], total: 0 } });
});

articleRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  return c.json({ code: 1, data: { id, title: "示例文章", content: "" } });
});
