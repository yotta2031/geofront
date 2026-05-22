import { Hono } from "hono";
import type { AppEnv } from "../../../types.js";
import { createBrand, listBrands } from "../../services/brandService.js";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});

export const v1BrandRoutes = new Hono<AppEnv>();

v1BrandRoutes.post("/brands", async (c) => {
  const body = await c.req.json();
  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ code: 0, msg: "参数错误" }, 400);
  }
  const row = await createBrand(c.get("user").userId, parsed.data);
  return c.json(row, 201);
});

v1BrandRoutes.get("/brands", async (c) => {
  const page = Number(c.req.query("page") || 1);
  const pageSize = Number(c.req.query("pageSize") || 20);
  const data = await listBrands(c.get("user").userId, page, pageSize);
  return c.json(data);
});
