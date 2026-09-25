import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * The landing page's feature cards move to the built-in line icons.
 *
 * Emoji become the icon each one stood for, and the two icons that had been
 * uploaded by hand — a pen and a browser window — become their built-in
 * equivalents, so the six cards are drawn in one hand and follow the theme.
 * Anything else stays exactly as it was: an upload this does not recognise, a
 * character it has no icon for.
 */

type Obj = Record<string, unknown>
type Row = { id: number; content: unknown }

const FROM_EMOJI: Record<string, string> = {
  '🌐': 'globe',
  '🎨': 'palette',
  '🖼️': 'image',
  '🖼': 'image',
  '⚡': 'zap',
  '✍️': 'edit',
  '✍': 'edit',
  '📩': 'mail',
  '✨': 'sparkle',
}

const FROM_UPLOAD: [RegExp, string][] = [
  [/\/curve-1(-[^/]*)?\.webp$/, 'pen'],
  [/\/internet(-[^/]*)?\.webp$/, 'browser'],
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const res = (await db.execute(
    sql`SELECT "id", "content" FROM "landing_locales" WHERE "content" IS NOT NULL`,
  )) as unknown as { rows?: Row[] } | Row[]
  const rows = Array.isArray(res) ? res : (res.rows ?? [])

  for (const row of rows) {
    const content = (typeof row.content === 'string' ? JSON.parse(row.content) : row.content) as Obj
    const features = content?.features
    if (!Array.isArray(features)) continue
    let changed = false
    const next = features.map((raw) => {
      const f = { ...(raw as Obj) }
      const url = String(f.iconUrl ?? '')
      const upload = url ? FROM_UPLOAD.find(([re]) => re.test(url)) : undefined
      if (upload) {
        f.icon = upload[1]
        f.iconUrl = ''
        changed = true
      } else if (!url && FROM_EMOJI[String(f.icon ?? '').trim()]) {
        f.icon = FROM_EMOJI[String(f.icon).trim()]
        changed = true
      }
      return f
    })
    if (!changed) continue
    await db.execute(sql`
      UPDATE "landing_locales" SET "content" = ${JSON.stringify({ ...content, features: next })}::jsonb WHERE "id" = ${row.id};`)
  }
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Nothing to put back: the page reads the old emoji and the new names alike.
}
