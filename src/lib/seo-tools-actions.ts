'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'
import { refusalFrom, type SaveRefusal } from './action-error'

/**
 * The two ids Google gives you, saved against this tenant's site.
 *
 * Kept in its own action rather than folded into the Design tab: it is the
 * only thing on the settings document that changes nothing about how the site
 * looks, and it is edited from the Site check page.
 */
export async function saveSeoTools(input: {
  searchConsole: string
  analyticsId: string
}): Promise<{ ok: true } | SaveRefusal> {
  const ctx = await getDashboardContext()
  if (!ctx) return { ok: false, code: 'unauthorized' }
  try {
    const settings = await getTenantSettings(ctx)

    await ctx.payload.update({
      collection: 'site-settings',
      id: settings.id,
      data: {
        seoTools: {
          searchConsole: input.searchConsole.trim() || null,
          analyticsId: input.analyticsId.trim() || null,
        },
      } as never,
    })
  } catch (e) {
    return refusalFrom(e)
  }
  return { ok: true }
}
