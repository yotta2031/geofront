import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  boolean,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";

// 用户表
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  nickname: varchar("nickname", { length: 100 }),
  avatar: text("avatar"),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  score: integer("score").default(0),
  balance: doublePrecision("balance").default(0),
  storageUsed: integer("storage_used").default(0),
  storageTotal: integer("storage_total").default(1000),
  vipExpire: varchar("vip_expire", { length: 20 }),
  status: integer("status").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 诊断任务表
export const diagnosisTasks = pgTable("diagnosis_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  brand: varchar("brand", { length: 200 }).notNull(),
  keywords: text("keywords"),
  platforms: text("platforms").notNull(),
  needOptimize: boolean("need_optimize").default(false),
  status: varchar("status", { length: 20 }).default("pending"),
  result: text("result"),
  score: integer("score").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// 关键词表
export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  companyId: integer("company_id"),
  keyword: varchar("keyword", { length: 200 }).notNull(),
  hitWord: varchar("hit_word", { length: 200 }),
  preKeywords: text("pre_keywords"),
  nextKeywords: text("next_keywords"),
  expandKeywords: text("expand_keywords"),
  type: varchar("type", { length: 50 }).default("default"),
  status: integer("status").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 文章分类表
export const articleTypes = pgTable("article_types", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  status: integer("status").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// AI写作任务表
export const aiTasks = pgTable("ai_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  articleTypeId: integer("article_type_id"),
  keywordId: integer("keyword_id"),
  imageTypeId: integer("image_type_id"),
  imageCount: integer("image_count").default(0),
  intervalTime: integer("interval_time").default(0),
  maxCount: integer("max_count").default(0),
  maxErrorCount: integer("max_error_count").default(3),
  errorCount: integer("error_count").default(0),
  status: varchar("status", { length: 20 }).default("pending"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 文章表
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id"),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  summary: text("summary"),
  images: text("images"),
  status: varchar("status", { length: 20 }).default("draft"),
  publishPlatforms: text("publish_platforms"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 发布记录表
export const publishRecords = pgTable("publish_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  articleId: integer("article_id").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  platformName: varchar("platform_name", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending"),
  url: text("url"),
  errorMsg: text("error_msg"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 点数消费记录表
export const scoreLogs = pgTable("score_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  score: integer("score").notNull(),
  balance: integer("balance").notNull(),
  remark: text("remark"),
  relatedId: integer("related_id"),
  relatedType: varchar("related_type", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 余额消费记录表
export const moneyLogs = pgTable("money_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  amount: doublePrecision("amount").notNull(),
  balance: doublePrecision("balance").notNull(),
  remark: text("remark"),
  relatedId: integer("related_id"),
  relatedType: varchar("related_type", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
