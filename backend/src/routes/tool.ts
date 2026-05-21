import { Hono } from "hono";

export const toolRoutes = new Hono();

// 关键词指数查询
toolRoutes.get("/zhishu", async (c) => {
  const keyword = c.req.query("keyword");
  return c.json({ code: 1, data: { keyword, index: 0 } });
});

// AI拓词
toolRoutes.get("/tuoci", async (c) => {
  const keyword = c.req.query("keyword");
  return c.json({ code: 1, data: { keyword, words: [] } });
});

// 手动拓词
toolRoutes.post("/tuoci/manual", async (c) => {
  const body = await c.req.json();
  return c.json({ code: 1, data: { words: [] } });
});
