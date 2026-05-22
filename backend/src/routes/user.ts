import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import type { AppEnv } from "../types.js";

export const userRoutes = new Hono<AppEnv>();

// 获取当前用户信息
userRoutes.get("/me", async (c) => {
  const userId = c.get("user").userId;

  if (!userId) {
    return c.json({ code: 0, msg: "未登录" }, 401);
  }

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      nickname: users.nickname,
      avatar: users.avatar,
      score: users.score,
      balance: users.balance,
      storage_used: users.storageUsed,
      storage_total: users.storageTotal,
      vip_expire: users.vipExpire,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return c.json({ code: 0, msg: "用户不存在" }, 404);
  }

  return c.json({ code: 1, data: user });
});

// 更新用户信息
userRoutes.put("/me", async (c) => {
  const userId = c.get("user").userId;

  if (!userId) {
    return c.json({ code: 0, msg: "未登录" }, 401);
  }

  const body = await c.req.json();
  await db
    .update(users)
    .set({
      nickname: body.nickname,
      email: body.email,
      phone: body.phone,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

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
