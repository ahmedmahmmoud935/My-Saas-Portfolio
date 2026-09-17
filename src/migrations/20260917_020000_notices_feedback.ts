import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Messages from the platform to its clients, and suggestions from the clients
 * back — with the files that come with them.
 *
 * Three tables and the two relation tables behind them (who has read a
 * message; which files a suggestion carries), plus a column each in the
 * lock table: Payload queries every collection's column there on any edit, and
 * a collection without one breaks saving across the whole admin.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_notices_tone" AS ENUM('info', 'success', 'warning');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_notices_audience" AS ENUM('all', 'one');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_feedback_kind" AS ENUM('idea', 'problem', 'question');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE "public"."enum_feedback_status" AS ENUM('new', 'seen', 'planned', 'done');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "notices" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "body" varchar NOT NULL,
      "tone" "enum_notices_tone" DEFAULT 'info',
      "audience" "enum_notices_audience" DEFAULT 'all',
      "tenant_id" integer,
      "link" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS "notices_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "tenants_id" integer
    );

    CREATE TABLE IF NOT EXISTS "attachments" (
      "id" serial PRIMARY KEY NOT NULL,
      "tenant_id" integer,
      "original" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric,
      "focal_x" numeric,
      "focal_y" numeric
    );

    CREATE TABLE IF NOT EXISTS "feedback" (
      "id" serial PRIMARY KEY NOT NULL,
      "tenant_id" integer,
      "author_id" integer,
      "kind" "enum_feedback_kind" DEFAULT 'idea',
      "subject" varchar NOT NULL,
      "body" varchar NOT NULL,
      "status" "enum_feedback_status" DEFAULT 'new',
      "reply" varchar,
      "replied_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS "feedback_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "attachments_id" integer
    );

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "notices_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "feedback_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "attachments_id" integer;`)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "notices" ADD CONSTRAINT "notices_tenant_id_tenants_id_fk"
        FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "notices_rels" ADD CONSTRAINT "notices_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."notices"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "notices_rels" ADD CONSTRAINT "notices_rels_tenants_fk"
        FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "attachments" ADD CONSTRAINT "attachments_tenant_id_tenants_id_fk"
        FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "feedback" ADD CONSTRAINT "feedback_tenant_id_tenants_id_fk"
        FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "feedback" ADD CONSTRAINT "feedback_author_id_users_id_fk"
        FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "feedback_rels" ADD CONSTRAINT "feedback_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "feedback_rels" ADD CONSTRAINT "feedback_rels_attachments_fk"
        FOREIGN KEY ("attachments_id") REFERENCES "public"."attachments"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notices_fk"
        FOREIGN KEY ("notices_id") REFERENCES "public"."notices"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feedback_fk"
        FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_attachments_fk"
        FOREIGN KEY ("attachments_id") REFERENCES "public"."attachments"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "notices_tenant_idx" ON "notices" USING btree ("tenant_id");
    CREATE INDEX IF NOT EXISTS "notices_updated_at_idx" ON "notices" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "notices_created_at_idx" ON "notices" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "notices_rels_order_idx" ON "notices_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "notices_rels_parent_idx" ON "notices_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "notices_rels_path_idx" ON "notices_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "notices_rels_tenants_id_idx" ON "notices_rels" USING btree ("tenants_id");
    CREATE INDEX IF NOT EXISTS "attachments_tenant_idx" ON "attachments" USING btree ("tenant_id");
    CREATE INDEX IF NOT EXISTS "attachments_updated_at_idx" ON "attachments" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "attachments_created_at_idx" ON "attachments" USING btree ("created_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "attachments_filename_idx" ON "attachments" USING btree ("filename");
    CREATE INDEX IF NOT EXISTS "feedback_tenant_idx" ON "feedback" USING btree ("tenant_id");
    CREATE INDEX IF NOT EXISTS "feedback_author_idx" ON "feedback" USING btree ("author_id");
    CREATE INDEX IF NOT EXISTS "feedback_updated_at_idx" ON "feedback" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "feedback_created_at_idx" ON "feedback" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "feedback_rels_order_idx" ON "feedback_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "feedback_rels_parent_idx" ON "feedback_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "feedback_rels_path_idx" ON "feedback_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "feedback_rels_attachments_id_idx" ON "feedback_rels" USING btree ("attachments_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_notices_id_idx" ON "payload_locked_documents_rels" USING btree ("notices_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("feedback_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_attachments_id_idx" ON "payload_locked_documents_rels" USING btree ("attachments_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "notices_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "feedback_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "attachments_id";
    DROP TABLE IF EXISTS "feedback_rels" CASCADE;
    DROP TABLE IF EXISTS "feedback" CASCADE;
    DROP TABLE IF EXISTS "attachments" CASCADE;
    DROP TABLE IF EXISTS "notices_rels" CASCADE;
    DROP TABLE IF EXISTS "notices" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_feedback_status";
    DROP TYPE IF EXISTS "public"."enum_feedback_kind";
    DROP TYPE IF EXISTS "public"."enum_notices_audience";
    DROP TYPE IF EXISTS "public"."enum_notices_tone";`)
}
