# Temporal Worker（规划）

规格要求使用 Temporal 编排 GEO 诊断长任务。当前版本使用 `app/workers/diagnoseWorker.ts` 进程内异步执行，API 与数据模型已对齐。

后续迁移步骤：

1. 将 `runDiagnoseWorker` 拆为 Temporal Activities
2. 在 `temporal/workflow.py` 定义诊断工作流
3. 使用 `python temporal/worker.py` 或 Node Temporal SDK 启动 Worker
