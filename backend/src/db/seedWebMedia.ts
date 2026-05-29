import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { count } from "drizzle-orm";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

const SAMPLE_MEDIA = [
  {
    name: "博客园（GEO优化首选）",
    industry: "IT科技",
    portal: "垂直媒体",
    region: "综合全国",
    entryLevel: "频道入口",
    indexWeb: "包网页收录",
    indexNews: "包资讯收录",
    linkType: "可带网址",
    publishSpeed: "12小时",
    geoRankable: true,
    price: 14,
    pcWeight: 7,
    mobileWeight: 6,
    successRate: 85,
    publishTimeMinutes: 740,
    remark: "AI收录好，秒发秒收录",
    tags: ["GEO优化首选", "最新秒杀"],
    sortOrder: 100,
  },
  {
    name: "新华报业网",
    industry: "新闻资讯",
    portal: "新华网",
    region: "江苏",
    entryLevel: "频道入口",
    indexWeb: "包网页收录",
    indexNews: "不包资讯收录",
    linkType: "不可带网址",
    publishSpeed: "当日",
    price: 150,
    pcWeight: 8,
    mobileWeight: 7,
    successRate: 88,
    publishTimeMinutes: 480,
    remark: "GEO排名可发",
    tags: ["新闻资讯"],
    sortOrder: 90,
  },
  {
    name: "东昌府新闻网",
    industry: "新闻资讯",
    portal: "其他门户",
    region: "山东",
    entryLevel: "没有入口",
    indexWeb: "不包网页收录",
    indexNews: "包资讯收录",
    linkType: "可带网址",
    publishSpeed: "次日",
    weekendPublish: true,
    price: 45,
    pcWeight: 5,
    mobileWeight: 5,
    successRate: 95,
    publishTimeMinutes: 1440,
    remark: "周末可发，出稿稳定",
    tags: ["新闻资讯"],
    sortOrder: 80,
  },
  {
    name: "新浪网-科技频道",
    industry: "IT科技",
    portal: "新浪网",
    region: "综合全国",
    entryLevel: "首页入口",
    indexWeb: "包网页收录",
    indexNews: "包资讯收录",
    linkType: "可带网址",
    publishSpeed: "2小时",
    mobileMedia: true,
    price: 280,
    pcWeight: 9,
    mobileWeight: 8,
    successRate: 92,
    publishTimeMinutes: 120,
    remark: "移动端媒体，权重高",
    tags: ["IT科技"],
    sortOrder: 70,
  },
  {
    name: "网易号-财经",
    industry: "财经商业",
    portal: "网易网",
    region: "综合全国",
    entryLevel: "频道入口",
    indexWeb: "包网页收录",
    indexNews: "包资讯收录",
    linkType: "可带网址",
    publishSpeed: "1小时",
    hasVideo: true,
    price: 120,
    pcWeight: 8,
    mobileWeight: 8,
    successRate: 90,
    publishTimeMinutes: 60,
    remark: "可带视频，金融类慎发",
    tags: ["财经商业"],
    sortOrder: 60,
  },
  {
    name: "腾讯网-教育",
    industry: "教育培训",
    portal: "腾讯网",
    region: "广东",
    entryLevel: "频道入口",
    indexWeb: "包网页收录",
    indexNews: "不包资讯收录",
    linkType: "不可带网址",
    publishSpeed: "当日",
    nightPublish: true,
    price: 88,
    pcWeight: 7,
    mobileWeight: 7,
    successRate: 87,
    publishTimeMinutes: 360,
    remark: "晚上可发",
    tags: ["教育培训"],
    sortOrder: 50,
  },
  {
    name: "人民网-健康",
    industry: "健康医疗",
    portal: "人民网",
    region: "北京",
    entryLevel: "上级入口",
    indexWeb: "包网页收录",
    indexNews: "包资讯收录",
    linkType: "不可带网址",
    publishSpeed: "48小时以上",
    specialIndustry: "医疗",
    price: 320,
    pcWeight: 9,
    mobileWeight: 8,
    successRate: 80,
    publishTimeMinutes: 2880,
    remark: "医疗类需审核",
    tags: ["健康医疗"],
    sortOrder: 40,
  },
  {
    name: "凤凰网-汽车",
    industry: "汽车网站",
    portal: "凤凰网",
    region: "综合全国",
    entryLevel: "频道入口",
    indexWeb: "包网页收录",
    indexNews: "包资讯收录",
    linkType: "可带网址",
    publishSpeed: "12小时",
    whitelistSource: true,
    price: 168,
    pcWeight: 8,
    mobileWeight: 7,
    successRate: 86,
    publishTimeMinutes: 720,
    remark: "白名单来源",
    tags: ["汽车网站"],
    sortOrder: 30,
  },
];

async function seedWebMedia() {
  const { db, pool } = await import("./index.js");
  const { webMedia } = await import("./schema.js");

  await pool.query("SELECT 1");
  const [{ value: total }] = await db.select({ value: count() }).from(webMedia);
  if (total > 0) {
    console.log(`网站媒体库已有 ${total} 条，跳过种子`);
    return;
  }

  await db.insert(webMedia).values(SAMPLE_MEDIA);
  console.log(`✅ 已导入 ${SAMPLE_MEDIA.length} 条网站媒体`);
}

seedWebMedia()
  .catch((err) => {
    console.error("❌ 网站媒体种子失败:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    const { pool } = await import("./index.js");
    await pool.end();
  });
