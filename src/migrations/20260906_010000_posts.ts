import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The platform's own blog, at /blog.
 *
 * Its own collection rather than a tenant's articles: reusing those would have
 * put the same piece at two addresses, competing with itself in results.
 *
 * The lock-table column is created here alongside the table. Payload keeps one
 * column per collection there and queries every one of them on any edit, so a
 * new collection without it breaks saving across the whole admin — not just
 * its own pages.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts" (
      "id" serial PRIMARY KEY NOT NULL,
      "cover_id" integer,
      "read_min" numeric DEFAULT 3,
      "seo_noindex" boolean DEFAULT false,
      "seo_nofollow" boolean DEFAULT false,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "posts_locales" (
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL,
      "title" varchar,
      "slug" varchar,
      "excerpt" varchar,
      "content_html" varchar,
      "published" boolean DEFAULT false,
      "seo_keyphrase" varchar,
      "seo_title" varchar,
      "seo_description" varchar
    );`)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_media_id_fk"
        FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "posts_locales_locale_parent_id_unique"
      ON "posts_locales" USING btree ("_locale","_parent_id");
    CREATE INDEX IF NOT EXISTS "posts_locales_slug_idx" ON "posts_locales" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "posts_cover_idx" ON "posts" USING btree ("cover_id");
    CREATE INDEX IF NOT EXISTS "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts" USING btree ("created_at");`)

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "posts_id" integer;`)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk"
        FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_posts_id_idx"
      ON "payload_locked_documents_rels" USING btree ("posts_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_posts_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "posts_id";
    DROP TABLE IF EXISTS "posts_locales" CASCADE;
    DROP TABLE IF EXISTS "posts" CASCADE;`)
}
