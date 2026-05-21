import { Hono } from "hono";

export const publishRoutes = new Hono();

// 网站媒体发布
publishRoutes.post("/webmedia", async (c) => {
  const body = await c.req.json();
  return c.json({ code: 1, msg: "发布任务已创建", data: null });
});

// 自媒体大V发布
publishRoutes.post("/zimedia", async (c) => {
  const body = await c.req.json();
  return c.json({ code: 1, msg: "发布任务已创建", data: null });
});

// 个人自媒体发布
publishRoutes.post("/weixin", async (c) => {
  const body = await c.req.json();
  return c.json({ code: 1, msg: "发布任务已创建", data: null });
});

// 官网SEO发布
publishRoutes.post("/site", async (c) => {
  const body = await c.req.json();
  return c.json({ code: 1, msg: "发布任务已创建", data: null });
});

// 发布记录
publishRoutes.get("/records", async (c) => {
  return c.json({ code: 1, data: { list: [], total: 0 } });
});
