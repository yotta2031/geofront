import { Hono } from "hono";
import type { AppEnv } from "../../../types.js";
import { v1DiagnoseSchema } from "../../schemas/diagnose.js";
import {
  createDiagnoseTask,
  getTaskStatus,
  getTaskResult,
  getReportById,
  getReportByTaskId,
} from "../../services/diagnoseService.js";
import { getTaskProgress } from "../../core/progress.js";

export const v1DiagnoseRoutes = new Hono<AppEnv>();

v1DiagnoseRoutes.post("/diagnose", async (c) => {
  const body = await c.req.json();
  const parsed = v1DiagnoseSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ code: 0, msg: parsed.error.errors[0]?.message }, 400);
  }

  const userId = c.get("user").userId;
  const result = await createDiagnoseTask(userId, {
    brand: parsed.data.brand,
    aliases: parsed.data.aliases,
    industry: parsed.data.industry,
    generate_suggestion: parsed.data.generate_suggestion,
  });

  return c.json({ task_id: result.task_id });
});

v1DiagnoseRoutes.get("/tasks/:id", async (c) => {
  const task = await getTaskStatus(c.req.param("id"));
  if (!task) return c.json({ code: 0, msg: "任务不存在" }, 404);

  const live = getTaskProgress(task.id);
  return c.json({
    id: task.id,
    status: live?.status || task.status,
    progress: live?.progress ?? task.progress,
    score: task.score,
    created_at: task.createdAt,
  });
});

v1DiagnoseRoutes.get("/tasks/:id/result", async (c) => {
  const result = await getTaskResult(c.req.param("id"));
  if (!result) return c.json({ code: 0, msg: "任务不存在" }, 404);
  return c.json(result);
});

v1DiagnoseRoutes.get("/reports/:id", async (c) => {
  const id = c.req.param("id");
  let report = await getReportById(id);
  if (!report) report = await getReportByTaskId(id);
  if (!report) return c.json({ code: 0, msg: "报告不存在" }, 404);

  return c.json({
    id: report.id,
    task_id: report.taskId,
    html_url: report.htmlUrl,
    pdf_url: report.pdfUrl,
    html_content: report.htmlContent,
  });
});
