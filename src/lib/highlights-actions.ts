'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'

export type HLItem = { type: string; mediaId: number | null; mediaUrl: string | null }
export type Highlight = {
  title: string
  coverId: number | null
  coverUrl: string | null
  items: HLItem[]
}

export async function saveHighlights(highlights: Highlight[]) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const settings = await getTenantSettings(ctx)
  await ctx.payload.update({
    collection: 'site-settings',
    id: settings.id,
    locale: 'ar',
    data: {
      highlights: highlights.map((h) => ({
        title: h.title,
        cover: h.coverId,
        items: h.items
          .filter((it) => it.mediaId)
          .map((it) => ({ type: it.type as never, media: it.mediaId })),
      })),
    } as never,
  })
  return { ok: true }
}
