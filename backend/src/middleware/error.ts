import type { Context, ErrorHandler } from "hono";
import { ZodError } from "zod";

export const errorHandler: ErrorHandler = (err, c: Context) => {
  console.error("Error:", err);

  if (err instanceof ZodError) {
    return c.json(
      {
        code: 0,
        msg: "参数校验失败",
        data: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      400
    );
  }

  if (err instanceof Error) {
    return c.json(
      {
        code: 0,
        msg: err.message || "服务器内部错误",
        data: process.env.NODE_ENV === "development" ? err.stack : null,
      },
      500
    );
  }

  return c.json({ code: 0, msg: "未知错误", data: null }, 500);
};
