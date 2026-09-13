import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The people behind a portfolio.
 *
 * A portfolio speaks in the first person, which is right for one freelancer
 * and wrong for the three who share a studio name. This is where they are
 * listed: a face, a name, a job title and a line about each of them.
 *
 * Its own collection rather than another array inside the settings document:
 * a member has a photograph (a media relation), is reordered on its own, and
 * is added and removed one at a time — which is what the collections beside it
 * (clients, achievements, reviews) already are.
 *
 * The lock-table column is created here alongside the table. Payload keeps one
 * column per collection there and queries every one of them on any edit, so a
 * new collection without it breaks saving across the whole admin.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "team" (
      "id" serial PRIMARY KEY NOT NULL,
      "tenant_id" integer,
      "photo_id" integer,
      "sort_order" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "team_locales" (
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL,
      "name" varchar,
      "role" varchar,
      "bio" varchar
    );`)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "team" ADD CONSTRAINT "team_tenant_id_tenants_id_fk"
        FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "team" ADD CONSTRAINT "team_photo_id_media_id_fk"
        FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "team_locales" ADD CONSTRAINT "team_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "team_locales_locale_parent_id_unique"
      ON "team_locales" USING btree ("_locale","_parent_id");
    CREATE INDEX IF NOT EXISTS "team_tenant_idx" ON "team" USING btree ("tenant_id");
    CREATE INDEX IF NOT EXISTS "team_photo_idx" ON "team" USING btree ("photo_id");
    CREATE INDEX IF NOT EXISTS "team_updated_at_idx" ON "team" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "team_created_at_idx" ON "team" USING btree ("created_at");`)

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "team_id" integer;`)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk"
        FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_team_id_idx"
      ON "payload_locked_documents_rels" USING btree ("team_id");`)

  /* The heading over the section, beside the other section headings. */
  await db.execute(sql`
    ALTER TABLE "site_settings_locales" ADD COLUMN IF NOT EXISTS "content_team_title" varchar;`)

  /* The section takes its place among the ones a portfolio orders and can give
     a backdrop to. No down for these: Postgres cannot drop an enum value once
     a row may point at it. */
  await db.execute(sql`
    ALTER TYPE "public"."enum_site_settings_sections_section_id" ADD VALUE IF NOT EXISTS 'team';`)
  await db.execute(sql`
    ALTER TYPE "public"."enum_site_settings_section_bg_section" ADD VALUE IF NOT EXISTS 'team';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_team_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "team_id";
    DROP TABLE IF EXISTS "team_locales" CASCADE;
    DROP TABLE IF EXISTS "team" CASCADE;
    ALTER TABLE "site_settings_locales" DROP COLUMN IF EXISTS "content_team_title";`)
}
