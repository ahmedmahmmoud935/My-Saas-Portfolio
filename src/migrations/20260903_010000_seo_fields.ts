import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SEO fields, and an article's address and publish switch per language.
 *
 * The slug and the publish flag were one value shared by both languages, so an
 * English article was stuck with an Arabic URL and a piece that exists in only
 * one language either went live as an empty page in the other or stayed
 * unpublished in both. Both move into the locale table.
 *
 * The move is a backfill, not a rename: every existing locale row is given the
 * value the article already had, so no article changes address and nothing
 * unpublishes itself. The old columns are dropped only after that copy.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ── articles: slug + published become per-language ────────────────────────
  await db.execute(sql`
    ALTER TABLE "articles_locales" ADD COLUMN IF NOT EXISTS "slug" varchar;
    ALTER TABLE "articles_locales" ADD COLUMN IF NOT EXISTS "published" boolean;`)

  await db.execute(sql`
    UPDATE "articles_locales" l
       SET "slug" = COALESCE(l."slug", a."slug"),
           "published" = COALESCE(l."published", a."published")
      FROM "articles" a
     WHERE l."_parent_id" = a."id";`)

  // An article with no row for a locale yet would lose that language entirely,
  // so give every article a row in both.
  await db.execute(sql`
    INSERT INTO "articles_locales" ("_locale", "_parent_id", "slug", "published")
    SELECT loc.code::"_locales", a."id", a."slug", a."published"
      FROM "articles" a
      CROSS JOIN (VALUES ('ar'), ('en')) AS loc(code)
     WHERE NOT EXISTS (
       SELECT 1 FROM "articles_locales" l
        WHERE l."_parent_id" = a."id" AND l."_locale" = loc.code::"_locales"
     );`)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "articles_locales_slug_idx" ON "articles_locales" USING btree ("slug");
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "slug";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "published";`)

  // ── the SEO group on both collections ─────────────────────────────────────
  await db.execute(sql`
    ALTER TABLE "articles_locales" ADD COLUMN IF NOT EXISTS "seo_title" varchar;
    ALTER TABLE "articles_locales" ADD COLUMN IF NOT EXISTS "seo_description" varchar;
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "seo_noindex" boolean DEFAULT false;
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "seo_nofollow" boolean DEFAULT false;

    ALTER TABLE "projects_locales" ADD COLUMN IF NOT EXISTS "seo_title" varchar;
    ALTER TABLE "projects_locales" ADD COLUMN IF NOT EXISTS "seo_description" varchar;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "seo_noindex" boolean DEFAULT false;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "seo_nofollow" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Put one language's slug back on the article before the per-language ones go.
  await db.execute(sql`
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "slug" varchar;
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "published" boolean;`)

  await db.execute(sql`
    UPDATE "articles" a
       SET "slug" = l."slug", "published" = l."published"
      FROM "articles_locales" l
     WHERE l."_parent_id" = a."id" AND l."_locale" = 'ar';`)

  await db.execute(sql`
    UPDATE "articles" a
       SET "slug" = l."slug", "published" = l."published"
      FROM "articles_locales" l
     WHERE l."_parent_id" = a."id" AND l."_locale" = 'en' AND a."slug" IS NULL;`)

  await db.execute(sql`
    DROP INDEX IF EXISTS "articles_locales_slug_idx";
    ALTER TABLE "articles_locales" DROP COLUMN IF EXISTS "slug";
    ALTER TABLE "articles_locales" DROP COLUMN IF EXISTS "published";

    ALTER TABLE "articles_locales" DROP COLUMN IF EXISTS "seo_title";
    ALTER TABLE "articles_locales" DROP COLUMN IF EXISTS "seo_description";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "seo_noindex";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "seo_nofollow";

    ALTER TABLE "projects_locales" DROP COLUMN IF EXISTS "seo_title";
    ALTER TABLE "projects_locales" DROP COLUMN IF EXISTS "seo_description";
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "seo_noindex";
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "seo_nofollow";`)
}
