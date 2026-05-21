import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/user.js";
import { diagnosisRoutes } from "./routes/diagnosis.js";
import { articleRoutes } from "./routes/article.js";
import { publishRoutes } from "./routes/publish.js";
import { toolRoutes } from "./routes/tool.js";
import { errorHandler } from "./middleware/error.js";
import { authMiddleware } from "./middleware/auth.js";

const app = new Hono();

// 全局中间件
app.use("*", cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use("*", logger());

// 健康检查
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// 公开路由
app.route("/api/auth", authRoutes);

// 需要认证的路由
app.use("/api/*", authMiddleware);
app.route("/api/users", userRoutes);
app.route("/api/diagnosis", diagnosisRoutes);
app.route("/api/articles", articleRoutes);
app.route("/api/publish", publishRoutes);
app.route("/api/tools", toolRoutes);

// 错误处理
app.onError(errorHandler);

const port = parseInt(process.env.PORT || "3001");

serve({
  fetch: app.fetch,
  port,
});

console.log(`🚀 Server running at http://localhost:${port}`);
