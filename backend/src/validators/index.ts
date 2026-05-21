import { z } from "zod";

// 登录请求
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

// 注册请求
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  nickname: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

// 诊断任务创建
export const diagnosisSchema = z.object({
  brand: z.string().min(1).max(100),
  keywords: z.array(z.string()).max(3).optional(),
  platforms: z.array(z.string()).min(1),
  needOptimize: z.boolean().default(false),
});

// AI写作任务创建
export const aiTaskSchema = z.object({
  name: z.string().min(1).max(100),
  articleTypeId: z.number().optional(),
  keywordId: z.number().optional(),
  imageTypeId: z.number().optional(),
  imageCount: z.number().min(0).max(10).default(0),
  intervalTime: z.number().min(0).default(0),
  maxCount: z.number().min(1).default(1),
});

// 文章创建
export const articleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  summary: z.string().optional(),
  articleTypeId: z.number().optional(),
  images: z.array(z.string()).optional(),
});

// 发布请求
export const publishSchema = z.object({
  articleId: z.number(),
  platform: z.enum(["webmedia", "zimedia", "weixin", "site"]),
  platformConfig: z.record(z.any()).optional(),
});
