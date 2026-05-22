import { z } from "zod";

export const v1DiagnoseSchema = z.object({
  brand: z.string().min(1).max(255),
  aliases: z.array(z.string()).optional(),
  industry: z.string().optional(),
  generate_suggestion: z.boolean().optional(),
});

export const legacyDiagnoseSchema = z.object({
  brand: z.string().min(1).max(200),
  platforms: z.array(z.string()).min(1),
  keywords: z.array(z.string()).max(3).optional(),
  needOptimize: z.boolean().optional(),
});
