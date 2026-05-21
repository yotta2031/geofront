import { Hono } from "hono";

export const userRoutes = new Hono();

// 获取当前用户信息
userRoutes.get("/me", async (c) => {
  // TODO: 从token解析用户ID，查询用户信息
  return c.json({
    code: 1,
    data: {
      id: 1,
      username: "admin",
      nickname: "管理员",
      avatar: null,
      score: 390,
      balance: 0.50,
      storage_used: 304,
      storage_total: 1000,
      vip_expire: "2027-01-15",
    },
  });
});

// 更新用户信息
userRoutes.put("/me", async (c) => {
  const body = await c.req.json();
  // TODO: 更新用户信息
  return c.json({ code: 1, msg: "更新成功", data: null });
});

// 点数明细
userRoutes.get("/score-log", async (c) => {
  // TODO: 查询点数消费记录
  return c.json({ code: 1, data: { list: [], total: 0 } });
});

// 余额明细
userRoutes.get("/money-log", async (c) => {
  // TODO: 查询余额消费记录
  return c.json({ code: 1, data: { list: [], total: 0 } });
});
