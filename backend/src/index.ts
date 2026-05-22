import dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/user.js";
import { diagnosisRoutes } from "./routes/diagnosis.js";
import { articleRoutes } from "./routes/article.js";
import { publishRoutes } from "./routes/publish.js";
import { toolRoutes } from "./routes/tool.js";
import { v1Routes } from "./routes/v1.js";
import { errorHandler } from "./middleware/error.js";
import { authMiddleware } from "./middleware/auth.js";
import type { AppEnv } from "./types.js";
import { getReportByTaskId } from "./app/services/diagnoseService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: process.env.ENV_FILE });
dotenv.config({ path: join(__dirname, "../../.env") });
dotenv.config();
const isProd = process.env.NODE_ENV === "production";
const staticRoot =
  process.env.STATIC_DIR || join(__dirname, "../../public");

const app = new Hono<AppEnv>();

// 全局中间件
const corsOrigin = process.env.FRONTEND_URL || (isProd ? "*" : "http://localhost:5173");
app.use("*", cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use("*", logger());

// 健康检查
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// 公开路由
app.route("/api/auth", authRoutes);

// 报告 HTML 预览（规格：/report/{task_id}.html）
app.get("/report/:taskId.html", async (c) => {
  const taskId = c.req.param("taskId") || "";
  const report = await getReportByTaskId(taskId);
  if (!report?.htmlContent) return c.text("报告未生成", 404);
  return c.html(report.htmlContent);
});

// 需要认证的路由
app.use("/api/*", authMiddleware);
app.route("/api/v1", v1Routes);
app.route("/api/users", userRoutes);
app.route("/api/diagnosis", diagnosisRoutes);
app.route("/api/articles", articleRoutes);
app.route("/api/publish", publishRoutes);
app.route("/api/tools", toolRoutes);

// 生产环境：托管前端静态资源（单端口部署）
if (isProd && existsSync(staticRoot)) {
  app.use("/assets/*", serveStatic({ root: staticRoot }));
  app.use("/favicon.svg", serveStatic({ root: staticRoot }));
  app.get("*", async (c) => {
    if (c.req.path.startsWith("/api") || c.req.path === "/health") {
      return c.notFound();
    }
    const indexPath = join(staticRoot, "index.html");
    if (!existsSync(indexPath)) {
      return c.text("Frontend not built", 503);
    }
    const html = readFileSync(indexPath, "utf-8");
    return c.html(html);
  });
}

// 错误处理
app.onError(errorHandler);

const port = parseInt(process.env.PORT || "3001");

serve({
  fetch: app.fetch,
  port,
});

console.log(`🚀 Server running at http://localhost:${port}`);
