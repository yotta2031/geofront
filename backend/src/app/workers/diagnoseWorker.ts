import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  geoTasks,
  llmResponses,
  visibilityScores,
  competitors,
  geoReports,
  brands,
} from "../../db/schema.js";
import { generateQueries } from "../geo/queryGenerator.js";
import { analyzeResponse, calcFinalScore } from "../geo/scorer.js";
import { generateSuggestions } from "../geo/suggester.js";
import { getProviderWithFallback } from "../llm/providers.js";
import { generateReportHtml } from "../reports/generator.js";
import { setTaskProgress } from "../core/progress.js";

const MAX_QUERIES_PER_PROVIDER = 5;
const RETRY = 3;
const TIMEOUT_MS = 30000;

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let last: unknown;
  for (let i = 0; i < RETRY; i++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error("timeout")), TIMEOUT_MS)
        ),
      ]);
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

export async function runDiagnoseWorker(taskId: string) {
  const [task] = await db
    .select()
    .from(geoTasks)
    .where(eq(geoTasks.id, taskId))
    .limit(1);

  if (!task) return;

  const [brand] = task.brandId
    ? await db.select().from(brands).where(eq(brands.id, task.brandId)).limit(1)
    : [null];

  const brandName = brand?.name || "未知品牌";
  const industry = task.industry || brand?.industry || "通用行业";
  const platforms = (task.platforms as string[]) || ["deepseek"];

  const updateStatus = async (status: string, progress: number) => {
    await db
      .update(geoTasks)
      .set({ status, progress })
      .where(eq(geoTasks.id, taskId));
    setTaskProgress(taskId, { status, progress });
  };

  try {
    await updateStatus("running", 10);

    const queries = generateQueries({
      brand: brandName,
      industry,
      keywords: task.keywords?.split(",").filter(Boolean),
    });

    await updateStatus("analyzing", 25);

    const providerInstances = getProviderWithFallback(platforms);
    const allScores: number[] = [];
    const competitorMap = new Map<string, number>();

    let done = 0;
    const total = providerInstances.length * MAX_QUERIES_PER_PROVIDER;

    for (const provider of providerInstances) {
      const sampleQueries = queries.slice(0, MAX_QUERIES_PER_PROVIDER);

      for (const query of sampleQueries) {
        let result;
        try {
          result = await withRetry(() => provider.complete(query));
        } catch {
          const fallback = getProviderWithFallback(["deepseek"])[0];
          result = await fallback.complete(query);
        }

        await db.insert(llmResponses).values({
          taskId,
          provider: provider.name,
          query,
          response: result.text,
          latencyMs: result.latencyMs,
          tokens: result.tokens,
        });

        const analysis = analyzeResponse(brandName, result.text, industry);
        await db.insert(visibilityScores).values({
          taskId,
          provider: provider.name,
          mentionRate: analysis.mentionRate,
          positiveRate: analysis.positiveRate,
          rankScore: analysis.rankScore,
          sentimentScore: analysis.sentimentScore,
        });

        for (const comp of analysis.competitors) {
          competitorMap.set(comp, (competitorMap.get(comp) || 0) + 1);
        }

        allScores.push(
          calcFinalScore({
            mentionRate: analysis.mentionRate,
            recommendationRate: analysis.positiveRate,
            rankWeight: analysis.rankScore,
            sentiment: analysis.sentimentScore,
            stability: 70,
          })
        );

        done++;
        await updateStatus("analyzing", 25 + Math.floor((done / total) * 50));
      }
    }

    await updateStatus("reporting", 85);

    const avgScore =
      allScores.length > 0
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
        : 0;

    const mentionAvg =
      allScores.length > 0 ? Math.min(100, avgScore * 1.1) : 0;

    const tips = task.needOptimize
      ? generateSuggestions({
          mentionRate: mentionAvg,
          competitorRate: competitorMap.size * 10,
          selfRate: avgScore,
          brand: brandName,
        })
      : [];

    for (const [name, score] of competitorMap) {
      await db.insert(competitors).values({
        taskId,
        name,
        score: score * 10,
      });
    }

    const scores = await db
      .select()
      .from(visibilityScores)
      .where(eq(visibilityScores.taskId, taskId));

    const providerStats = platforms.map((p) => {
      const rows = scores.filter((s) => s.provider === p);
      const avg = (pick: (r: (typeof rows)[0]) => number) =>
        rows.length
          ? rows.reduce((sum, r) => sum + pick(r), 0) / rows.length
          : 0;
      return {
        name: p,
        mentionRate: avg((r) => Number(r.mentionRate) || 0),
        positiveRate: avg((r) => Number(r.positiveRate) || 0),
        rankScore: avg((r) => Number(r.rankScore) || 0),
      };
    });

    const compRows = await db
      .select()
      .from(competitors)
      .where(eq(competitors.taskId, taskId));

    const html = generateReportHtml({
      brand: brandName,
      industry,
      score: avgScore,
      providers: providerStats,
      competitors: compRows.map((c) => ({
        name: c.name,
        score: Number(c.score) || 0,
      })),
      suggestions: tips,
    });

    await db.insert(geoReports).values({
      taskId,
      htmlContent: html,
      htmlUrl: `/report/${taskId}.html`,
      pdfUrl: `/report/${taskId}.pdf`,
    });

    await db
      .update(geoTasks)
      .set({
        status: "completed",
        progress: 100,
        score: avgScore,
        suggestions: tips,
        completedAt: new Date(),
      })
      .where(eq(geoTasks.id, taskId));

    setTaskProgress(taskId, { status: "completed", progress: 100 });
  } catch (err) {
    console.error("Diagnose worker failed:", err);
    await db
      .update(geoTasks)
      .set({ status: "failed", progress: 0 })
      .where(eq(geoTasks.id, taskId));
    setTaskProgress(taskId, { status: "failed", progress: 0 });
  }
}
