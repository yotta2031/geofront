import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: process.env.ENV_FILE });
dotenv.config({ path: join(__dirname, "../../.env") });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL 未配置，请在 backend/.env 中设置 PostgreSQL 连接串");
}

const pool = new pg.Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("PostgreSQL 连接池错误:", err);
});

export const db = drizzle(pool, { schema });
export { pool };
