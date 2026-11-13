import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Heading and body font weights, Latin heading letter spacing, and the
   hero's underline switch (off: the owner asked for it gone). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "style_heading_weight" varchar DEFAULT 'auto';
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "style_body_weight" varchar DEFAULT 'auto';
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "style_heading_spacing" varchar DEFAULT 'auto';
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "style_hero_underline" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "style_heading_weight";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "style_body_weight";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "style_heading_spacing";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "style_hero_underline";`)
}
