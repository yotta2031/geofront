import { z } from "zod";

/** 创建关键词 */
export const createKeywordSchema = z.object({
  keyword: z.string().min(1, "关键词不能为空").max(200),
  hitWord: z.string().max(200).optional().default(""),
  preKeywords: z.string().optional().default(""),
  nextKeywords: z.string().optional().default(""),
  type: z.enum(["default", "core", "longtail"]).optional().default("default"),
});

/** 更新关键词 */
export const updateKeywordSchema = z.object({
  id: z.number().positive("ID 必须为正整数"),
  keyword: z.string().min(1).max(200),
  hitWord: z.string().max(200).optional().default(""),
  preKeywords: z.string().optional().default(""),
  nextKeywords: z.string().optional().default(""),
  type: z.enum(["default", "core", "longtail"]).optional().default("default"),
});

/** 手动拓词请求 */
export const manualExpandSchema = z.object({
  keyword: z.string().min(1, "关键词不能为空").max(200),
  rule: z.enum(["prefix", "suffix", "combine"]),
});

export type CreateKeywordInput = z.infer<typeof createKeywordSchema>;
export type UpdateKeywordInput = z.infer<typeof updateKeywordSchema>;
