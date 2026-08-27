'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'
import type { BgForm, DesignForm } from './design-types'

/** The values `style.font` is allowed to hold in the database. */
const LEGACY_FONT_IDS = new Set(['default', 'modern', 'editorial', 'elegant', 'bold'])

const toBg = (b: BgForm) => ({
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
      // `style.font` is a select whose options once drifted from the editor's
      // list; an unknown value made Payload reject the entire save. Only ever
      // send a value the schema knows, and let the two new fields carry the
      // real choice.
      style: {
        ...form.style,
        font: LEGACY_FONT_IDS.has(form.style.font) ? form.style.font : 'default',
      },
      themeConfig: { components: form.components },
      heroCover: {
        size: form.heroCover.size,
        posX: form.heroCover.posX,
        posY: form.heroCover.posY,
        overlay: form.heroCover.overlay,
        overlayLight: form.heroCover.overlayLight,
        height: form.heroCover.height,
        gradient: form.heroCover.gradient,
      },
      brand: {
        photo: brandRel(currentBrand.photo) as number | null,
        avatar: brandRel(currentBrand.avatar) as number | null,
        brandLogo: form.brandLogoId,
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
