'use server'

import { getDashboardContext } from './dashboard'
import { refusalFrom, type SaveRefusal } from './action-error'

/**
 * What a picture shows, in words — kept on the picture itself.
 *
 * Search engines and AI assistants read a page's text, not its images; a
 * project told only in pictures reads to them as a title and nothing else.
 * Kept on the media file rather than on the page that places it, so the same
 * picture says the same thing wherever it appears. Written to both languages:
 * it is one sentence about one picture, and a blank half would leave the
 * other language's page with nothing.
 */
export async function saveImageAlt(id: number, alt: string): Promise<{ ok: true } | SaveRefusal> {
  const ctx = await getDashboardContext()
  if (!ctx) return { ok: false, code: 'unauthorized' }
  try {
    const media = await ctx.payload.findByID({ collection: 'media', id, depth: 0 })
    const owner = typeof media.tenant === 'object' ? (media.tenant as { id?: number })?.id : media.tenant
    if (owner !== ctx.tenantId && !ctx.user.isOwner) return { ok: false, code: 'unauthorized' }
    const text = alt.replace(/\s+/g, ' ').trim().slice(0, 200)
    for (const locale of ['ar', 'en'] as const) {
      await ctx.payload.update({ collection: 'media', id, data: { alt: text || null } as never, locale })
    }
  } catch (e) {
    return refusalFrom(e)
  }
  return { ok: true }
}
