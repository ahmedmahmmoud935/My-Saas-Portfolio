'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'
import type { DesignForm } from './design-types'

/** Save the whole Design tab (all non-localized: colors, layouts, fonts, cover). */
export async function saveDesign(form: DesignForm) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const settings = await getTenantSettings(ctx)

  // Merge into the existing brand group so we don't wipe photo/avatar/logo/favicon.
  const currentBrand = (settings.brand ?? {}) as Record<string, unknown>
  const brandRel = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : v)

  await ctx.payload.update({
    collection: 'site-settings',
    id: settings.id,
    data: {
      colors: form.colors,
      background: form.background,
      style: form.style,
      themeConfig: { components: form.components },
      heroCover: {
        size: form.heroCover.size,
        posX: form.heroCover.posX,
        posY: form.heroCover.posY,
        overlay: form.heroCover.overlay,
        height: form.heroCover.height,
      },
      brand: {
        photo: brandRel(currentBrand.photo) as number | null,
        avatar: brandRel(currentBrand.avatar) as number | null,
        brandLogo: brandRel(currentBrand.brandLogo) as number | null,
        favicon: brandRel(currentBrand.favicon) as number | null,
        brandLogoScale: (currentBrand.brandLogoScale as number) ?? 1,
        brandLogoOffsetX: (currentBrand.brandLogoOffsetX as number) ?? 0,
        brandLogoOffsetY: (currentBrand.brandLogoOffsetY as number) ?? 0,
        heroCover: form.heroCoverId,
      },
    } as never,
  })
  return { ok: true }
}
