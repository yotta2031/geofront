import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

const { db, pool } = await import("./index.js");
const { users } = await import("./schema.js");
const { hashPassword } = await import("../utils/auth.js");

const DEFAULT_ADMIN = {
  username: "admin",
  password: "123456",
  nickname: "管理员",
  score: 390,
  balance: 0.5,
  storageUsed: 304,
  storageTotal: 1000,
  vipExpire: "2027-01-15",
};

async function seed() {
  console.log("正在连接 PostgreSQL...");
  await pool.query("SELECT 1");

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, DEFAULT_ADMIN.username))
    .limit(1);

  if (existing.length > 0) {
    console.log("管理员账号已存在，跳过创建");
    return;
  }

  const hashed = await hashPassword(DEFAULT_ADMIN.password);
  await db.insert(users).values({
    username: DEFAULT_ADMIN.username,
    password: hashed,
    nickname: DEFAULT_ADMIN.nickname,
    score: DEFAULT_ADMIN.score,
    balance: DEFAULT_ADMIN.balance,
    storageUsed: DEFAULT_ADMIN.storageUsed,
    storageTotal: DEFAULT_ADMIN.storageTotal,
    vipExpire: DEFAULT_ADMIN.vipExpire,
    status: 1,
  });

  console.log("✅ 默认管理员已创建");
  console.log(`   账号: ${DEFAULT_ADMIN.username}`);
  console.log(`   密码: ${DEFAULT_ADMIN.password}`);
}

seed()
  .catch((err) => {
    console.error("❌ 初始化失败:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
