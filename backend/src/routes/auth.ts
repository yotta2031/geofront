import { Hono } from "hono";
import { generateToken } from "../utils/auth.js";

export const authRoutes = new Hono();

// 登录
authRoutes.post("/login", async (c) => {
  const body = await c.req.json();
  // TODO: 校验账号密码（当前开发阶段任意合法账号均可登录）
  const token = await generateToken({
    userId: 1,
    username: body.username || "admin",
  });
  return c.json({ code: 1, msg: "登录成功", data: { token } });
});

// 注册
authRoutes.post("/register", async (c) => {
  const body = await c.req.json();
  // TODO: 实现注册逻辑
  return c.json({ code: 1, msg: "注册成功", data: null });
});

// 刷新Token
authRoutes.post("/refresh", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ code: 0, msg: "未提供认证令牌" }, 401);
  }

  const { verifyToken } = await import("../utils/auth.js");
  try {
    const payload = await verifyToken(authHeader.substring(7));
    const token = await generateToken({
      userId: payload.userId,
      username: payload.username,
    });
    return c.json({ code: 1, msg: "刷新成功", data: { token } });
  } catch {
    return c.json({ code: 0, msg: "认证令牌无效或已过期" }, 401);
  }
});
