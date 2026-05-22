import { Hono } from "hono";
import type { AppEnv } from "../../../types.js";

export const v1BillingRoutes = new Hono<AppEnv>();

v1BillingRoutes.post("/pay", async (c) => {
  const body = await c.req.json();
  // 支付对接占位，保持 API 契约
  return c.json({
    order_id: `order_${Date.now()}`,
    status: "pending",
    amount: body.amount || 0,
  });
});
