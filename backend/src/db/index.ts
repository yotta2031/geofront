import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

const dbPath = process.env.DATABASE_URL || "./data/geo-crm.db";

// 确保数据目录存在
import { mkdirSync } from "fs";
import { dirname } from "path";

try {
  mkdirSync(dirname(dbPath), { recursive: true });
} catch {
  // 目录已存在
}

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
