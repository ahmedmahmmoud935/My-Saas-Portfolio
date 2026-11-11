import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { linkPreviewImage } from '../lib/link-preview'

/*
 * Products now show their own picture rather than a drawn preview. Those with
 * a link but no picture fetched yet (added before the link was read, or by a
 * migration) get the live site's share picture once, here. A site that does
 * not answer is left as it is; saving the product later tries again.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const res = await db.execute(sql`
    SELECT id, url FROM products
    WHERE image_id IS NULL AND (preview_image IS NULL OR preview_image = '')
      AND url IS NOT NULL AND url <> ''`)
  const rows = (res as unknown as { rows: { id: number; url: string }[] }).rows ?? []
  for (const r of rows) {
    const img = await Promise.race([
      linkPreviewImage(r.url).catch(() => null),
      new Promise<null>((ok) => setTimeout(() => ok(null), 8000)),
    ])
    if (img) await db.execute(sql`UPDATE products SET preview_image = ${img} WHERE id = ${r.id}`)
  }
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // A fetched picture is content; it stays.
}
