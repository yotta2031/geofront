import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { v1DiagnoseRoutes } from "../app/api/v1/diagnose.js";
import { v1BrandRoutes } from "../app/api/v1/brands.js";
import { v1BillingRoutes } from "../app/api/v1/billing.js";
import { subscribeTaskProgress } from "../app/core/progress.js";

export const v1Routes = new Hono<AppEnv>();

v1Routes.route("/", v1DiagnoseRoutes);
v1Routes.route("/", v1BrandRoutes);
v1Routes.route("/", v1BillingRoutes);

/** 任务进度 SSE - 规格 /ws/tasks/{id} 的兼容实现 */
v1Routes.get("/ws/tasks/:id", async (c) => {
  const taskId = c.req.param("id");

  if (c.req.header("upgrade")?.toLowerCase() !== "websocket") {
    return c.json({
      message: "请使用 WebSocket 连接，或通过 GET /api/v1/tasks/:id 轮询",
      task_id: taskId,
    });
  }

  // 简化 SSE 降级（Node 原生 WS 需额外依赖）
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        const send = (p: { progress: number; status: string }) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(p)}\n\n`)
          );
        };
        const unsub = subscribeTaskProgress(taskId, send);
        const timer = setInterval(() => {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        }, 15000);
        c.req.raw.signal?.addEventListener("abort", () => {
          unsub();
          clearInterval(timer);
          controller.close();
        });
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }
  );
});
