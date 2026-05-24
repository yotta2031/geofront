import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import {
  createKeyword,
  updateKeyword,
  listKeywords,
  getKeyword,
  deleteKeyword,
} from "../app/services/keywordService.js";
import {
  createArticleType,
  updateArticleType,
  listArticleTypes,
  getArticleType,
  deleteArticleType,
} from "../app/services/articleTypeService.js";
import {
  createKeywordSchema,
  updateKeywordSchema,
} from "../app/schemas/keyword.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/response.js";

export const articleRoutes = new Hono<AppEnv>();

// ==================== 关键词管理 ====================

/** 获取关键词列表（分页 + 搜索） */
articleRoutes.get("/keywords", async (c) => {
  const userId = c.get("user").userId;
  const page = Number(c.req.query("page") || 1);
  const pageSize = Number(c.req.query("pageSize") || 10);
  const search = c.req.query("search");

  try {
    const { list, total } = await listKeywords(userId, page, pageSize, search);
    return c.json(paginatedResponse(list, total, page, pageSize));
  } catch (err: any) {
    return c.json(errorResponse(err.message || "查询关键词失败"), 500);
  }
});

/** 创建关键词 */
articleRoutes.post("/keywords", async (c) => {
  const userId = c.get("user").userId;
  const body = await c.req.json();

  const parsed = createKeywordSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse(parsed.error.errors[0]?.message || "参数校验失败"), 400);
  }

  try {
    const row = await createKeyword(userId, parsed.data);
    return c.json(successResponse(row, "添加成功"));
  } catch (err: any) {
    return c.json(errorResponse(err.message || "添加关键词失败"), 500);
  }
});

/** 更新关键词 */
articleRoutes.put("/keywords/:id", async (c) => {
  const userId = c.get("user").userId;
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  const parsed = updateKeywordSchema.safeParse({ ...body, id });
  if (!parsed.success) {
    return c.json(errorResponse(parsed.error.errors[0]?.message || "参数校验失败"), 400);
  }

  try {
    const row = await updateKeyword(userId, id, parsed.data);
    if (!row) {
      return c.json(errorResponse("关键词不存在"), 404);
    }
    return c.json(successResponse(row, "更新成功"));
  } catch (err: any) {
    return c.json(errorResponse(err.message || "更新关键词失败"), 500);
  }
});

/** 获取单个关键词 */
articleRoutes.get("/keywords/:id", async (c) => {
  const userId = c.get("user").userId;
  const id = Number(c.req.param("id"));

  try {
    const row = await getKeyword(userId, id);
    if (!row) {
      return c.json(errorResponse("关键词不存在"), 404);
    }
    return c.json(successResponse(row));
  } catch (err: any) {
    return c.json(errorResponse(err.message || "查询关键词失败"), 500);
  }
});

/** 删除关键词 */
articleRoutes.delete("/keywords/:id", async (c) => {
  const userId = c.get("user").userId;
  const id = Number(c.req.param("id"));

  try {
    const row = await deleteKeyword(userId, id);
    if (!row) {
      return c.json(errorResponse("关键词不存在"), 404);
    }
    return c.json(successResponse(null, "删除成功"));
  } catch (err: any) {
    return c.json(errorResponse(err.message || "删除关键词失败"), 500);
  }
});

// 写作标题
articleRoutes.get("/questions", async (c) => {
  return c.json({ code: 1, data: { list: [], total: 0 } });
});

// 文章分类
articleRoutes.get("/types", async (c) => {
  const userId = c.get("user").userId;
  const page = Number(c.req.query("page") || 1);
  const pageSize = Number(c.req.query("pageSize") || 10);
  const search = c.req.query("search");

  try {
    const { list, total } = await listArticleTypes(userId, page, pageSize, search);
    return c.json(paginatedResponse(list, total, page, pageSize));
  } catch (err: any) {
    return c.json(errorResponse(err.message || "查询文章分类失败"), 500);
  }
});

articleRoutes.post("/types", async (c) => {
  const userId = c.get("user").userId;
  const body = await c.req.json();

  if (!body.name) {
    return c.json(errorResponse("分类名称不能为空"), 400);
  }

  try {
    const row = await createArticleType(userId, {
      name: body.name,
      description: body.description,
    });
    return c.json(successResponse(row, "创建成功"));
  } catch (err: any) {
    return c.json(errorResponse(err.message || "创建文章分类失败"), 500);
  }
});

articleRoutes.put("/types/:id", async (c) => {
  const userId = c.get("user").userId;
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  try {
    const row = await updateArticleType(userId, id, body);
    if (!row) {
      return c.json(errorResponse("文章分类不存在"), 404);
    }
    return c.json(successResponse(row, "更新成功"));
  } catch (err: any) {
    return c.json(errorResponse(err.message || "更新文章分类失败"), 500);
  }
});

articleRoutes.delete("/types/:id", async (c) => {
  const userId = c.get("user").userId;
  const id = Number(c.req.param("id"));

  try {
    const row = await deleteArticleType(userId, id);
    if (!row) {
      return c.json(errorResponse("文章分类不存在"), 404);
    }
    return c.json(successResponse(null, "删除成功"));
  } catch (err: any) {
    return c.json(errorResponse(err.message || "删除文章分类失败"), 500);
  }
});

// AI写作任务
articleRoutes.get("/tasks", async (c) => {
  return c.json({ code: 1, data: { list: [], total: 0 } });
});

articleRoutes.post("/tasks", async (c) => {
  const body = await c.req.json();
  return c.json({ code: 1, msg: "任务创建成功", data: { taskId: "mock-task-id" } });
});

// 文章列表
articleRoutes.get("/", async (c) => {
  return c.json({ code: 1, data: { list: [], total: 0 } });
});

articleRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  return c.json({ code: 1, data: { id, title: "示例文章", content: "" } });
});
