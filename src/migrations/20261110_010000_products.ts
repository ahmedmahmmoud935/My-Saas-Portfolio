import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * "Beyond the image" — a portfolio's digital products, one card each with a
 * picture, a tag, a description, details and a link to the live product.
 *
 * The lock-table column is created alongside the table: Payload queries one
 * column per collection there on any edit, so a collection without it breaks
 * saving across the whole admin.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products" (
      "id" serial PRIMARY KEY NOT NULL,
      "tenant_id" integer,
      "image_id" integer,
      "url" varchar,
      "preview_image" varchar,
      "sort_order" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "products_locales" (
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL,
      "title" varchar,
      "tag" varchar,
      "description" varchar,
      "details" varchar,
      "btn_label" varchar
    );`)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk"
        FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "products" ADD CONSTRAINT "products_image_id_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "products_locales_locale_parent_id_unique"
      ON "products_locales" USING btree ("_locale","_parent_id");
    CREATE INDEX IF NOT EXISTS "products_tenant_idx" ON "products" USING btree ("tenant_id");
    CREATE INDEX IF NOT EXISTS "products_image_idx" ON "products" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "products_updated_at_idx" ON "products" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "products_created_at_idx" ON "products" USING btree ("created_at");`)

  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "preview_image" varchar;`)

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "products_id" integer;`)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk"
        FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_products_id_idx"
      ON "payload_locked_documents_rels" USING btree ("products_id");`)

  /* The heading and the line under it, beside the other section headings. */
  await db.execute(sql`
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_products_title" varchar;
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_products_subtitle" varchar;`)

  /* The section takes its place among the ones a portfolio orders and gives a
     backdrop to. No down for these: an enum value cannot be dropped. */
  await db.execute(sql`
    ALTER TYPE "public"."enum_site_settings_sections_section_id" ADD VALUE IF NOT EXISTS 'products';`)
  await db.execute(sql`
    ALTER TYPE "public"."enum_site_settings_section_bg_section" ADD VALUE IF NOT EXISTS 'products';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_products_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "products_id";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_products_title";
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_products_subtitle";
    DROP TABLE IF EXISTS "products_locales" CASCADE;
    DROP TABLE IF EXISTS "products" CASCADE;`)
}
