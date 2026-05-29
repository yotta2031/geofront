import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  boolean,
  timestamp,
  doublePrecision,
  uuid,
  jsonb,
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
  role: varchar("role", { length: 30 }).default("client"),
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

// 网站媒体库
export const webMedia = pgTable("web_media", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  industry: varchar("industry", { length: 50 }),
  portal: varchar("portal", { length: 50 }),
  region: varchar("region", { length: 50 }),
  entryLevel: varchar("entry_level", { length: 30 }),
  indexWeb: varchar("index_web", { length: 30 }),
  indexNews: varchar("index_news", { length: 30 }),
  linkType: varchar("link_type", { length: 30 }),
  publishSpeed: varchar("publish_speed", { length: 30 }),
  specialIndustry: varchar("special_industry", { length: 30 }),
  weekendPublish: boolean("weekend_publish").default(false),
  holidayPublish: boolean("holiday_publish").default(false),
  nightPublish: boolean("night_publish").default(false),
  hasTextLink: boolean("has_text_link").default(false),
  whitelistSource: boolean("whitelist_source").default(false),
  hasVideo: boolean("has_video").default(false),
  mobileMedia: boolean("mobile_media").default(false),
  longValidity: boolean("long_validity").default(false),
  geoRankable: boolean("geo_rankable").default(false),
  price: doublePrecision("price").notNull().default(0),
  pcWeight: integer("pc_weight").default(0),
  mobileWeight: integer("mobile_weight").default(0),
  successRate: integer("success_rate").default(0),
  publishTimeMinutes: integer("publish_time_minutes").default(0),
  remark: text("remark"),
  tags: jsonb("tags").$type<string[]>().default([]),
  caseUrl: text("case_url"),
  status: integer("status").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 网站媒体收藏分组
export const webMediaFavoriteGroups = pgTable("web_media_favorite_groups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 网站媒体收藏
export const webMediaFavorites = pgTable("web_media_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mediaId: integer("media_id")
    .notNull()
    .references(() => webMedia.id, { onDelete: "cascade" }),
  groupId: integer("group_id").references(() => webMediaFavoriteGroups.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 网站媒体投稿记录
export const webMediaSubmissions = pgTable("web_media_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mediaId: integer("media_id")
    .notNull()
    .references(() => webMedia.id),
  articleId: integer("article_id"),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  price: doublePrecision("price").default(0),
  status: varchar("status", { length: 20 }).default("pending"),
  publishUrl: text("publish_url"),
  errorMsg: text("error_msg"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

// 网站媒体 AI 发布任务
export const webMediaPublishTasks = pgTable("web_media_publish_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  articleIds: jsonb("article_ids").$type<number[]>().default([]),
  mediaIds: jsonb("media_ids").$type<number[]>().default([]),
  publishType: varchar("publish_type", { length: 20 }).default("immediate"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  status: varchar("status", { length: 20 }).default("pending"),
  totalCount: integer("total_count").default(0),
  successCount: integer("success_count").default(0),
  failCount: integer("fail_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// 个人自媒体 - 设备授权码（每用户一个）
export const weixinDeviceAuth = pgTable("weixin_device_auth", {
  userId: integer("user_id").primaryKey(),
  authCode: varchar("auth_code", { length: 20 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 个人自媒体 - 已授权账号
export const weixinAccounts = pgTable("weixin_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountName: varchar("account_name", { length: 200 }).notNull(),
  avatar: text("avatar"),
  platform: varchar("platform", { length: 50 }).notNull(),
  platformUid: varchar("platform_uid", { length: 100 }),
  publishEnabled: boolean("publish_enabled").default(true),
  fansCount: integer("fans_count").default(0),
  maxDailyPublish: integer("max_daily_publish").default(5),
  proxyIpPort: varchar("proxy_ip_port", { length: 100 }),
  proxyAuth: varchar("proxy_auth", { length: 200 }),
  remark: varchar("remark", { length: 500 }),
  authStatus: varchar("auth_status", { length: 20 }).default("authorized"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 个人自媒体 - 发布任务
export const weixinPublishTasks = pgTable("weixin_publish_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  articleIds: jsonb("article_ids").$type<number[]>().default([]),
  accountIds: jsonb("account_ids").$type<number[]>().default([]),
  publishType: varchar("publish_type", { length: 20 }).default("immediate"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  status: varchar("status", { length: 20 }).default("pending"),
  totalCount: integer("total_count").default(0),
  successCount: integer("success_count").default(0),
  failCount: integer("fail_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// 个人自媒体 - 发布记录
export const weixinPublishRecords = pgTable("weixin_publish_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountId: integer("account_id").references(() => weixinAccounts.id),
  articleId: integer("article_id"),
  taskId: integer("task_id"),
  title: varchar("title", { length: 500 }).notNull(),
  platform: varchar("platform", { length: 50 }),
  accountName: varchar("account_name", { length: 200 }),
  status: varchar("status", { length: 20 }).default("pending"),
  publishUrl: text("publish_url"),
  errorMsg: text("error_msg"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 自媒体大V - 账号
export const zimediaAccounts = pgTable("zimedia_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountName: varchar("account_name", { length: 200 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  avatar: text("avatar"),
  fansCount: integer("fans_count").default(0),
  category: varchar("category", { length: 50 }).default("其他"),
  quotePrice: integer("quote_price").default(0),
  maxDailyPublish: integer("max_daily_publish").default(5),
  proxyIpPort: varchar("proxy_ip_port", { length: 200 }),
  proxyAuth: varchar("proxy_auth", { length: 200 }),
  remark: text("remark"),
  publishEnabled: boolean("publish_enabled").default(true),
  coopStatus: varchar("coop_status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 自媒体大V - 发布任务
export const zimediaPublishTasks = pgTable("zimedia_publish_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  articleIds: jsonb("article_ids").$type<number[]>().notNull(),
  accountIds: jsonb("account_ids").$type<number[]>().notNull(),
  publishType: varchar("publish_type", { length: 20 }).default("immediate"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  status: varchar("status", { length: 20 }).default("pending"),
  totalCount: integer("total_count").default(0),
  successCount: integer("success_count").default(0),
  failCount: integer("fail_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// 自媒体大V - 发布记录
export const zimediaPublishRecords = pgTable("zimedia_publish_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountId: integer("account_id").references(() => zimediaAccounts.id),
  articleId: integer("article_id"),
  taskId: integer("task_id"),
  title: varchar("title", { length: 500 }).notNull(),
  platform: varchar("platform", { length: 50 }),
  accountName: varchar("account_name", { length: 200 }),
  status: varchar("status", { length: 20 }).default("pending"),
  publishUrl: text("publish_url"),
  errorMsg: text("error_msg"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// AI官网SEO - 站点
export const siteWebsites = pgTable("site_websites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  siteName: varchar("site_name", { length: 200 }).notNull(),
  siteUrl: varchar("site_url", { length: 500 }).notNull(),
  cmsType: varchar("cms_type", { length: 50 }).default("WordPress"),
  apiEndpoint: varchar("api_endpoint", { length: 500 }),
  apiKey: varchar("api_key", { length: 500 }),
  sitemapUrl: varchar("sitemap_url", { length: 500 }),
  maxDailyPublish: integer("max_daily_publish").default(5),
  publishEnabled: boolean("publish_enabled").default(true),
  connectStatus: varchar("connect_status", { length: 20 }).default("connected"),
  seoScore: integer("seo_score").default(0),
  remark: text("remark"),
  lastPublishAt: timestamp("last_publish_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// AI官网SEO - 发布任务
export const sitePublishTasks = pgTable("site_publish_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  articleIds: jsonb("article_ids").$type<number[]>().notNull(),
  siteIds: jsonb("site_ids").$type<number[]>().notNull(),
  publishType: varchar("publish_type", { length: 20 }).default("immediate"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  status: varchar("status", { length: 20 }).default("pending"),
  totalCount: integer("total_count").default(0),
  successCount: integer("success_count").default(0),
  failCount: integer("fail_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// AI官网SEO - 发布记录
export const sitePublishRecords = pgTable("site_publish_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  siteId: integer("site_id").references(() => siteWebsites.id),
  articleId: integer("article_id"),
  taskId: integer("task_id"),
  title: varchar("title", { length: 500 }).notNull(),
  siteName: varchar("site_name", { length: 200 }),
  siteUrl: varchar("site_url", { length: 500 }),
  status: varchar("status", { length: 20 }).default("pending"),
  publishUrl: text("publish_url"),
  errorMsg: text("error_msg"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
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

// ========== GEO 规格表（.rule/all.txt） ==========

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id"),
  name: varchar("name", { length: 255 }).notNull(),
  aliases: jsonb("aliases").$type<string[]>().default([]),
  industry: varchar("industry", { length: 255 }),
  website: text("website"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const geoTasks = pgTable("geo_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").notNull(),
  brandId: uuid("brand_id").references(() => brands.id),
  status: varchar("status", { length: 30 }).default("queued"),
  progress: integer("progress").default(0),
  score: doublePrecision("score"),
  platforms: jsonb("platforms").$type<string[]>().default([]),
  keywords: text("keywords"),
  industry: varchar("industry", { length: 255 }),
  needOptimize: boolean("need_optimize").default(false),
  suggestions: jsonb("suggestions").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const llmResponses = pgTable("llm_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => geoTasks.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(),
  query: text("query").notNull(),
  response: text("response").notNull(),
  latencyMs: integer("latency_ms").default(0),
  tokens: integer("tokens").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const visibilityScores = pgTable("visibility_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => geoTasks.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(),
  mentionRate: doublePrecision("mention_rate").default(0),
  positiveRate: doublePrecision("positive_rate").default(0),
  rankScore: doublePrecision("rank_score").default(0),
  sentimentScore: doublePrecision("sentiment_score").default(0),
});

export const competitors = pgTable("competitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => geoTasks.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  score: doublePrecision("score").default(0),
});

export const geoReports = pgTable("geo_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => geoTasks.id, { onDelete: "cascade" }),
  htmlUrl: text("html_url"),
  pdfUrl: text("pdf_url"),
  htmlContent: text("html_content"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
