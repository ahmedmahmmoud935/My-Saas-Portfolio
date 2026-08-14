'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'
import type { BgForm, DesignForm } from './design-types'

const toBg = (b: BgForm) => ({
  preset: b.preset,
  type: b.type,
  color1: b.color1,
  color2: b.color2,
  color3: b.color3,
  image: b.imageId ?? null,
  imageFixed: b.imageFixed,
  dim: b.dim,
})

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
      // The editor carries the resolved image URL for previewing; only the id
      // belongs in the document.
      background: toBg(form.background),
      backgroundLight: toBg(form.backgroundLight),
      sectionBg: form.sectionBg
        .filter((s) => s.section)
        .map((s) => ({
          theme: s.theme || 'dark',
          section: s.section,
          mode: s.mode,
          color: s.color,
          image: s.imageId ?? null,
          videoUrl: s.videoUrl,
          fixed: s.fixed,
          dim: s.dim,
        })),
      style: form.style,
      themeConfig: { components: form.components },
      heroCover: {
        size: form.heroCover.size,
        posX: form.heroCover.posX,
        posY: form.heroCover.posY,
        overlay: form.heroCover.overlay,
        height: form.heroCover.height,
        gradient: form.heroCover.gradient,
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
