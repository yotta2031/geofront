# 架构说明（对齐 `.rule/all.txt`）

## 原则

- **前端**：保持现有 Vue3 + Vite + Element Plus UI，不改动页面与交互
- **后端**：在现有 Hono + PostgreSQL 上实现 GEO 规格的数据模型与 API 契约
- **兼容层**：`/api/diagnosis` 等旧接口映射到 GEO 任务流水线

## 目录结构（后端）

```plaintext
backend/src/app/
 ├── api/v1/          # 规格 API：/api/v1/diagnose、tasks、brands、pay
 ├── core/            # 进度缓存（可换 Redis）
 ├── geo/             # queryGenerator、scorer、suggester、ner
 ├── llm/             # Provider 适配（LiteLLM / 规则引擎）
 ├── workers/         # diagnoseWorker 异步诊断
 ├── reports/         # HTML 报告生成
 ├── services/        # diagnoseService、brandService
 └── schemas/         # Zod 校验
```

## 数据库（PostgreSQL）

| 规格表 | 项目表名 |
|--------|----------|
| brands | `brands` |
| geo_tasks | `geo_tasks` |
| llm_responses | `llm_responses` |
| visibility_scores | `visibility_scores` |
| competitors | `competitors` |
| reports | `geo_reports` |

保留原有 CRM 表：`users`、`articles`、`keywords` 等。

## API 映射

### 规格 API（新）

- `POST /api/v1/diagnose`
- `GET /api/v1/tasks/{id}`
- `GET /api/v1/tasks/{id}/result`
- `GET /api/v1/reports/{id}`
- `POST/GET /api/v1/brands`
- `POST /api/v1/pay`
- `GET /report/{task_id}.html`
- `GET /api/v1/ws/tasks/{id}`（SSE 进度流）

### 前端兼容 API（不变）

- `POST /api/diagnosis` → 创建 `geo_tasks`
- `GET /api/diagnosis` → 列表
- `GET /api/diagnosis/:id` → 详情 + 评分 + 报告

## 诊断流水线

1. Query Generator 生成最多 100 条查询
2. 多 Provider 并发（超时 30s、重试 3 次、fallback）
3. Scorer 计算可见度与综合分
4. Suggester 生成优化建议（可选）
5. 写入报告 HTML → `/report/{task_id}.html`

## 后续扩展

- Temporal：`backend/temporal/README.md`
- Redis 进度、ClickHouse 分析、Milvus 向量检索
- LiteLLM 网关：配置 `LITELLM_BASE_URL`
