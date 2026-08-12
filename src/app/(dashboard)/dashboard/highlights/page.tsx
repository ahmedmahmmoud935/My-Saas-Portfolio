import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import { isVideoSrc } from '@/lib/media-kind'
import HighlightsEditor from '@/components/dashboard/HighlightsEditor'
import type { Highlight } from '@/lib/highlights-actions'

export default async function HighlightsPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const settings = await getTenantSettings(ctx)
  const raw = ((settings.highlights as Record<string, unknown>[]) ?? []).map((h): Highlight => ({
    title: (h.title as string) || '',
    coverId: (h.cover && typeof h.cover === 'object' ? (h.cover as { id: number }).id : (h.cover as number)) ?? null,
    coverUrl: mediaUrl((h.cover as never) ?? null, 'thumb'),
    items: ((h.items as Record<string, unknown>[]) ?? []).map((it) => {
      const url = mediaUrl((it.media as never) ?? null, 'thumb')
      const mime =
        it.media && typeof it.media === 'object' ? (it.media as { mimeType?: string }).mimeType : null
      return {
        // Older items were all saved as "image" — correct them here so the next
        // save writes the real type back.
        type: isVideoSrc(url, mime) ? 'video' : (it.type as string) || 'image',
        mediaId:
          (it.media && typeof it.media === 'object' ? (it.media as { id: number }).id : (it.media as number)) ??
          null,
        mediaUrl: url,
      }
    }),
  }))
  return <HighlightsEditor initial={raw} />
}
