import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { generateToken, hashPassword, verifyPassword } from "../utils/auth.js";
import { loginSchema, registerSchema } from "../validators/index.js";

export const authRoutes = new Hono();

// 登录
authRoutes.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ code: 0, msg: parsed.error.errors[0]?.message || "参数错误" }, 400);
  }

  const { username, password } = parsed.data;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) {
    return c.json({ code: 0, msg: "账号或密码错误" }, 401);
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return c.json({ code: 0, msg: "账号或密码错误" }, 401);
  }

  if (user.status !== 1) {
    return c.json({ code: 0, msg: "账号已被禁用" }, 403);
  }

  const token = await generateToken({
    userId: user.id,
    username: user.username,
  });

  return c.json({ code: 1, msg: "登录成功", data: { token } });
});

// 注册
authRoutes.post("/register", async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ code: 0, msg: parsed.error.errors[0]?.message || "参数错误" }, 400);
  }

  const { username, password, nickname } = parsed.data;
  const [exists] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (exists) {
    return c.json({ code: 0, msg: "用户名已存在" }, 400);
  }

  const hashed = await hashPassword(password);
  await db.insert(users).values({
    username,
    password: hashed,
    nickname: nickname || username,
  });

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
