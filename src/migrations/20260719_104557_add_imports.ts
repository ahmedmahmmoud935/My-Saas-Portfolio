import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "imports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token" varchar,
  	"data" jsonb,
  	"expires_at" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "imports_id" integer;
  CREATE INDEX "imports_token_idx" ON "imports" USING btree ("token");
  CREATE INDEX "imports_updated_at_idx" ON "imports" USING btree ("updated_at");
  CREATE INDEX "imports_created_at_idx" ON "imports" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_imports_fk" FOREIGN KEY ("imports_id") REFERENCES "public"."imports"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_imports_id_idx" ON "payload_locked_documents_rels" USING btree ("imports_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "imports" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "imports" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_imports_fk";
  
  DROP INDEX "payload_locked_documents_rels_imports_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "imports_id";`)
}
