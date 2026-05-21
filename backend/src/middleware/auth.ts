import type { Context, Next } from "hono";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-jwt-secret-key-change-in-production"
);

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ code: 0, msg: "未提供认证令牌" }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });
    
    // 将用户信息附加到上下文
    c.set("user", payload);
    return await next();
  } catch {
    return c.json({ code: 0, msg: "认证令牌无效或已过期" }, 401);
  }
}
