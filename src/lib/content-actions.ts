'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'
import type { ContentForm } from './content-types'
import { writeContent } from './content-write'
import { refusalFrom, type SaveRefusal } from './action-error'

export async function saveContent(form: ContentForm): Promise<{ ok: true } | SaveRefusal> {
  const ctx = await getDashboardContext()
  if (!ctx) return { ok: false, code: 'unauthorized' }
  try {
    const settings = await getTenantSettings(ctx)
    await writeContent(ctx.payload, settings.id, form)
  } catch (e) {
    return refusalFrom(e)
  }
  return { ok: true }
}

/**
 * The picture beside the About text. It lives with the site's other pictures
 * (brand), not with the texts, so it is saved on its own — and it had no
 * place in the dashboard at all: only the admin panel could change it.
 */
export async function saveAboutPhoto(photoId: number | null): Promise<{ ok: true } | SaveRefusal> {
  const ctx = await getDashboardContext()
  if (!ctx) return { ok: false, code: 'unauthorized' }
  try {
    const settings = await getTenantSettings(ctx)
    const b = (settings.brand ?? {}) as Record<string, unknown>
    const rel = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | null))
    await ctx.payload.update({
      collection: 'site-settings',
      id: settings.id,
      data: {
        brand: {
          photo: photoId,
          avatar: rel(b.avatar),
          heroCover: rel(b.heroCover),
          brandLogo: rel(b.brandLogo),
          favicon: rel(b.favicon),
          brandLogoScale: (b.brandLogoScale as number) ?? 1,
          brandLogoOffsetX: (b.brandLogoOffsetX as number) ?? 0,
          brandLogoOffsetY: (b.brandLogoOffsetY as number) ?? 0,
        },
      } as never,
    })
  } catch (e) {
    return refusalFrom(e)
  }
  return { ok: true }
}
