import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Old addresses that should still work.
 *
 * Slugs became editable per language, and the first slug an article gets is
 * generated from its opening sentence — so the ones most likely to be
 * rewritten are exactly the ones already published and linked to. A row here
 * keeps the old address alive as a permanent redirect instead of a 404.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "redirects" (
      "id" serial PRIMARY KEY NOT NULL,
      "tenant_id" integer,
      "from" varchar NOT NULL,
      "to" varchar NOT NULL,
      "auto" boolean DEFAULT false,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );`)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "redirects" ADD CONSTRAINT "redirects_tenant_id_tenants_id_fk"
        FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "redirects_from_idx" ON "redirects" USING btree ("from");
    CREATE INDEX IF NOT EXISTS "redirects_tenant_idx" ON "redirects" USING btree ("tenant_id");
    CREATE INDEX IF NOT EXISTS "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "redirects_created_at_idx" ON "redirects" USING btree ("created_at");`)

  /*
   * Payload keeps one column per collection in its document-lock join table,
   * and queries every one of them whenever any document is edited. A new
   * collection without its column there does not fail on its own pages — it
   * fails on ALL of them, with "column redirects_id does not exist" on the
   * next save of anything at all. Creating the table is only half of adding a
   * collection.
   */
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "redirects_id" integer;`)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk"
        FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_redirects_id_idx"
      ON "payload_locked_documents_rels" USING btree ("redirects_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_redirects_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "redirects_id";
    DROP TABLE IF EXISTS "redirects" CASCADE;`)
}
