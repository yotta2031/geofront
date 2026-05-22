import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { legacyDiagnoseSchema } from "../app/schemas/diagnose.js";
import {
  createDiagnoseTask,
  listDiagnoseTasks,
  getTaskResult,
} from "../app/services/diagnoseService.js";
import { successResponse, paginatedResponse } from "../utils/response.js";

export const diagnosisRoutes = new Hono<AppEnv>();

// AI可见度诊断 - 创建诊断任务（兼容现有前端）
diagnosisRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = legacyDiagnoseSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ code: 0, msg: parsed.error.errors[0]?.message || "参数错误" }, 400);
  }

  const userId = c.get("user").userId;
  const result = await createDiagnoseTask(userId, {
    brand: parsed.data.brand,
    platforms: parsed.data.platforms,
    keywords: parsed.data.keywords,
    needOptimize: parsed.data.needOptimize,
  });

  return c.json(
    successResponse({ taskId: result.taskId }, "诊断任务已创建")
  );
});

// 获取诊断报告列表（兼容现有前端）
diagnosisRoutes.get("/", async (c) => {
  const userId = c.get("user").userId;
  const page = Number(c.req.query("page") || 1);
  const pageSize = Number(c.req.query("pageSize") || 10);

  const { list, total } = await listDiagnoseTasks(userId, page, pageSize);
  return c.json(paginatedResponse(list, total, page, pageSize));
});

// 获取单条诊断报告详情（兼容现有前端）
diagnosisRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await getTaskResult(id);

  if (!result) {
    return c.json({ code: 0, msg: "诊断任务不存在" }, 404);
  }

  const statusMap: Record<string, string> = {
    queued: "pending",
    running: "running",
    analyzing: "running",
    reporting: "running",
    completed: "completed",
    failed: "failed",
  };

  return c.json({
    code: 1,
    data: {
      id: result.task.id,
      brand: result.brand?.name || "",
      platforms: (result.task.platforms as string[]) || [],
      status: statusMap[result.task.status || ""] || result.task.status,
      score: result.task.score,
      result: {
        visibility_scores: result.visibility_scores,
        competitors: result.competitors,
        suggestions: result.suggestions,
        report: result.report,
      },
    },
  });
});
