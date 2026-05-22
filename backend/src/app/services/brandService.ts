import { eq, desc, count, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { brands } from "../../db/schema.js";

export async function createBrand(
  userId: number,
  data: {
    name: string;
    aliases?: string[];
    industry?: string;
    website?: string;
    description?: string;
  }
) {
  const [row] = await db
    .insert(brands)
    .values({
      userId,
      name: data.name,
      aliases: data.aliases || [],
      industry: data.industry,
      website: data.website,
      description: data.description,
    })
    .returning();
  return row;
}

export async function listBrands(userId: number, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const [{ total }] = await db
    .select({ total: count() })
    .from(brands)
    .where(eq(brands.userId, userId));

  const list = await db
    .select()
    .from(brands)
    .where(eq(brands.userId, userId))
    .orderBy(desc(brands.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { list, total: Number(total) };
}
