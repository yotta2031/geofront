import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { count, eq } from "drizzle-orm";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

const SAMPLE_SITES = [
  {
    siteName: "灵雯GEO官网",
    siteUrl: "https://geo.doubaoedu.cn",
    cmsType: "WordPress",
    apiEndpoint: "https://geo.doubaoedu.cn/wp-json/wp/v2/posts",
    sitemapUrl: "https://geo.doubaoedu.cn/sitemap.xml",
    seoScore: 85,
    connectStatus: "connected",
  },
  {
    siteName: "企业品牌站",
    siteUrl: "https://www.example.com",
    cmsType: "易优CMS",
    apiEndpoint: "https://www.example.com/api/article/publish",
    sitemapUrl: "https://www.example.com/sitemap.xml",
    seoScore: 72,
    connectStatus: "connected",
  },
  {
    siteName: "产品落地页",
    siteUrl: "https://product.example.com",
    cmsType: "自定义API",
    apiEndpoint: "https://product.example.com/openapi/v1/content",
    seoScore: 60,
    connectStatus: "pending",
  },
];

async function seedSite() {
  const { db, pool } = await import("./index.js");
  const { siteWebsites, users } = await import("./schema.js");

  await pool.query("SELECT 1");
  const [admin] = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
  if (!admin) {
    console.log("未找到 admin 用户，请先执行 db:seed");
    return;
  }

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(siteWebsites)
    .where(eq(siteWebsites.userId, admin.id));

  if (total > 0) {
    console.log(`官网站点已有 ${total} 条，跳过`);
    return;
  }

  await db.insert(siteWebsites).values(
    SAMPLE_SITES.map((s) => ({
      ...s,
      userId: admin.id,
      maxDailyPublish: 5,
      publishEnabled: true,
    }))
  );
  console.log(`✅ 已为 admin 导入 ${SAMPLE_SITES.length} 个官网站点`);
}

seedSite()
  .catch((err) => {
    console.error("❌ 官网SEO种子失败:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    const { pool } = await import("./index.js");
    await pool.end();
  });
