import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "projects_blocks_carousel_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  ALTER TABLE "projects_blocks_carousel_items" ADD CONSTRAINT "projects_blocks_carousel_items_src_id_media_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_carousel_items" ADD CONSTRAINT "projects_blocks_carousel_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_carousel" ADD CONSTRAINT "projects_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_blocks_carousel_items_order_idx" ON "projects_blocks_carousel_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_carousel_items_parent_id_idx" ON "projects_blocks_carousel_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_carousel_items_src_idx" ON "projects_blocks_carousel_items" USING btree ("src_id");
  CREATE INDEX "projects_blocks_carousel_order_idx" ON "projects_blocks_carousel" USING btree ("_order");
  CREATE INDEX "projects_blocks_carousel_parent_id_idx" ON "projects_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_carousel_path_idx" ON "projects_blocks_carousel" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_blocks_carousel_items" CASCADE;
  DROP TABLE "projects_blocks_carousel" CASCADE;`)
}
