import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * Product cards can be drawn the way the reference draws them — a website, a
 * landing page or a demo dashboard — instead of only as an uploaded image,
 * and their "Details" summary can be renamed.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "preview" varchar DEFAULT 'image';
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "mock_brand" varchar;
    ALTER TABLE "products_locales" ADD COLUMN IF NOT EXISTS "details_label" varchar;
    ALTER TABLE "products_locales" ADD COLUMN IF NOT EXISTS "mock_tagline" varchar;
    ALTER TABLE "products_locales" ADD COLUMN IF NOT EXISTS "mock_headline" varchar;
    ALTER TABLE "products_locales" ADD COLUMN IF NOT EXISTS "mock_cta" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "preview";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "mock_brand";
    ALTER TABLE "products_locales" DROP COLUMN IF EXISTS "details_label";
    ALTER TABLE "products_locales" DROP COLUMN IF EXISTS "mock_tagline";
    ALTER TABLE "products_locales" DROP COLUMN IF EXISTS "mock_headline";
    ALTER TABLE "products_locales" DROP COLUMN IF EXISTS "mock_cta";`)
}
