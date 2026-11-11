import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The platform cannot always read its own address from inside its server, so
 * a ViralPX product left without a picture by the link read gets the
 * platform's own share picture (the one www.viralpx.com announces).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE products
       SET preview_image = 'https://cdn.viralpx.com/media/laptop-showing-typesetting-software-graphic-designer-workspace-1024x683.webp'
     WHERE image_id IS NULL
       AND (preview_image IS NULL OR preview_image = '')
       AND url ~* '^https?://(www\\.)?viralpx\\.com/?$';`)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // A picture is content; it stays.
}
