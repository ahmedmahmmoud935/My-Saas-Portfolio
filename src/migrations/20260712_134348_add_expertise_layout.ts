import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_style_expertise" AS ENUM('grid', 'stack');
  ALTER TABLE "site_settings" ADD COLUMN "style_expertise" "enum_site_settings_style_expertise" DEFAULT 'grid';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "style_expertise";
  DROP TYPE "public"."enum_site_settings_style_expertise";`)
}
