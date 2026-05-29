import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { count, eq } from "drizzle-orm";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

const SAMPLE_ACCOUNTS = [
  {
    accountName: "森林响起的鸟鸣",
    platform: "头条号",
    avatar:
      "https://sf3-cdn-tos.toutiaostatic.com/img/user-avatar/9cba58469ee67551250351e63c00d7ab~300x300.image",
    fansCount: 1200,
  },
  {
    accountName: "大虎",
    platform: "搜狐",
    avatar: "https://q9.itc.cn/q_70/images03/20260402/3e3482c16ff947b6984445396baaad08.jpeg",
    fansCount: 860,
  },
  {
    accountName: "再 我一直都在",
    platform: "小红书",
    avatar:
      "https://img.xiaohongshu.com/avatar/1040g2jo31t0jmui162e05n7knumlioinp9diccg!750w_750h_92q_1e_1c_1x.jpg",
    fansCount: 3200,
  },
  {
    accountName: "灵雯GEO官方",
    platform: "公众号",
    avatar:
      "https://wx.qlogo.cn/mmopen/aRXPhC0Wk4XGf95H5WySJdngtmjbSic990GpLLMPwUYfY9Ls5Wtq4z1RqXupABDvGWxt9M6w927PhTf0BEsBWK538f6pkFzibwCAb04hc6oSuZXy9Z7N3OfWe0DfZYmicL8/64",
    fansCount: 5600,
  },
  {
    accountName: "GEO观察员",
    platform: "知乎",
    avatar:
      "https://picx.zhimg.com/v2-25ac7c0d6225fc37e7f4419d75895b22_xl.jpg",
    fansCount: 980,
  },
];

async function seedWeixin() {
  const { db, pool } = await import("./index.js");
  const { weixinAccounts, users } = await import("./schema.js");

  await pool.query("SELECT 1");
  const [admin] = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
  if (!admin) {
    console.log("未找到 admin 用户，请先执行 db:seed");
    return;
  }

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(weixinAccounts)
    .where(eq(weixinAccounts.userId, admin.id));

  if (total > 0) {
    console.log(`个人自媒体账号已有 ${total} 条，跳过`);
    return;
  }

  await db.insert(weixinAccounts).values(
    SAMPLE_ACCOUNTS.map((a) => ({ ...a, userId: admin.id }))
  );
  console.log(`✅ 已为 admin 导入 ${SAMPLE_ACCOUNTS.length} 个自媒体账号`);
}

seedWeixin()
  .catch((err) => {
    console.error("❌ 个人自媒体种子失败:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    const { pool } = await import("./index.js");
    await pool.end();
  });
