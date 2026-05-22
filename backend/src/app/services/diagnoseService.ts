import { eq, desc, and, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { brands, geoTasks, geoReports, visibilityScores, competitors } from "../../db/schema.js";
import { runDiagnoseWorker } from "../workers/diagnoseWorker.js";

export type CreateDiagnoseInput = {
  brand: string;
  aliases?: string[];
  industry?: string;
  platforms?: string[];
  keywords?: string[];
  needOptimize?: boolean;
  generate_suggestion?: boolean;
};

function mapStatusForFrontend(status: string): string {
  const map: Record<string, string> = {
    queued: "pending",
    running: "running",
    analyzing: "running",
    reporting: "running",
    completed: "completed",
    failed: "failed",
  };
  return map[status] || status;
}

export async function createDiagnoseTask(
  userId: number,
  input: CreateDiagnoseInput
) {
  const industry =
    input.industry || input.keywords?.join(",") || undefined;

  let brandId: string | undefined;
  const [existingBrand] = await db
    .select()
    .from(brands)
    .where(and(eq(brands.name, input.brand), eq(brands.userId, userId)))
    .limit(1);

  if (existingBrand) {
    brandId = existingBrand.id;
  } else {
    const [created] = await db
      .insert(brands)
      .values({
        userId,
        name: input.brand,
        aliases: input.aliases || [],
        industry: industry || null,
      })
      .returning({ id: brands.id });
    brandId = created.id;
  }

  const needOptimize =
    input.needOptimize ?? input.generate_suggestion ?? false;

  const [task] = await db
    .insert(geoTasks)
    .values({
      userId,
      brandId,
      status: "queued",
      progress: 0,
      platforms: input.platforms || ["deepseek", "doubao"],
      keywords: input.keywords?.join(",") || null,
      industry: industry || null,
      needOptimize,
    })
    .returning();

  setImmediate(() => runDiagnoseWorker(task.id));

  return { task_id: task.id, taskId: task.id };
}

export async function getTaskStatus(taskId: string) {
  const [task] = await db
    .select({
      id: geoTasks.id,
      status: geoTasks.status,
      progress: geoTasks.progress,
      score: geoTasks.score,
      createdAt: geoTasks.createdAt,
    })
    .from(geoTasks)
    .where(eq(geoTasks.id, taskId))
    .limit(1);

  return task || null;
}

export async function getTaskResult(taskId: string) {
  const [task] = await db
    .select()
    .from(geoTasks)
    .where(eq(geoTasks.id, taskId))
    .limit(1);

  if (!task) return null;

  const [brand] = task.brandId
    ? await db.select().from(brands).where(eq(brands.id, task.brandId)).limit(1)
    : [null];

  const scores = await db
    .select()
    .from(visibilityScores)
    .where(eq(visibilityScores.taskId, taskId));

  const comps = await db
    .select()
    .from(competitors)
    .where(eq(competitors.taskId, taskId));

  const [report] = await db
    .select()
    .from(geoReports)
    .where(eq(geoReports.taskId, taskId))
    .limit(1);

  return {
    task,
    brand,
    visibility_scores: scores,
    competitors: comps,
    report,
    suggestions: task.suggestions || [],
  };
}

export async function listDiagnoseTasks(
  userId: number,
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;

  const [{ total }] = await db
    .select({ total: count() })
    .from(geoTasks)
    .where(eq(geoTasks.userId, userId));

  const rows = await db
    .select({
      id: geoTasks.id,
      status: geoTasks.status,
      platforms: geoTasks.platforms,
      createdAt: geoTasks.createdAt,
      brandName: brands.name,
    })
    .from(geoTasks)
    .leftJoin(brands, eq(geoTasks.brandId, brands.id))
    .where(eq(geoTasks.userId, userId))
    .orderBy(desc(geoTasks.createdAt))
    .limit(pageSize)
    .offset(offset);

  const list = rows.map((r) => ({
    id: r.id,
    brand: r.brandName || "未知",
    platforms: (r.platforms as string[]) || [],
    status: mapStatusForFrontend(r.status || "queued"),
    createdAt: r.createdAt
      ? new Date(r.createdAt).toLocaleString("zh-CN")
      : "",
  }));

  return { list, total: Number(total) };
}

export async function getReportById(reportId: string) {
  const [report] = await db
    .select()
    .from(geoReports)
    .where(eq(geoReports.id, reportId))
    .limit(1);
  return report || null;
}

export async function getReportByTaskId(taskId: string) {
  const [report] = await db
    .select()
    .from(geoReports)
    .where(eq(geoReports.taskId, taskId))
    .limit(1);
  return report || null;
}
