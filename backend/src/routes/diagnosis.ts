import { Hono } from "hono";

export const diagnosisRoutes = new Hono();

// AI可见度诊断 - 创建诊断任务
diagnosisRoutes.post("/", async (c) => {
  const body = await c.req.json();
  // TODO: 创建诊断任务
  return c.json({ code: 1, msg: "诊断任务已创建", data: { taskId: "mock-task-id" } });
});

// 获取诊断报告列表
diagnosisRoutes.get("/", async (c) => {
  // TODO: 查询诊断报告列表
  return c.json({ code: 1, data: { list: [], total: 0 } });
});

// 获取单条诊断报告详情
diagnosisRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  // TODO: 查询诊断报告详情
  return c.json({
    code: 1,
    data: {
      id,
      brand: "示例品牌",
      platforms: ["deepseek", "doubao"],
      status: "completed",
      result: null,
    },
  });
});
