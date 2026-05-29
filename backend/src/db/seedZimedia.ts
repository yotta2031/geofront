import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { count, eq } from "drizzle-orm";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

const SAMPLE_ACCOUNTS = [
  {
    accountName: "教育博主小王",
    platform: "头条号",
    category: "教育",
    quotePrice: 800,
    fansCount: 125000,
    avatar:
      "https://sf3-cdn-tos.toutiaostatic.com/img/user-avatar/9cba58469ee67551250351e63c00d7ab~300x300.image",
  },
  {
    accountName: "科技前沿观察",
    platform: "知乎",
    category: "科技",
    quotePrice: 1500,
    fansCount: 89000,
    avatar: "https://picx.zhimg.com/v2-25ac7c0d6225fc37e7f4419d75895b22_xl.jpg",
  },
  {
    accountName: "美妆达人Lily",
    platform: "小红书",
    category: "美妆",
    quotePrice: 2200,
    fansCount: 210000,
    avatar:
      "https://img.xiaohongshu.com/avatar/1040g2jo31t0jmui162e05n7knumlioinp9diccg!750w_750h_92q_1e_1c_1x.jpg",
  },
  {
    accountName: "财经解读官",
    platform: "公众号",
    category: "财经",
    quotePrice: 3000,
    fansCount: 56000,
    avatar:
      "https://wx.qlogo.cn/mmopen/aRXPhC0Wk4XGf95H5WySJdngtmjbSic990GpLLMPwUYfY9Ls5Wtq4z1RqXupABDvGWxt9M6w927PhTf0BEsBWK538f6pkFzibwCAb04hc6oSuZXy9Z7N3OfWe0DfZYmicL8/64",
  },
  {
    accountName: "生活好物推荐",
    platform: "抖音",
    category: "生活",
    quotePrice: 1200,
    fansCount: 450000,
    avatar: "https://p3-pc.douyinpic.com/aweme/100x100/aweme-avatar/tos-cn-i-0813c001_o0h5a6f6",
  },
];

async function seedZimedia() {
  const { db, pool } = await import("./index.js");
  const { zimediaAccounts, users } = await import("./schema.js");

  await pool.query("SELECT 1");
  const [admin] = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
  if (!admin) {
    console.log("未找到 admin 用户，请先执行 db:seed");
    return;
  }

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(zimediaAccounts)
    .where(eq(zimediaAccounts.userId, admin.id));

  if (total > 0) {
    console.log(`自媒体大V账号已有 ${total} 条，跳过`);
    return;
  }

  await db.insert(zimediaAccounts).values(
    SAMPLE_ACCOUNTS.map((a) => ({
      ...a,
      userId: admin.id,
      maxDailyPublish: 5,
      publishEnabled: true,
      coopStatus: "active",
    }))
  );
  console.log(`✅ 已为 admin 导入 ${SAMPLE_ACCOUNTS.length} 个大V账号`);
}

seedZimedia()
  .catch((err) => {
    console.error("❌ 自媒体大V种子失败:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    const { pool } = await import("./index.js");
    await pool.end();
  });
