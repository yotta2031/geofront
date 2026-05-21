import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 用户表
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nickname: text("nickname"),
  avatar: text("avatar"),
  email: text("email"),
  phone: text("phone"),
  score: integer("score", { mode: "number" }).default(0),
  balance: real("balance").default(0),
  storageUsed: integer("storage_used", { mode: "number" }).default(0),
  storageTotal: integer("storage_total", { mode: "number" }).default(1000),
  vipExpire: text("vip_expire"),
  status: integer("status", { mode: "number" }).default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 诊断任务表
export const diagnosisTasks = sqliteTable("diagnosis_tasks", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  brand: text("brand").notNull(),
  keywords: text("keywords"), // JSON array
  platforms: text("platforms").notNull(), // JSON array
  needOptimize: integer("need_optimize", { mode: "boolean" }).default(false),
  status: text("status").default("pending"), // pending, running, completed, failed
  result: text("result"), // JSON
  score: integer("score", { mode: "number" }).default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
});

// 关键词表
export const keywords = sqliteTable("keywords", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  companyId: integer("company_id", { mode: "number" }),
  keyword: text("keyword").notNull(),
  hitWord: text("hit_word"),
  preKeywords: text("pre_keywords"),
  nextKeywords: text("next_keywords"),
  expandKeywords: text("expand_keywords"),
  type: text("type").default("default"),
  status: integer("status", { mode: "number" }).default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 文章分类表
export const articleTypes = sqliteTable("article_types", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: integer("status", { mode: "number" }).default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// AI写作任务表
export const aiTasks = sqliteTable("ai_tasks", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  name: text("name").notNull(),
  articleTypeId: integer("article_type_id", { mode: "number" }),
  keywordId: integer("keyword_id", { mode: "number" }),
  imageTypeId: integer("image_type_id", { mode: "number" }),
  imageCount: integer("image_count", { mode: "number" }).default(0),
  intervalTime: integer("interval_time", { mode: "number" }).default(0),
  maxCount: integer("max_count", { mode: "number" }).default(0),
  maxErrorCount: integer("max_error_count", { mode: "number" }).default(3),
  errorCount: integer("error_count", { mode: "number" }).default(0),
  status: text("status").default("pending"),
  message: text("message"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 文章表
export const articles = sqliteTable("articles", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  taskId: integer("task_id", { mode: "number" }),
  title: text("title").notNull(),
  content: text("content"),
  summary: text("summary"),
  images: text("images"), // JSON array
  status: text("status").default("draft"), // draft, published, archived
  publishPlatforms: text("publish_platforms"), // JSON array
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 发布记录表
export const publishRecords = sqliteTable("publish_records", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  articleId: integer("article_id", { mode: "number" }).notNull(),
  platform: text("platform").notNull(), // webmedia, zimedia, weixin, site
  platformName: text("platform_name"),
  status: text("status").default("pending"), // pending, published, failed
  url: text("url"),
  errorMsg: text("error_msg"),
  publishedAt: text("published_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 点数消费记录表
export const scoreLogs = sqliteTable("score_logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  type: text("type").notNull(), // consume, recharge, refund
  score: integer("score", { mode: "number" }).notNull(),
  balance: integer("balance", { mode: "number" }).notNull(),
  remark: text("remark"),
  relatedId: integer("related_id", { mode: "number" }),
  relatedType: text("related_type"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 余额消费记录表
export const moneyLogs = sqliteTable("money_logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id", { mode: "number" }).notNull(),
  type: text("type").notNull(), // consume, recharge, refund
  amount: real("amount").notNull(),
  balance: real("balance").notNull(),
  remark: text("remark"),
  relatedId: integer("related_id", { mode: "number" }),
  relatedType: text("related_type"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
